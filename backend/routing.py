"""Deterministic routing over the same simulated graph as the browser."""
import heapq
from itertools import count
import json
from pathlib import Path
from uuid import uuid4

DATA_PATH = Path(__file__).resolve().parents[1] / 'codebase' / 'campus-data.json'


def load_data():
    return json.loads(DATA_PATH.read_text())


def permitted(edge, preference):
    if not edge.get('accessible', True) or edge.get('accessStatus') != 'open':
        return False
    env = edge.get('environment', 'unknown')
    if preference == 'indoor_only':
        return env == 'indoor'
    if preference == 'sheltered_only':
        return env in ('indoor', 'covered_outdoor')
    return True


def shortest(data, position, destination, preference='shortest'):
    nodes = {n['id']: n for n in data['nodes']}
    edges = {e['id']: e for e in data['edges']}
    if destination not in nodes:
        raise ValueError('unknown_destination')
    adjacency = {n: [] for n in nodes}
    for e in edges.values():
        if permitted(e, preference):
            adjacency[e['from']].append((e['to'], e, 0., 1.))
            if not e.get('oneWay', False) and e.get('bidirectional', True):
                adjacency[e['to']].append((e['from'], e, 1., 0.))
    if position['kind'] == 'node':
        start = position['nodeId']
        if start not in nodes:
            raise ValueError('unknown_position')
    else:
        e = edges.get(position.get('edgeId'))
        offset = position.get('offset')
        if not e or not isinstance(offset, (float, int)) or isinstance(offset, bool) or not 0 <= offset <= 1:
            raise ValueError('invalid_edge_position')
        if e.get('transition') and e.get('transition') not in ('walk', 'none'):
            raise ValueError('position_on_transition')
        if not permitted(e, preference):
            return None
        start = '__origin__'
        adjacency[start] = [(e['to'], e, offset, 1.)]
        if not e.get('oneWay', False) and e.get('bidirectional', True):
            adjacency[start].append((e['from'], e, offset, 0.))
    serial = count()
    queue = [(0., 0., start, next(serial), 0., 0., [], [start])]
    best = {}
    while queue:
        rank1, rank2, node, _, exposed, cost, segments, ids = heapq.heappop(queue)
        score = (rank1, rank2)
        if node in best and best[node] <= score:
            continue
        best[node] = score
        if node == destination:
            return {'nodeIds': [n for n in ids if n != '__origin__'], 'segments': segments, 'totalCost': cost, 'rankExposure': exposed}
        for nxt, edge, a, b in adjacency[node]:
            length = edge['cost'] * abs(b-a)
            exposure = length if edge['environment'] in ('exposed', 'unknown') else 0
            rank = (exposed+exposure,cost+length) if preference=='prefer_sheltered' else (cost+length,exposed+exposure)
            if nxt in best and best[nxt] <= rank:
                continue
            segment = {'edgeId': edge['id'], 'from': edge['from'] if a == 0 else edge['to'] if a == 1 else None, 'to': nxt,
                       'fromOffset': a, 'toOffset': b, 'cost': length, 'environment': edge['environment'], 'transition': edge.get('transition')}
            heapq.heappush(queue, (*rank, nxt, next(serial), exposed+exposure, cost+length, segments+[segment], ids+[nxt]))
    return None


def plan_trip(data, position, destination=None, via_water=False, preference='shortest', excluded=()):
    active = [p for p in data['waterPoints'] if p['status'] == 'active' and p['id'] not in excluded]
    need_water = via_water or destination is None
    if need_water and not active:
        return {'status': 'no_available', 'route': None}
    candidates = active if need_water else [None]
    choices = []
    for point in candidates:
        target = point['nodeId'] if point else destination
        first = shortest(data, position, target, preference)
        if first is None:
            continue
        if point and destination and target != destination:
            second = shortest(data, {'kind': 'node', 'nodeId': target}, destination, preference)
            if second is None:
                continue
            first = {'nodeIds': first['nodeIds'] + second['nodeIds'][1:], 'segments': first['segments'] + second['segments'],
                     'totalCost': first['totalCost']+second['totalCost'], 'rankExposure': first['rankExposure']+second['rankExposure']}
        choices.append((first['rankExposure'], first['totalCost'], point['id'] if point else '', first, point))
    if not choices:
        return {'status': 'no_route_under_constraints' if preference in ('indoor_only', 'sheltered_only') else 'no_route', 'route': None}
    _, _, _, route, point = min(choices, key=lambda x: x[:3] if preference=='prefer_sheltered' else (x[1],x[0],x[2]))
    exposure = {key: sum(s['cost'] for s in route['segments'] if s['environment'] == key) for key in ('indoor','covered_outdoor','exposed','unknown')}
    route.pop('rankExposure')
    route.update(id='route-'+uuid4().hex[:12], origin=position, originId=position.get('nodeId'),
                 destinationId=destination or point['nodeId'], destinationPointId=point['id'] if point else None,
                 waypointIds=[point['nodeId']] if point and destination else [], totalCost=round(route['totalCost'], 3),
                 costUnit='simulation_units', dataVersion=data['dataVersion'], preferenceApplied=preference,
                 exposureSummary=exposure, arrivalFeasibility='unknown')
    route.update(routeId=route['id'],cost=route['totalCost'],waterPointId=route['destinationPointId'],provenance='simulated',distanceMeters=None,durationSeconds=None)
    return {'status': 'ok', 'route': route}
