'use strict';
(() => {
const M = window.CampusMap, N = window.VmapNavigation, app = document.getElementById('app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = {
  ready:false, position:{kind:'node',nodeId:'west_gate'}, positionConfirmed:false,
  floor:'campus', zoom:1, follow:true, route:null, journey:null, walking:false,
  destinationId:'water', viaWater:false, routePreference:'shortest',
  weatherContext:{condition:'unknown',sourceType:'user',source:'Theo bạn cung cấp'}, excludedPointIds:[],
  contextVersion:0, positionRevision:0, pendingClarification:null,
  showAssistant:false, query:'', answer:'', notice:'', busy:false, actions:[],
  trace:null, providerMode:'unconfigured', confirmation:null, proposedRoute:null,
  chatHistory:[]
};
let requestNumber=0, controller=null, motion=0, frameId=null, lastFrame=null, pointerId=null;
const heldKeys=new Set();
const preferences = {shortest:'Ngắn nhất',prefer_sheltered:'Ưu tiên mái che',indoor_only:'Chỉ trong nhà',sheltered_only:'Chỉ lối có mái che'};
const floorLabel = floor => floor==='campus'?'Toàn trường':`Tòa E · Tầng ${floor}`;
const coords = () => N.coordinates(state.position);
const label = id => M.nodes[id]?.label || id;
const currentLabel = () => !state.positionConfirmed?'Chưa chọn (icon minh họa)':state.position.kind==='node' ? label(state.position.nodeId) : 'Đang ở giữa đoạn đường';
function invalidate(){
  state.contextVersion++; requestNumber++;
  if(controller) controller.abort();
  controller=null; state.busy=false; state.actions=[]; state.proposedRoute=null;
}
function stop(){
  motion=0; heldKeys.clear(); pointerId=null; lastFrame=null;
  if(frameId!==null){window.cancelAnimationFrame(frameId);frameId=null;}
  if(state.journey && !state.journey.pending && !done())state.journey.motion='idle';
}
function syncPosition(){
  if(!state.journey)return;
  state.position=N.position(state.journey);
  state.positionRevision++;
  state.contextVersion++;
}
function done(){return !!state.journey && (!state.route.segments.length || (state.journey.segmentIndex===state.route.segments.length-1 && state.journey.offset===1 && !state.journey.pending));}
function instruction(){
  if(!state.journey)return 'Chọn vị trí và đích đến, rồi bấm Bắt đầu. Giữ Đi tiếp để di chuyển mô phỏng.';
  const pending=state.journey.pending;
  if(pending)return pending.label || pending.message || (pending.type==='waypoint'?'Đã tới điểm lấy nước. Xác nhận lấy nước để tiếp tục.':'Đã tới cửa hoặc cầu thang. Xác nhận để chuyển cảnh.');
  if(done())return 'Đã tới đích trong dữ liệu mẫu. Bạn có thể quay lại hoặc chọn hành trình khác.';
  const segment=state.route.segments[state.journey.segmentIndex];
  return segment ? `Giữ Đi tiếp để tới ${label(segment.to)}. Thả nút để dừng.` : 'Giữ Đi tiếp để đi dọc tuyến gợi ý.';
}
function setPosition(nodeId){
  if(!M.nodes[nodeId])return;
  stop();invalidate();
  state.position={kind:'node',nodeId};state.positionConfirmed=true;
  state.floor=M.nodes[nodeId].floor;state.route=null;state.journey=null;state.walking=false;
  state.confirmation=null;state.pendingClarification=null;state.notice='Đã chọn vị trí mô phỏng.';
  render();
}
function applyRoute(route){
  stop();invalidate();
  if(!route || !Array.isArray(route.segments)){state.notice='Tuyến trả về không hợp lệ. Hãy thử lại.';render();return;}
  // Recompute from the authoritative local graph, never render invented model geometry.
  const checked=N.planTrip({origin:state.position,destinationId:state.destinationId,
    viaWater:route.viaWater ?? state.viaWater,preference:route.preferenceApplied || route.preference || state.routePreference,
    excludedPointIds:state.excludedPointIds});
  if(checked.status!=='ok'){state.notice=checked.message || 'Không còn tuyến phù hợp với dữ liệu hiện tại.';render();return;}
  state.route=checked;state.journey=N.createJourney(checked);state.walking=true;
  state.floor=coords().floor;state.follow=true;state.notice='Đã sẵn sàng. Giữ Đi tiếp để đi; thả nút để dừng.';
  state.showAssistant=false;render();
}
function find(){
  stop();
  if(!state.positionConfirmed){state.notice='Hãy chọn và xác nhận vị trí xuất phát trước.';render();return;}
  const result=N.planTrip({origin:state.position,destinationId:state.destinationId,
    viaWater:state.destinationId!=='water'&&state.viaWater,preference:state.routePreference,
    excludedPointIds:state.excludedPointIds});
  if(result.status!=='ok'){
    invalidate();state.notice=result.message || (result.status.includes('constraint')?'Không có tuyến đáp ứng điều kiện. Bạn có thể tự chọn điều kiện khác.':'Không tìm được tuyến khả dụng trong dữ liệu mẫu.');
    state.route=null;state.journey=null;state.walking=false;render();return;
  }
  applyRoute(result);
}
function tick(now){
  frameId=null;
  if(!motion || !state.journey)return;
  const elapsed=lastFrame===null?0:Math.min(50,Math.max(0,now-lastFrame));lastFrame=now;
  if(elapsed){
    N.advance(state.journey,motion*elapsed*.10);syncPosition();
    if(state.follow)state.floor=coords().floor;
    updateMotionUI();
    if(state.journey.pending || (done() && motion>0)){stop();render();return;}
  }
  if(motion)frameId=window.requestAnimationFrame(tick);
}
function startMotion(direction){
  if(!state.journey || state.busy || state.confirmation)return;
  if(motion && motion!==direction){stop();return;}
  if(state.journey.pending)return;
  if(done() && direction>0)return;
  invalidate();motion=direction;lastFrame=null;state.floor=coords().floor;state.follow=true;
  state.journey.motion=direction>0?'forward':'backward';
  if(frameId===null)frameId=window.requestAnimationFrame(tick);
}
function confirmStop(){
  if(!state.journey?.pending)return;
  const collectedWater=state.journey.pending.type==='waypoint';
  stop();invalidate();N.confirmStop(state.journey);syncPosition();
  if(collectedWater)state.viaWater=false;
  state.floor=coords().floor;render();
}
function progress(){
  if(!state.route)return 0;
  const lengths=state.route.segments.map(s=>s.cost || 0),total=lengths.reduce((a,b)=>a+b,0);
  if(done())return 100;
  const j=state.journey;
  return total?Math.min(100,100*(lengths.slice(0,j.segmentIndex).reduce((a,b)=>a+b,0)+(lengths[j.segmentIndex]||0)*(j.offset||0))/total):0;
}
function centerPlayer(){
  if(!state.follow)return;
  const viewport=document.getElementById('viewport'),svg=viewport?.querySelector('svg'),point=coords();
  if(!viewport || !svg || point.floor!==state.floor)return;
  if(state.zoom<=1 && !state.walking){
    svg.setAttribute('viewBox','0 0 1126 906');
    return;
  }
  const width=1126/state.zoom,height=906/state.zoom;
  const minX=Math.max(0,Math.min(1126-width,point.x-width/2));
  const minY=Math.max(0,Math.min(906-height,point.y-height*.46));
  svg.setAttribute('viewBox',`${minX} ${minY} ${width} ${height}`);
}
function updateMotionUI(){
  const point=coords(),marker=app.querySelector('[data-player]');
  if(marker && point.floor===state.floor)marker.setAttribute('transform',`translate(${point.x} ${point.y})`);
  M.updateProgress?.(app.querySelector('svg'),state.route,state.journey);
  const progressBar=app.querySelector('#route-progress');if(progressBar)progressBar.style.width=progress()+'%';
  const text=app.querySelector('#next-instruction');if(text)text.textContent=instruction();
  centerPlayer();
}
function context(){
  return {position:state.position,positionConfirmed:state.positionConfirmed,viewFloor:state.floor,
    excludedPointIds:[...state.excludedPointIds],destinationId:state.destinationId,viaWater:state.viaWater,
    routePreference:state.routePreference,weatherContext:state.weatherContext,
    pendingClarification:state.pendingClarification,route:state.route,
    journey:state.journey?{segmentIndex:state.journey.segmentIndex,offset:state.journey.offset,
      pending:state.journey.pending,motion:state.journey.motion,
      waypointsConfirmed:{...state.journey.waypointsConfirmed}}:null};
}
async function ask(query,action){
  stop();
  if(state.busy)return;
  query=String(query||'').trim();if(!query&&!action)return;
  state.showAssistant=true;state.query=query;state.busy=true;state.actions=[];state.trace=null;state.notice='';
  if(query)state.chatHistory.push({role:'user',text:query});
  const version=state.contextVersion,revision=state.positionRevision,id=++requestNumber;
  const requestId='turn-'+id;
  controller=new AbortController();
  const requestController=controller;
  const timeout=window.setTimeout(()=>requestController.abort(),17000);
  render();
  try{
    const response=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},
      signal:requestController.signal,body:JSON.stringify({requestId,message:query,contextVersion:version,positionRevision:revision,context:context(),...(action?{action}:{})})});
    const data=await response.json();
    if(id!==requestNumber || version!==state.contextVersion || revision!==state.positionRevision)return;
    if(data.requestId!==requestId || data.contextVersion!==version)throw Error('Phản hồi không khớp lượt hỏi.');
    state.answer=String(data.message || 'Chưa nhận được câu trả lời.');state.actions=Array.isArray(data.actions)?data.actions:[];
    state.chatHistory.push({role:'assistant',text:state.answer});
    state.providerMode=data.providerMode || 'unconfigured';state.trace=data.trace || null;
    const patch=data.contextPatch || {};
    // Only known state keys; server confirmation paths remain explicit.
    for(const key of ['pendingClarification','destinationId','viaWater','routePreference','weatherContext','excludedPointIds']){
      if(Object.prototype.hasOwnProperty.call(patch,key))state[key]=patch[key];
    }
    if(action?.type==='confirm_location' && patch.position){
      state.position=patch.position;state.positionConfirmed=true;state.floor=coords().floor;
      state.journey=null;state.route=null;state.walking=false;state.positionRevision++;state.contextVersion++;
    }
    if(action?.type==='confirm_report'){state.journey=null;state.route=null;state.walking=false;state.contextVersion++;}
    state.proposedRoute=data.route || state.actions.find(a=>a.type==='start_route')?.route || null;
    if(!response.ok || data.status==='error'){
      state.notice='Trợ lý đang lỗi. Bạn vẫn có thể chọn vị trí, đích và Bắt đầu bằng các nút thủ công.';
      if(!state.actions.some(a=>a.type==='retry'))state.actions.push({type:'retry'});
    }
  }catch(error){
    if(id!==requestNumber || version!==state.contextVersion)return;
    state.answer=error.name==='AbortError'?'Yêu cầu quá thời gian. Hãy thử lại.':'Không kết nối được trợ lý. Hãy chạy máy chủ backend và kiểm tra cấu hình AI.';
    state.chatHistory.push({role:'assistant',text:state.answer});
    state.notice='Chỉ đường thủ công vẫn hoạt động với dữ liệu mẫu.';state.actions=[{type:'retry'}];
  }finally{
    window.clearTimeout(timeout);
    if(id===requestNumber){state.busy=false;controller=null;render();}
  }
}
function chatActions(){
  return state.actions.map((a,index)=>{
    const text={start_route:'Bắt đầu tuyến này',confirm_location:'Xác nhận vị trí: '+(a.label||label(a.nodeId)),confirm_report:'Xác nhận báo hỏng: '+(a.label||a.pointId),retry:'Thử lại',cancel_navigation:'Dừng chỉ đường',choose_landmark:'Chọn mốc trên bản đồ'}[a.type];
    return text?`<button class="sugg-chip" data-agent-action="${index}">${esc(text)}</button>`:'';
  }).join('');
}
function pointOptions(){
  const points=N.data?.waterPoints || [];
  return (Array.isArray(points)?points:Object.values(points)).filter(p=>!state.excludedPointIds.includes(p.id));
}
function render(){
  if(!state.ready){app.innerHTML='<div class="boot-status" role="status">Đang tải bản đồ mẫu…</div>';return;}
  const old=document.getElementById('viewport'),scroll=old?{x:old.scrollLeft,y:old.scrollTop}:null;
  const pending=state.journey?.pending,complete=done();
  const nodeOptions=Object.keys(M.nodes).filter(id=>M.starts.includes(id)||id==='d_entrance'||M.nodes[id].floor!=='campus');
  const routeTitle=state.route?label(state.route.destinationId):state.destinationId==='water'?'Tìm điểm nước':'Đến cửa tòa D';
  app.innerHTML=`<main class="gmaps-container split-layout">
    <div class="split-left">
      <div class="gmaps-top-overlay">
        <div class="gmaps-search-bar"><div class="search-brand">💧 Vmap</div><span class="simulation-label">Mô phỏng · dữ liệu mẫu</span></div>
        <div class="gmaps-chips-bar" aria-label="Tầng đang xem">${['campus','1','2'].map(f=>`<button data-floor="${f}" class="g-chip ${state.floor===f?'active':''}" aria-pressed="${state.floor===f}">${floorLabel(f)}</button>`).join('')}</div>
        <div class="view-caption">Đang xem: ${floorLabel(state.floor)} · Vị trí: ${esc(currentLabel())}</div>
      </div>
      <div class="gmaps-viewport" id="viewport"><div class="map-canvas" style="width:${state.follow?100:state.zoom*100}%;height:${state.follow?100:state.zoom*100}%">${M.render({floor:state.floor,position:state.position,route:state.route,journey:state.journey,path:state.route?.nodeIds||[],zoom:1})}</div></div>
      <div class="gmaps-fabs"><button data-action="follow" class="g-fab primary" aria-label="Căn giữa vị trí hiện tại">◎</button><button data-action="zoom" class="g-fab" aria-label="Phóng to">+</button><button data-action="out" class="g-fab" aria-label="Thu nhỏ">−</button></div>
    </div>
    <aside class="split-right" aria-label="Điều khiển và trò chuyện">
      <div class="panel-header">
        <div class="panel-brand"><span class="panel-brand-icon">↗</span> vmap<span class="panel-dot">.</span></div>
        <span class="panel-badge">DEMO</span>
      </div>
      <div class="right-panel-scroll">
        <div class="right-section right-controls">
          <div class="section-label"><span class="section-icon">🧭</span> Hành trình</div>
          <h2 class="right-section-title">${esc(routeTitle)}</h2>
          ${state.journey?`<p id="next-instruction" class="next-instruction">${esc(instruction())}</p><div class="g-progress-bar"><span id="route-progress" style="width:${progress()}%"></span></div>
            <div class="g-btn-row"><button class="g-secondary-btn movement-button" data-motion="-1" ${pending?'disabled':''}>↓ Quay lại</button><button class="g-primary-btn navigating movement-button" data-motion="1" ${pending||complete?'disabled':''}>↑ Giữ Đi tiếp</button></div>
            ${pending?`<button class="g-primary-btn" data-action="confirm-stop">${esc(pending.label||'Xác nhận để tiếp tục')}</button>`:''}
            <p class="control-help">Giữ nút hoặc phím ↑ / ↓; thả để dừng.</p>
            <div class="g-btn-row"><button class="g-secondary-btn" data-action="stop-route">Dừng dẫn đường</button><button class="g-secondary-btn" data-action="report">Báo điểm hỏng</button></div>
          `:`<div class="controls-form">
            <label class="field-label">Bạn đang ở đâu?<select id="origin" class="trip-select"><option value="" ${!state.positionConfirmed?'selected':''}>Chọn vị trí xuất phát</option>${nodeOptions.map(id=>`<option value="${id}" ${state.positionConfirmed&&state.position.nodeId===id?'selected':''}>${esc(label(id))}</option>`).join('')}${state.position.kind==='edge'?'<option value="current" selected>Giữ vị trí giữa đoạn đường hiện tại</option>':''}</select></label>
            <div class="trip-grid"><label class="field-label">Điểm đến<select id="destination" class="trip-select"><option value="water" ${state.destinationId==='water'?'selected':''}>Điểm nước gần nhất</option><option value="d_entrance" ${state.destinationId==='d_entrance'?'selected':''}>Cửa tòa D</option></select></label>
            <label class="field-label">Thời tiết<select id="weather" class="trip-select">${[['unknown','Chưa rõ'],['rain','Đang mưa'],['dry','Không mưa']].map(([id,text])=>`<option value="${id}" ${state.weatherContext.condition===id?'selected':''}>${text}</option>`).join('')}</select></label></div>
            <label class="field-label">Chọn đường<select id="preference" class="trip-select">${Object.entries(preferences).map(([id,text])=>`<option value="${id}" ${state.routePreference===id?'selected':''}>${text}</option>`).join('')}</select></label>
            ${state.destinationId!=='water'?`<label class="checkbox-label"><input type="checkbox" id="via-water" ${state.viaWater?'checked':''}> Ghé lấy nước trước khi đến D</label>`:''}
            <button class="g-primary-btn" data-action="find">Bắt đầu chỉ đường ↗</button>
          </div>`}
          ${state.route?`<p class="route-evidence">${esc(preferences[state.route.preference||state.routePreference])} · ${state.route.waypointIds?.length?'Ghé lấy nước · ':''}Chưa xác minh thực địa.</p>`:''}
          <p class="weather-source">${{rain:'🌧 Mưa',dry:'☀ Không mưa',unknown:'❓ Chưa rõ'}[state.weatherContext.condition]||'❓ Chưa rõ'} · bạn cung cấp</p>
          ${state.confirmation?`<div class="confirmation-box"><p>${esc(state.confirmation.message)}</p><div class="g-btn-row">${state.confirmation.type==='report_select'?pointOptions().map(p=>`<button class="g-secondary-btn" data-report-point="${esc(p.id)}">${esc(p.label||label(p.nodeId))}</button>`).join(''):'<button class="g-primary-btn" data-action="confirm-local">Xác nhận</button>'}<button class="g-secondary-btn" data-action="cancel-local">Hủy</button></div></div>`:''}
          ${state.notice?`<p class="inline-notice" role="status">${esc(state.notice)}</p>`:''}
        </div>
        <div class="right-section right-chat" aria-label="Trợ lý Vmap">
          <div class="section-label"><span class="section-icon">💬</span> Trợ lý Vmap <span class="provider-tag">${state.providerMode==='live'?'AI':state.providerMode==='mock'?'Mô phỏng':'Chưa kết nối'}</span></div>
          <div class="chat-messages" id="chat-messages">
            <div class="chat-welcome">
              <div class="chat-welcome-icon">💧</div>
              <p>Xin chào! Tôi hỗ trợ tìm nước, chọn đường tránh mưa và hướng dẫn chặng tiếp theo.</p>
            </div>
            ${state.chatHistory.map(m=>`<div class="chat-msg ${m.role}"><div class="chat-msg-bubble">${esc(m.text)}</div></div>`).join('')}
            ${state.busy?'<div class="chat-msg assistant"><div class="chat-msg-bubble typing"><span></span><span></span><span></span></div></div>':''}
          </div>
        </div>
      </div>
      <div class="chat-bottom-bar">
        <div class="chat-quick-actions">${state.busy?'':`<button class="sugg-chip" data-action="ask-water">💧 Tìm nước</button><button class="sugg-chip" data-action="ask-next">🧭 Đi đâu tiếp?</button><button class="sugg-chip" data-action="report">⚠ Báo hỏng</button>${chatActions()}`}</div>
        <form id="ask" class="chat-input-bar"><input id="question" class="chat-input" maxlength="500" placeholder="Nhập yêu cầu…" ${state.busy?'disabled':''}><button class="chat-send-btn" ${state.busy?'disabled':''} aria-label="Gửi">↗</button></form>
      </div>
    </aside>
  </main>`;
  const viewport=document.getElementById('viewport');
  if(scroll&&viewport){viewport.scrollLeft=scroll.x;viewport.scrollTop=scroll.y;}
  centerPlayer();
  const chatEl=document.getElementById('chat-messages');
  if(chatEl)chatEl.scrollTop=chatEl.scrollHeight;
}
function report(pointId){
  stop();state.showAssistant=false;
  const points=pointOptions();
  const point=pointId?points.find(p=>p.id===pointId):points.find(p=>p.id===(state.route?.waterPointId||state.route?.destinationPointId) || (state.route?.waypointIds||[]).includes(p.nodeId));
  if(!point && points.length){state.confirmation={type:'report_select',message:'Bạn muốn báo điểm nước nào không hoạt động?'};render();return;}
  if(!point){state.notice='Không còn điểm nước mẫu để báo hỏng.';render();return;}
  state.confirmation={type:'report',pointId:point.id,message:`Loại “${point.label||label(point.nodeId)}” khỏi phiên này vì không hoạt động? Dữ liệu chung sẽ không thay đổi.`};render();
}
app.addEventListener('change',event=>{
  const target=event.target;
  stop();
  if(target.id==='origin'){if(target.value && target.value!=='current')setPosition(target.value);return;}
  if(!['destination','weather','preference','via-water'].includes(target.id))return;
  invalidate();
  if(target.id==='destination')state.destinationId=target.value;
  if(target.id==='weather'){
    state.weatherContext={condition:target.value,sourceType:'user',source:'Theo bạn cung cấp'};
    if(target.value==='rain'&&state.routePreference==='shortest')state.routePreference='prefer_sheltered';
  }
  if(target.id==='preference')state.routePreference=target.value;
  if(target.id==='via-water')state.viaWater=target.checked;
  render();
});
app.addEventListener('submit',event=>{if(event.target.id==='ask'){event.preventDefault();ask(document.getElementById('question').value);}});
app.addEventListener('click',event=>{
  const el=event.target.closest('[data-action],[data-floor],[data-node],[data-building],[data-agent-action],[data-report-point]');
  if(!el || el.disabled)return;
  if(el.dataset.reportPoint){report(el.dataset.reportPoint);return;}
  if(el.dataset.floor){stop();state.floor=el.dataset.floor;state.follow=false;render();return;}
  if(el.dataset.building){stop();if(el.dataset.building==='E'){state.floor='1';state.follow=false;}else state.notice='Chưa có mặt bằng trong nhà tòa này. Tòa D hiện hỗ trợ tới cửa.';render();return;}
  if(el.dataset.node){stop();state.confirmation={type:'location',nodeId:el.dataset.node,message:'Đặt vị trí mô phỏng tại '+label(el.dataset.node)+'?'};render();return;}
  if(el.dataset.agentAction!==undefined){
    const action=state.actions[Number(el.dataset.agentAction)];if(!action)return;
    if(action.type==='start_route'){applyRoute(action.route||state.proposedRoute);return;}
    if(action.type==='confirm_location'||action.type==='confirm_report'){ask('Tôi xác nhận',action);return;}
    if(action.type==='retry'){ask(state.query);return;}
    if(action.type==='cancel_navigation'){stop();invalidate();state.route=null;state.journey=null;state.walking=false;render();return;}
    if(action.type==='choose_landmark'){state.showAssistant=false;state.notice='Chọn mốc xuất phát bên dưới.';render();return;}
  }
  switch(el.dataset.action){
    case 'find':find();return;
    case 'chat':stop();break;
    case 'close-chat':stop();break;
    case 'ask-next':ask('Giờ đi đâu tiếp?');return;
    case 'ask-water':ask('Tìm nước giúp tôi');return;
    case 'follow':stop();state.floor=coords().floor;state.follow=true;break;
    case 'zoom':stop();state.zoom=Math.min(4,state.zoom+.5);break;
    case 'out':stop();state.zoom=Math.max(1,state.zoom-.5);break;
    case 'confirm-stop':confirmStop();return;
    case 'stop-route':stop();invalidate();state.route=null;state.journey=null;state.walking=false;state.notice='Đã dừng; giữ nguyên vị trí và các điểm đã báo hỏng.';break;
    case 'report':report();return;
    case 'cancel-local':state.confirmation=null;break;
    case 'confirm-local':{
      const confirmation=state.confirmation;if(!confirmation)return;
      if(confirmation.type==='location'){setPosition(confirmation.nodeId);return;}
      if(confirmation.type!=='report')return;
      invalidate();state.excludedPointIds=[...new Set([...state.excludedPointIds,confirmation.pointId])];state.confirmation=null;find();return;
    }
  }
  render();
});
app.addEventListener('pointerdown',event=>{
  const button=event.target.closest('[data-motion]');if(!button||button.disabled)return;
  event.preventDefault();
  const direction=Number(button.dataset.motion);
  if(pointerId!==null){stop();return;}
  startMotion(direction);if(motion){pointerId=event.pointerId;button.setPointerCapture?.(event.pointerId);}
});
for(const name of ['pointerup','pointercancel','lostpointercapture'])app.addEventListener(name,stop);
app.addEventListener('pointerleave',event=>{if(event.target.closest?.('[data-motion]'))stop();});
window.addEventListener('keydown',event=>{
  if(event.target.matches?.('input,textarea,select,[contenteditable="true"]'))return;
  if(event.key==='Escape'){stop();return;}
  if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;
  event.preventDefault();
  if(event.repeat)return;
  heldKeys.add(event.key);
  if(heldKeys.size>1){stop();return;}
  startMotion(event.key==='ArrowUp'?1:-1);
});
window.addEventListener('keyup',event=>{if(event.key==='ArrowUp'||event.key==='ArrowDown')stop();});
window.addEventListener('blur',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
app.addEventListener('keydown',event=>{
  if((event.key==='Enter'||event.key===' ')&&event.target.matches?.('svg [role="button"]')){
    event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  }
});
async function bootstrap(){
  render();
  try{
    const response=await fetch('campus-data.json');
    if(!response.ok)throw Error('Không tải được dữ liệu bản đồ');
    const data=await response.json();(N.configure||N.setData)(data);
    M.syncData?.();
    state.ready=true;state.position={kind:'node',nodeId:M.starts[0]};state.floor=coords().floor;render();
  }catch(error){app.innerHTML=`<div class="boot-status" role="alert">Không tải được bản đồ mẫu. Hãy mở qua máy chủ HTTP. <button onclick="location.reload()">Thử lại</button><p>${esc(error.message)}</p></div>`;}
}
window.VmapDemo={state,find,ask,render,instruction,stop,startMotion,confirmStop,setPosition,applyRoute,context,tick,bootstrap};
window.VmapDemo.ready=bootstrap();
})();
