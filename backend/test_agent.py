import copy
import pytest
from fastapi.testclient import TestClient
from backend.app import app
from backend.agent import run_agent
from backend.routing import load_data, plan_trip
from eval.run_eval import evaluate


@pytest.fixture(autouse=True)
def mode(monkeypatch):
    monkeypatch.setenv('VMAP_AGENT_MODE','mock')
    monkeypatch.setenv('VMAP_RATE_LIMIT','1000')


def request(message='Tìm nước'):
    return {'requestId':'test','message':message,'contextVersion':1,'context':{'position':{'kind':'node','nodeId':'west_gate'},'positionConfirmed':True,'excludedPointIds':[]}}


def test_golden():
    result=evaluate()
    assert result['passed']==result['total'],[(r['id'],r['reason']) for r in result['results'] if not r['passed']]


def test_confirmation_and_report():
    req=request('Tôi ở cửa E')
    first=run_agent(req)
    assert 'position' not in first['contextPatch']
    req['context'].update(first['contextPatch'])
    req['action']={'type':'confirm_location','nodeId':'e_entrance'}
    second=run_agent(req)
    assert second['contextPatch']['position']['nodeId']=='e_entrance'
    req=request('Máy nước hỏng')
    first=run_agent(req)
    req['context'].update(first['contextPatch'])
    req['action']={'type':'confirm_report','pointId':'water_d'}
    selected=run_agent(req)
    assert 'excludedPointIds' not in selected['contextPatch']
    req['context'].update(selected['contextPatch'])
    result=run_agent(req)
    assert result['contextPatch']['excludedPointIds']==['water_d']
    assert result['route']['destinationPointId']!='water_d'


def test_provider_missing(monkeypatch):
    monkeypatch.delenv('VMAP_AGENT_MODE')
    assert run_agent(request())['error']['code']=='provider_not_configured'


def test_provider_auth_error(monkeypatch):
    import httpx
    monkeypatch.setenv('VMAP_AGENT_MODE', 'live')
    monkeypatch.setenv('VMAP_MODEL', 'Test')
    monkeypatch.setenv('VMAP_MODEL_BASE_URL', 'http://127.0.0.1:20128/v1')
    monkeypatch.setattr(httpx, 'post', lambda *a, **k: httpx.Response(401))
    result = run_agent(request())
    assert result['error'] == {'code': 'provider_auth_error', 'retryable': False}
    assert result['providerMode'] == 'live'
    assert result['route'] is None


@pytest.mark.parametrize('bad',[{'evil':True}, {'intent':'find_water','candidateNodeIds':['invented']}, 'not JSON'])
def test_invalid_model(monkeypatch,bad):
    import json
    import httpx
    monkeypatch.setenv('VMAP_AGENT_MODE','live')
    monkeypatch.setenv('VMAP_MODEL','fixture')
    monkeypatch.setenv('VMAP_MODEL_BASE_URL','https://example.invalid/v1')
    monkeypatch.setattr(httpx,'post',lambda *a,**k:httpx.Response(200,request=httpx.Request('POST','https://example.invalid'),json={'choices':[{'message':{'content':json.dumps(bad) if isinstance(bad,dict) else bad}}]}))
    result=run_agent(request())
    assert result['status']=='error' and result['route'] is None


def test_mid_edge():
    data=load_data()
    p={'kind':'edge','edgeId':'west_gate__d_walk','offset':.4}
    route=plan_trip(data,p)['route']
    assert route['origin']==p and route['segments'][0]['fromOffset']==.4


@pytest.mark.parametrize('patch',[
    {'position':[],'positionConfirmed':True}, {'position':'bad'},
    {'excludedPointIds':'water_d'}, {'route':{'segments':[{}]}},
    {'route':[]}, {'pendingClarification':{'candidateNodeIds':42}},
    {'weatherContext':'rain'}, {'viaWater':'yes'}, {'journey':'bad'},
])
def test_malformed_context(patch):
    req=request(); req['context'].update(patch)
    result=run_agent(req)
    assert result['status']=='error' and result['error']['code']=='invalid_context'


def test_plain_clarification_preserves_destination():
    req=request('Tôi ở cổng trường, tới tòa D lấy nước')
    first=run_agent(req)
    req['context'].update(first['contextPatch']); req['message']='cổng Tây'
    second=run_agent(req)
    assert second['status']=='clarify'
    assert second['contextPatch']['pendingClarification']['parsed']['destinationMention']=='D'
    req['context'].update(second['contextPatch'])
    req['action']={'type':'confirm_location','nodeId':'west_gate'}
    result=run_agent(req)
    assert result['status']=='ok' and result['route']['destinationId']=='d_entrance'


def test_next_step_uses_confirmed_route():
    req=request('giờ đi đâu tiếp')
    route=plan_trip(load_data(),req['context']['position'],'d_entrance',True)['route']
    req['context']['route']=route
    result=run_agent(req)
    assert result['route'] is None
    trace=next(t for t in result['trace'] if t['tool']=='get_next_step')
    assert trace['result']['edgeId']==route['segments'][0]['edgeId']


def test_next_step_arrival_and_water_pause():
    req=request('giờ đi đâu tiếp')
    route=plan_trip(load_data(),req['context']['position'],'d_entrance',True)['route']
    req['context'].update(route=route,position={'kind':'node','nodeId':route['destinationId']},journey={'segmentIndex':len(route['segments'])-1,'offset':1})
    result=run_agent(req)
    assert 'đã tới đích' in result['message']
    req['context']['journey']['pending']={'type':'waypoint'}
    result=run_agent(req)
    assert 'xác nhận đã lấy nước' in result['message']


def test_live_parser_with_fake_transport(monkeypatch):
    import httpx
    monkeypatch.setenv('VMAP_AGENT_MODE','live')
    monkeypatch.setenv('VMAP_MODEL','fixture')
    monkeypatch.setenv('VMAP_MODEL_BASE_URL','https://example.invalid/v1')
    monkeypatch.setattr(httpx,'post',lambda *a,**k:httpx.Response(200,request=httpx.Request('POST','https://example.invalid'),json={'choices':[{'message':{'content':'{"intent":"find_water"}'}}]}))
    result=run_agent(request())
    assert result['status']=='ok' and result['providerMode']=='live'


def test_live_tool_calling_loop(monkeypatch):
    import httpx
    monkeypatch.setenv('VMAP_AGENT_MODE','live')
    monkeypatch.setenv('VMAP_MODEL','fixture')
    monkeypatch.setenv('VMAP_MODEL_BASE_URL','https://example.invalid/v1')
    calls={'n':0}
    def fake(url, **kwargs):
        calls['n']+=1
        if 'tools' not in kwargs.get('json',{}):
            raise AssertionError('tools missing from request')
        if calls['n']==1:
            return httpx.Response(200,request=httpx.Request('POST',url),json={'choices':[{'message':{'content':None,
                'tool_calls':[{'id':'call_1','type':'function','function':{'name':'resolve_location','arguments':'{"locationMention":"cổng Tây"}'}}]}}]})
        return httpx.Response(200,request=httpx.Request('POST',url),json={'choices':[{'message':{'content':'{"intent":"find_water"}'}}]})
    monkeypatch.setattr(httpx,'post',fake)
    result=run_agent(request('Tôi ở cổng Tây'))
    assert calls['n']==2
    assert result['status']=='ok'
    labels=[t['tool'] for t in result['trace']]
    assert 'resolve_location' in labels and 'parse_intent' in labels


def test_tool_calling_disabled(monkeypatch):
    import httpx
    monkeypatch.setenv('VMAP_AGENT_MODE','live')
    monkeypatch.setenv('VMAP_MODEL','fixture')
    monkeypatch.setenv('VMAP_MODEL_BASE_URL','https://example.invalid/v1')
    monkeypatch.setenv('VMAP_TOOL_CALLING','off')
    def fake(url, **kwargs):
        assert 'tools' not in kwargs.get('json',{})
        return httpx.Response(200,request=httpx.Request('POST',url),json={'choices':[{'message':{'content':'{"intent":"find_water"}'}}]})
    monkeypatch.setattr(httpx,'post',fake)
    result=run_agent(request())
    assert result['status']=='ok'


def test_tool_loop_repeat_resolves(monkeypatch):
    import httpx
    monkeypatch.setenv('VMAP_AGENT_MODE','live')
    monkeypatch.setenv('VMAP_MODEL','fixture')
    monkeypatch.setenv('VMAP_MODEL_BASE_URL','https://example.invalid/v1')
    calls={'n':0}
    def fake(url, **kwargs):
        calls['n']+=1
        if calls['n']<=2:
            assert 'tools' in kwargs.get('json',{})
        tool_call={'id':'call_'+str(calls['n']),'type':'function','function':{'name':'get_weather_context','arguments':'{}'}}
        if calls['n'] in (1,2):
            return httpx.Response(200,request=httpx.Request('POST',url),json={'choices':[{'message':{'content':None,'tool_calls':[tool_call]}}]})
        return httpx.Response(200,request=httpx.Request('POST',url),json={'choices':[{'message':{'content':'{"intent":"find_water"}'}}]})
    monkeypatch.setattr(httpx,'post',fake)
    result=run_agent(request())
    assert result['status']=='ok'
    executed=[t for t in result['trace'] if t['tool']=='get_weather_context' and t['result'].get('ok')]
    assert len(executed)==1
    assert 'tool_loop_repeat' in [t['tool'] for t in result['trace']]
    assert calls['n']==3


def test_forced_json_tool_echo_retries(monkeypatch):
    import httpx
    monkeypatch.setenv('VMAP_AGENT_MODE','live')
    monkeypatch.setenv('VMAP_MODEL','fixture')
    monkeypatch.setenv('VMAP_MODEL_BASE_URL','https://example.invalid/v1')
    calls={'n':0}
    def fake(url, **kwargs):
        calls['n']+=1
        if calls['n']<=2:
            assert 'tools' in kwargs.get('json',{})
        tool_call={'id':'call_'+str(calls['n']),'type':'function','function':{'name':'get_weather_context','arguments':'{}'}}
        if calls['n'] in (1,2,3):
            return httpx.Response(200,request=httpx.Request('POST',url),json={'choices':[{'message':{'content':None,'tool_calls':[tool_call]}}]})
        return httpx.Response(200,request=httpx.Request('POST',url),json={'choices':[{'message':{'content':'{"intent":"find_water"}'}}]})
    monkeypatch.setattr(httpx,'post',fake)
    result=run_agent(request())
    assert result['status']=='ok'
    assert calls['n']==4


def test_http():
    client=TestClient(app)
    assert client.get('/api/health').json()['agentFramework']=='langgraph'
    assert client.get('/demo.html').status_code==200
    result=client.post('/api/agent',json=request())
    assert result.status_code==200 and result.json()['status']=='ok'
    req=request();req['message']='x'*501
    assert client.post('/api/agent',json=req).status_code==422
    assert client.post('/api/agent',content='x'*9000).status_code==413
