const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const N=require('./navigation.js');
const cases=[];
for(const node of N.data.nodes)for(const preference of ['shortest','prefer_sheltered','indoor_only','sheltered_only'])for(const destinationId of ['D','water'])cases.push({origin:{kind:'node',nodeId:node.id},preference,destinationId,viaWater:destinationId==='D'});
for(const edge of N.data.edges.filter(e=>!e.transition))for(const offset of [.2,.7])cases.push({origin:{kind:'edge',edgeId:edge.id,offset},destinationId:'D',preference:'shortest'});
const script=`import json,sys
from backend.routing import load_data,plan_trip
data=load_data()
out=[]
for c in json.load(sys.stdin):
 d='d_entrance' if c['destinationId']=='D' else None
 out.append(plan_trip(data,c['origin'],d,c.get('viaWater',False),c['preference']))
json.dump(out,sys.stdout)`;
const result=spawnSync('python3',['-c',script],{cwd:require('node:path').resolve(__dirname,'..'),input:JSON.stringify(cases),encoding:'utf8',timeout:15000,maxBuffer:8*1024*1024});
assert.ok(!result.error,result.error?.message);
assert.equal(result.status,0,result.stderr);
const backend=JSON.parse(result.stdout);
cases.forEach((c,i)=>{const a=N.planTrip(c),b=backend[i];assert.equal(a.status==='ok',b.status==='ok',JSON.stringify(c));if(a.status==='ok'){assert.equal(a.destinationId,b.route.destinationId);assert.ok(Math.abs(a.cost-b.route.cost)<.002,JSON.stringify(c));assert.deepEqual(a.segments.map(s=>[s.edgeId,s.fromOffset,s.toOffset]),b.route.segments.map(s=>[s.edgeId,s.fromOffset,s.toOffset]),JSON.stringify(c));}});
console.log(`PASS ${cases.length} shared-dataset frontend/backend route parity cases`);
