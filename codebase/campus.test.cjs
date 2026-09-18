const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync(__dirname+'/campus-data.json','utf8'));
const handlers={},winHandlers={},docHandlers={},frames=new Map();
let nextFrame=0,fetchAgent=async()=>{throw Error('offline');},renders=0;
const app={_html:'',get innerHTML(){return this._html;},set innerHTML(value){renders++;this._html=value;},addEventListener:(name,fn)=>handlers[name]=fn,querySelector:()=>null};
const window={addEventListener:(name,fn)=>winHandlers[name]=fn,requestAnimationFrame:fn=>{frames.set(++nextFrame,fn);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id),setTimeout,clearTimeout};
const document={hidden:false,getElementById:id=>id==='app'?app:null,addEventListener:(name,fn)=>docHandlers[name]=fn};
const ctx=vm.createContext({window,document,console,AbortController,fetch:async(url,options)=>url==='campus-data.json'?{ok:true,json:async()=>data}:fetchAgent(url,options)});
for(const file of ['navigation.js','campus-map.js','campus-app.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const D=window.VmapDemo,N=window.VmapNavigation,M=window.CampusMap;
const click=dataset=>handlers.click({target:{closest:()=>({dataset})}});
function frame(time){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));}
const snapshot=()=>JSON.stringify(D.state.position);
(async()=>{
await D.ready;
assert.equal(D.state.ready,true);
D.find();assert.equal(D.state.journey,null,'Initial location must be explicitly selected');
D.setPosition('west_gate');D.find();
assert.equal(D.state.journey.motion,'idle');const start=snapshot();frame(500);assert.equal(snapshot(),start,'Start must not autoplay');
const before=renders;D.startMotion(1);frame(1000);frame(1020);
assert.equal(D.state.position.kind,'edge');assert.equal(renders,before,'Movement must not rebuild DOM each frame');
const edge=snapshot();D.stop();frame(1100);assert.equal(snapshot(),edge,'Release stops motion');
const keyEvent=key=>({key,repeat:false,target:{matches:()=>false},preventDefault(){}});
winHandlers.keydown(keyEvent('ArrowUp'));frame(1200);frame(1220);winHandlers.keyup(keyEvent('ArrowUp'));
const keyStopped=snapshot();frame(1240);assert.equal(snapshot(),keyStopped,'Releasing keyboard stops motion');
winHandlers.keydown(keyEvent('ArrowUp'));winHandlers.keydown(keyEvent('ArrowDown'));frame(1260);assert.equal(snapshot(),keyStopped,'Opposite held keys stop movement');
handlers.pointerdown({target:{closest:()=>({dataset:{motion:'1'},setPointerCapture(){}})},pointerId:1,preventDefault(){}});
frame(1300);frame(1320);handlers.pointercancel();const pointerStopped=snapshot();frame(1340);assert.equal(snapshot(),pointerStopped,'Pointer cancellation stops movement');
const zoom=D.state.zoom=2;D.startMotion(1);frame(2000);frame(2020);winHandlers.blur();const blurred=snapshot();frame(2040);assert.equal(snapshot(),blurred);assert.equal(D.state.zoom,zoom);
D.startMotion(1);frame(3000);frame(3020);document.hidden=true;docHandlers.visibilitychange();const hidden=snapshot();frame(3040);assert.equal(snapshot(),hidden);document.hidden=false;
const at=snapshot();click({floor:'2'});assert.equal(snapshot(),at,'Floor preview never moves player');
D.state.destinationId='d_entrance';D.state.viaWater=false;D.find();assert.equal(snapshot(),at,'Reroute preserves fractional edge position');
D.state.destinationId='water';D.state.excludedPointIds=data.waterPoints.filter(p=>p.nodeId!=='water').map(p=>p.id);D.setPosition('west_gate');D.find();
let transitions=0;
for(let i=0;i<100 && D.state.journey.motion!=='arrived';i++){
 N.advance(D.state.journey,10000);D.state.position=N.position(D.state.journey);
 if(D.state.journey.pending){transitions++;const frozen=JSON.stringify(D.state.position);N.advance(D.state.journey,100);assert.equal(JSON.stringify(N.position(D.state.journey)),frozen);D.confirmStop();}
}
assert.ok(transitions>=2,'Door and stairs both require confirmation');assert.equal(D.state.journey.motion,'arrived');D.stop();assert.match(D.instruction(),/Đã tới đích/);
N.advance(D.state.journey,-10000);assert.equal(D.state.journey.pending?.type,'transition','Reverse requires transition confirmation');
D.confirmStop();
D.state.excludedPointIds=[];D.setPosition('west_gate');D.state.destinationId='d_entrance';D.state.viaWater=true;D.find();
let waypoint=false;
for(let i=0;i<100&&D.state.journey.motion!=='arrived';i++){N.advance(D.state.journey,10000);if(D.state.journey.pending){waypoint ||= D.state.journey.pending.type==='waypoint';D.confirmStop();}}
assert.equal(waypoint,true,'Water stop must require confirmation');
assert.equal(D.state.viaWater,false,'Collected water must not be added again during a later reroute');
assert.ok(Object.values(D.context().journey.waypointsConfirmed).some(Boolean),'Agent receives consumed waypoint state');
assert.equal(D.context().journey.segmentIndex,D.state.journey.segmentIndex);
D.setPosition('west_gate');D.state.destinationId='water';D.state.viaWater=false;D.find();D.startMotion(1);frame(4000);frame(4020);
click({action:'chat'});const paused=snapshot();frame(4040);assert.equal(snapshot(),paused);click({action:'close-chat'});frame(4060);assert.equal(snapshot(),paused,'Closing chat cannot resume movement');
const routesBefore=snapshot();await D.ask('<img src=x onerror=alert(1)>');assert.match(D.state.answer,/Không kết nối/);assert.ok(!app.innerHTML.includes('<img src=x'));assert.equal(snapshot(),routesBefore);
let resolveRequest,request;
fetchAgent=(_url,options)=>{request=JSON.parse(options.body);return new Promise(resolve=>{resolveRequest=resolve;});};
const promise=D.ask('Tới D');D.setPosition('south_gate');
resolveRequest({ok:true,json:async()=>({requestId:request.requestId,contextVersion:request.contextVersion,message:'STALE',contextPatch:{destinationId:'d_entrance'}})});await promise;
assert.notEqual(D.state.answer,'STALE','Stale response discarded');
D.state.showAssistant=false;D.state.destinationId='water';D.state.excludedPointIds=[];D.find();
click({action:'report'});assert.equal(D.state.excludedPointIds.length,0,'Reporting requires confirmation');
click({action:'confirm-local'});assert.equal(D.state.excludedPointIds.length,1);
const excluded=JSON.stringify(D.state.excludedPointIds),position=snapshot();click({action:'stop-route'});assert.equal(snapshot(),position);assert.equal(JSON.stringify(D.state.excludedPointIds),excluded);
click({action:'report'});assert.equal(D.state.confirmation.type,'report_select','Without an active water stop the user selects a point');
click({action:'confirm-local'});assert.equal(JSON.stringify(D.state.excludedPointIds),excluded,'Ambiguous report cannot exclude an arbitrary point');
click({reportPoint:data.waterPoints.find(p=>!D.state.excludedPointIds.includes(p.id)).id});assert.equal(D.state.confirmation.type,'report');
click({action:'cancel-local'});
for(const floor of ['campus','1','2']){const html=M.render({floor,position:D.state.position,zoom:1});assert.match(html,/<svg/);assert.ok(!html.includes('NaN'));}
assert.ok(!app.innerHTML.includes('4.9'));assert.ok(!app.innerHTML.includes('120 m'));
console.log('PASS campus UI: explicit origin, idle start, continuous hold/release, no frame rerender, blur/tab/chat stops, fractional reroute, bidirectional transitions, water stop, network fallback, stale responses, report confirmation, retained session and escaping (mock DOM/API; no browser).');
})().catch(error=>{console.error(error);process.exitCode=1;});
