'use strict';
(() => {
const M = window.CampusMap, N = window.VmapNavigation, app = document.getElementById('app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatMsg = text => esc(text)
  .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
  .replace(/~~(.+?)~~/g,'<s>$1</s>')
  .replace(/^[-•]\s+(.+)$/gm,'<span class="chat-li">$1</span>')
  .replace(/\n/g,'<br>');
const state = {
  ready:false, position:{kind:'node',nodeId:'west_gate'}, positionConfirmed:false,
  floor:'campus', zoom:1, follow:true, route:null, journey:null, walking:false,
  destinationId:'water', viaWater:false, routePreference:'shortest',
  weatherContext:{condition:'unknown',sourceType:'user',source:'Theo bạn cung cấp'}, excludedPointIds:[],
  contextVersion:0, positionRevision:0, pendingClarification:null,
  showAssistant:false, query:'', answer:'', notice:'', busy:false, actions:[],
  trace:null, providerMode:'unconfigured', confirmation:null, proposedRoute:null,
  chatHistory:[], tripOpen:false
};
let requestNumber=0, controller=null, motion=0, frameId=null, lastFrame=null, pointerId=null;
const heldKeys=new Set();
const preferences = {shortest:'Ngắn nhất',prefer_sheltered:'Ưu tiên mái che',indoor_only:'Chỉ trong nhà',sheltered_only:'Chỉ lối có mái che'};
const floorLabel = floor => floor==='campus'?'Toàn trường':`Tòa E · Tầng ${floor}`;
const providerLabel = () => state.providerMode==='live'?'AI thật':state.providerMode==='mock'?'Mô phỏng':'Chưa kết nối';
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
  if(!state.journey)return 'Chọn vị trí và đích đến, rồi bấm Bắt đầu. Giữ Đi tiếp để đi trên bản đồ mẫu.';
  const pending=state.journey.pending;
  if(pending)return pending.type==='waypoint'?'Tới điểm lấy nước — xác nhận rồi đi tiếp.':'Tới cửa / cầu thang — xác nhận rồi đi tiếp.';
  if(done())return 'Đã tới đích trên bản đồ mẫu.';
  const segment=state.route.segments[state.journey.segmentIndex];
  return segment ? `Tiếp theo: ${label(segment.to)}` : 'Giữ Đi tiếp để đi dọc tuyến.';
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
  const checked=N.planTrip({origin:state.position,destinationId:state.destinationId,
    viaWater:route.viaWater ?? state.viaWater,preference:route.preferenceApplied || route.preference || state.routePreference,
    excludedPointIds:state.excludedPointIds});
  if(checked.status!=='ok'){state.notice=checked.message || 'Không còn tuyến phù hợp với dữ liệu hiện tại.';render();return;}
  state.route=checked;state.journey=N.createJourney(checked);state.walking=true;
  state.floor=coords().floor;state.follow=true;state.notice='';
  state.showAssistant=false;state.tripOpen=false;render();
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
function historyPayload(){
  return state.chatHistory.filter(m=>m.role==='user'||m.role==='assistant').slice(-8).map(m=>({
    role:m.role, text:String(m.text||'').trim().slice(0,400)
  })).filter(m=>m.text);
}
function takeLocalShortcut(query){
  const n=query.trim().toLowerCase();
  if(!/^(ok|okay|oke|được|duoc|ừ|u|yes|bắt đầu|bat dau|đi thôi|di thoi|đi đi|di di)$/i.test(n))return false;
  const route=state.proposedRoute || state.actions.find(a=>a.type==='start_route')?.route;
  if(!route)return false;
  state.chatHistory.push({role:'user',text:query},{role:'assistant',text:'Đã mở tuyến trên bản đồ. Giữ **Đi tiếp** để đi; thả để dừng.'});
  applyRoute(route);
  return true;
}
async function ask(query,action){
  stop();
  if(state.busy)return;
  query=String(query||'').trim();if(!query&&!action)return;
  if(!action && takeLocalShortcut(query))return;
  const history=historyPayload();
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
      signal:requestController.signal,body:JSON.stringify({requestId,message:query,contextVersion:version,positionRevision:revision,context:context(),history,...(action?{action}:{})})});
    const data=await response.json();
    if(id!==requestNumber || version!==state.contextVersion || revision!==state.positionRevision)return;
    if(data.requestId!==requestId || data.contextVersion!==version)throw Error('Phản hồi không khớp lượt hỏi.');
    state.answer=String(data.message || 'Chưa nhận được câu trả lời.');state.actions=Array.isArray(data.actions)?data.actions:[];
    state.chatHistory.push({role:'assistant',text:state.answer,actions:state.actions});
    state.providerMode=data.providerMode || 'unconfigured';state.trace=data.trace || null;
    const patch=data.contextPatch || {};
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
    state.chatHistory.push({role:'assistant',text:state.answer,actions:[{type:'retry'}]});
    state.notice='Chỉ đường thủ công vẫn hoạt động với dữ liệu mẫu.';state.actions=[{type:'retry'}];
  }finally{
    window.clearTimeout(timeout);
    if(id===requestNumber){state.busy=false;controller=null;render();}
  }
}
function actionClass(type){
  if(type==='start_route'||type==='confirm_location')return 'nb-button green';
  if(type==='confirm_report'||type==='retry')return 'nb-button orange';
  if(type==='cancel_navigation')return 'nb-button pale-red';
  return 'nb-button pale-cyan';
}
function actionLabel(a){
  if(a.type==='suggest')return a.text;
  return {start_route:'Bắt đầu tuyến này',confirm_location:'Xác nhận: '+(a.label||label(a.nodeId)),confirm_report:'Báo hỏng: '+(a.label||a.pointId),retry:'Thử lại',cancel_navigation:'Dừng chỉ đường',choose_landmark:'Chọn mốc trên bản đồ'}[a.type];
}
function visibleActions(actions){
  return (actions||[]).filter(a=>!(a.type==='start_route'&&state.journey));
}
function renderActions(actions,extraClass){
  return visibleActions(actions).map((a,index)=>{
    const text=actionLabel(a);
    return text?`<button class="${actionClass(a.type)} ${extraClass||''}" data-agent-action="${state.actions.indexOf(a)}">${esc(text)}</button>`:'';
  }).join('');
}
function starterChips(){
  if(state.busy)return '';
  const last=[...state.chatHistory].reverse().find(m=>m.role==='assistant'&&visibleActions(m.actions).length);
  if(last)return renderActions(last.actions,'sugg-chip');
  if(visibleActions(state.actions).length)return renderActions(state.actions,'sugg-chip');
  const chips=!state.positionConfirmed
    ?[['Tôi ở cổng Tây','Tôi ở cổng Tây'],['Tôi ở Central Square','Tôi ở Central Square'],['Bạn làm được gì?','Bạn làm được gì?']]
    :state.route
      ?[['Đi đâu tiếp?','Giờ đi đâu tiếp?'],['Còn bao xa?','Còn bao xa?'],['Vì sao chọn điểm này?','Vì sao chọn điểm này?']]
      :[['Tìm nước gần nhất','Tìm nước gần nhất'],['Liệt kê điểm nước','Liệt kê các điểm nước'],['Tới tòa D','Tới tòa D'],['Trời mưa','Trời mưa, tìm nước ưu tiên mái che']];
  return chips.map(([label,q])=>`<button class="nb-button pale-cyan sugg-chip" data-ask="${esc(q)}">${esc(label)}</button>`).join('');
}
function pointOptions(){
  const points=N.data?.waterPoints || [];
  return (Array.isArray(points)?points:Object.values(points)).filter(p=>!state.excludedPointIds.includes(p.id));
}
function placeholder(){
  if(!state.positionConfirmed)return 'Ví dụ: Tôi ở cổng Tây, tìm nước…';
  if(state.route)return 'Hỏi chặng tiếp, còn bao xa, hoặc đổi điểm…';
  return 'Ví dụ: Tôi khát / Tới tòa D / Liệt kê điểm nước';
}
function render(){
  if(!state.ready){app.innerHTML='<div class="boot-status" role="status">Đang tải bản đồ mẫu…</div>';return;}
  const old=document.getElementById('viewport'),scroll=old?{x:old.scrollLeft,y:old.scrollTop}:null;
  const pending=state.journey?.pending,complete=done();
  const nodeOptions=Object.keys(M.nodes).filter(id=>M.starts.includes(id)||id==='d_entrance'||M.nodes[id].floor!=='campus');
  const routeTitle=state.route?label(state.route.destinationId):state.destinationId==='water'?'Tìm điểm nước':'Đến cửa tòa D';
  const lastAssistant=state.chatHistory.length?state.chatHistory[state.chatHistory.length-1]:null;
  const confirmBox=state.confirmation?`<div class="confirmation-box alert warning"><p>${esc(state.confirmation.message)}</p><div class="g-btn-row">${state.confirmation.type==='report_select'?pointOptions().map(p=>`<button class="nb-button pale-yellow" data-report-point="${esc(p.id)}">${esc(p.label||label(p.nodeId))}</button>`).join(''):'<button class="nb-button green" data-action="confirm-local">Xác nhận</button>'}<button class="nb-button default" data-action="cancel-local">Hủy</button></div></div>`:'';
  const noticeBox=state.notice?`<p class="inline-notice alert info" role="status">${esc(state.notice)}</p>`:'';
  app.innerHTML=`<main class="gmaps-container split-layout vmap-app">
    <div class="split-left">
      <div class="gmaps-top-overlay">
        <div class="gmaps-search-bar"><img class="brand-logo" src="logo.svg" alt=""><div class="search-brand">Vmap</div><span class="simulation-label">Campus mẫu</span></div>
        <div class="gmaps-chips-bar" aria-label="Tầng đang xem">${['campus','1','2'].map(f=>`<button data-floor="${f}" class="g-chip ${state.floor===f?'active':''}" aria-pressed="${state.floor===f}">${floorLabel(f)}</button>`).join('')}</div>
        <div class="view-caption">${esc(currentLabel())}</div>
      </div>
      <div class="gmaps-viewport" id="viewport"><div class="map-canvas" style="width:${state.follow?100:state.zoom*100}%;height:${state.follow?100:state.zoom*100}%">${M.render({floor:state.floor,position:state.position,route:state.route,journey:state.journey,path:state.route?.nodeIds||[],zoom:1})}</div></div>
      <div class="gmaps-fabs"><button data-action="follow" class="g-fab primary" aria-label="Căn giữa vị trí hiện tại">◎</button><button data-action="zoom" class="g-fab" aria-label="Phóng to">+</button><button data-action="out" class="g-fab" aria-label="Thu nhỏ">−</button></div>
    </div>
    <aside class="split-right" aria-label="Trợ lý Vmap">
      <header class="side-head">
        <div class="brand-lockup">
          <img class="brand-logo" src="logo.svg" alt="">
          <div class="brand-copy"><strong>Vmap</strong><small>Tìm nước trên campus</small></div>
        </div>
        <span class="status-pill ${state.providerMode==='live'?'is-live':state.providerMode==='mock'?'is-mock':'is-off'}">${esc(providerLabel())}</span>
      </header>
      <div class="you-are">
        <button type="button" class="loc-chip" data-action="toggle-setup" aria-expanded="${state.tripOpen&&!state.journey}">
          <span class="loc-dot ${state.positionConfirmed?'on':''}"></span>
          <span class="loc-text">${esc(currentLabel())}</span>
        </button>
        ${state.journey?`<span class="dest-chip">${esc(routeTitle)}</span>`:''}
      </div>
      ${state.journey?`<section class="nav-card" aria-label="Dẫn đường">
        <div class="nav-card-head">
          <p id="next-instruction" class="nav-step">${esc(instruction())}</p>
          <span class="nav-pct">${Math.round(progress())}%</span>
        </div>
        <div class="g-progress-bar"><span id="route-progress" style="width:${progress()}%"></span></div>
        ${pending?`<button class="nb-button orange hold-confirm" data-action="confirm-stop">${esc(pending.label||'Xác nhận')}</button>`:`<div class="g-btn-row"><button class="nb-button default movement-button" data-motion="-1">Quay lại</button><button class="nb-button green movement-button" data-motion="1" ${complete?'disabled':''}>Giữ đi tiếp</button></div>`}
        <div class="nav-links"><button type="button" data-action="stop-route">Dừng tuyến</button><button type="button" data-action="report">Máy hỏng</button></div>
      </section>`:state.tripOpen?`<section class="setup-card">
        <div class="controls-form">
          <label class="field-label">Bạn đang ở đâu?<select id="origin" class="trip-select"><option value="" ${!state.positionConfirmed?'selected':''}>Chọn vị trí xuất phát</option>${nodeOptions.map(id=>`<option value="${id}" ${state.positionConfirmed&&state.position.nodeId===id?'selected':''}>${esc(label(id))}</option>`).join('')}${state.position.kind==='edge'?'<option value="current" selected>Giữ vị trí giữa đoạn đường hiện tại</option>':''}</select></label>
          <div class="trip-grid"><label class="field-label">Điểm đến<select id="destination" class="trip-select"><option value="water" ${state.destinationId==='water'?'selected':''}>Điểm nước gần nhất</option><option value="d_entrance" ${state.destinationId==='d_entrance'?'selected':''}>Cửa tòa D</option></select></label>
          <label class="field-label">Thời tiết<select id="weather" class="trip-select">${[['unknown','Chưa rõ'],['rain','Đang mưa'],['dry','Không mưa']].map(([id,text])=>`<option value="${id}" ${state.weatherContext.condition===id?'selected':''}>${text}</option>`).join('')}</select></label></div>
          <label class="field-label">Chọn đường<select id="preference" class="trip-select">${Object.entries(preferences).map(([id,text])=>`<option value="${id}" ${state.routePreference===id?'selected':''}>${text}</option>`).join('')}</select></label>
          ${state.destinationId!=='water'?`<label class="checkbox-label"><input type="checkbox" id="via-water" ${state.viaWater?'checked':''}> Ghé lấy nước trước khi đến D</label>`:''}
          <button class="nb-button green full-btn" data-action="find">Bắt đầu chỉ đường</button>
        </div>
      </section>`:''}
      ${confirmBox}${noticeBox}
      <div class="right-chat" aria-label="Hội thoại">
        <div class="chat-messages" id="chat-messages">
          ${state.chatHistory.length?'':`<div class="chat-welcome">
            <img class="welcome-logo" src="logo.svg" alt="">
            <p><strong>Hỏi chỗ lấy nước</strong> như nhắn bạn. Thử “Tôi ở cổng Tây” rồi “Tôi khát”.</p>
          </div>`}
          ${state.chatHistory.map((m,i)=>`<div class="chat-msg ${m.role}"><div class="chat-msg-bubble">${m.role==='assistant'?formatMsg(m.text):esc(m.text)}</div>${m.role==='assistant'&&visibleActions(m.actions).length&&i===state.chatHistory.length-1&&!state.busy?`<div class="chat-msg-actions">${renderActions(m.actions)}</div>`:''}</div>`).join('')}
          ${state.busy?'<div class="chat-msg assistant"><div class="chat-msg-bubble typing"><span></span><span></span><span></span></div></div>':''}
        </div>
      </div>
      <footer class="composer">
        <div class="chat-quick-actions">${state.busy||visibleActions(lastAssistant?.actions).length?'':starterChips()}</div>
        <form id="ask" class="chat-input-bar"><input id="question" class="chat-input" maxlength="500" placeholder="${esc(placeholder())}" ${state.busy?'disabled':''} autocomplete="off"><button class="send-btn" ${state.busy?'disabled':''} aria-label="Gửi">Gửi</button></form>
      </footer>
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
app.addEventListener('toggle',event=>{
  if(event.target.classList.contains('trip-card'))state.tripOpen=event.target.open;
});
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
  const el=event.target.closest('[data-action],[data-floor],[data-node],[data-building],[data-agent-action],[data-report-point],[data-ask]');
  if(!el || el.disabled)return;
  if(el.dataset.ask){ask(el.dataset.ask);return;}
  if(el.dataset.reportPoint){report(el.dataset.reportPoint);return;}
  if(el.dataset.floor){stop();state.floor=el.dataset.floor;state.follow=false;render();return;}
  if(el.dataset.building){stop();if(el.dataset.building==='E'){state.floor='1';state.follow=false;}else state.notice='Chưa có mặt bằng trong nhà tòa này. Tòa D hiện hỗ trợ tới cửa.';render();return;}
  if(el.dataset.node){stop();state.confirmation={type:'location',nodeId:el.dataset.node,message:'Đặt vị trí mô phỏng tại '+label(el.dataset.node)+'?'};render();return;}
  if(el.dataset.agentAction!==undefined){
    const action=state.actions[Number(el.dataset.agentAction)];if(!action)return;
    if(action.type==='start_route'){applyRoute(action.route||state.proposedRoute);return;}
    if(action.type==='confirm_location'||action.type==='confirm_report'){ask('Tôi xác nhận',action);return;}
    if(action.type==='suggest'&&action.text){ask(action.text);return;}
    if(action.type==='retry'){ask(state.query);return;}
    if(action.type==='cancel_navigation'){stop();invalidate();state.route=null;state.journey=null;state.walking=false;render();return;}
    if(action.type==='choose_landmark'){state.showAssistant=false;state.notice='Chọn mốc xuất phát bên dưới.';state.tripOpen=true;render();return;}
  }
  switch(el.dataset.action){
    case 'toggle-setup':if(!state.journey)state.tripOpen=!state.tripOpen;break;
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
    const [mapRes,healthRes]=await Promise.all([
      fetch('campus-data.json'),
      fetch('/api/health').catch(()=>null)
    ]);
    if(!mapRes.ok)throw Error('Không tải được dữ liệu bản đồ');
    const data=await mapRes.json();(N.configure||N.setData)(data);
    M.syncData?.();
    if(healthRes && healthRes.ok){
      const health=await healthRes.json();
      if(health.providerMode)state.providerMode=health.providerMode;
    }
    state.ready=true;state.position={kind:'node',nodeId:M.starts[0]};state.floor=coords().floor;render();
  }catch(error){app.innerHTML=`<div class="boot-status" role="alert">Không tải được bản đồ mẫu. Hãy mở qua máy chủ HTTP. <button class="nb-button orange" onclick="location.reload()">Thử lại</button><p>${esc(error.message)}</p></div>`;}
}
window.VmapDemo={state,find,ask,render,instruction,stop,startMotion,confirmStop,setPosition,applyRoute,context,tick,bootstrap};
window.VmapDemo.ready=bootstrap();
})();
