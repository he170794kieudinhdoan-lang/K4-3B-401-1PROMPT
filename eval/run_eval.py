"""Print complete evaluation JSON; never overwrites prior evidence files."""
import copy
import json
import os
import statistics
from pathlib import Path
from backend.agent import run_agent
from backend.routing import load_data, plan_trip


def evaluate():
    suite=json.loads((Path(__file__).parent/'cases.json').read_text(encoding='utf-8'))
    os.environ['VMAP_AGENT_MODE']='mock'
    results=[]
    for case in suite['cases']:
        context={'position':{'kind':'node','nodeId':'west_gate'},'positionConfirmed':True,'excludedPointIds':[]}
        context.update(copy.deepcopy(case.get('context',{})))
        if case.get('routeFixture'):
            context['route']=plan_trip(load_data(),context['position'])['route']
        request={'requestId':case['id'],'message':case['message'],'contextVersion':1,'context':context}
        actual=run_agent(request)
        reasons=[]
        if actual['status']!=case['expected']: reasons.append('status differs')
        route=actual.get('route') or {}
        for key,field in [('point','destinationPointId'),('destination','destinationId'),('preference','preferenceApplied')]:
            if key in case and route.get(field)!=case[key]: reasons.append(key+' differs')
        if case.get('noWater') and route.get('destinationPointId'): reasons.append('unexpected water stop')
        if case.get('covered') and any(route.get('exposureSummary',{}).get(k,0)>0 for k in ('exposed','unknown')): reasons.append('unsheltered segment')
        if case.get('tool') and case['tool'] not in [t['tool'] for t in actual['trace']]: reasons.append('tool missing')
        if 'weather' in case and actual.get('weatherContext',{}).get('condition')!=case['weather']: reasons.append('weather differs')
        if 'arrival' in case and actual.get('arrivalFeasibility')!=case['arrival']: reasons.append('arrival differs')
        results.append({'id':case['id'],'input':request,'expected':case,'actual':actual,'passed':not reasons,'reason':'; '.join(reasons) or 'Expected status and declared route/tool invariants match'})
    durations=sorted(r['actual']['elapsedMs'] for r in results)
    groups={}
    for prefix,name in (('C','core'),('E','extended')):
        subset=[r for r in results if r['id'].startswith(prefix)]
        groups[name]={'passed':sum(r['passed'] for r in subset),'total':len(subset)}
    return {'providerMode':'mock','liveAI':False,'passed':sum(r['passed'] for r in results),'total':len(results),'medianMs':statistics.median(durations),'p95Ms':durations[int(.95*(len(durations)-1))],'groupSummary':groups,'results':results}


if __name__=='__main__':
    print(json.dumps(evaluate(),ensure_ascii=False,indent=2))
