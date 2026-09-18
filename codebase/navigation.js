(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; api.setData(require('./campus-data.json')); }
  else root.VmapNavigation = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  var data, nodes = {}, edges = {};
  function setData(value) { data=value; nodes=Object.fromEntries(data.nodes.map(n=>[n.id,n])); edges=Object.fromEntries(data.edges.map(e=>[e.id,e])); api.data=data; api.nodes=nodes; api.edges=edges; return api; }
  function allowed(e,p) { return e.accessStatus==='open' && e.accessible!==false && (p!=='indoor_only'||e.environment==='indoor') && (p!=='sheltered_only'||['indoor','covered_outdoor'].includes(e.environment)); }
  function validPosition(p) { return !!p && (p.kind==='node' ? !!nodes[p.nodeId] : p.kind==='edge' && !!edges[p.edgeId] && !edges[p.edgeId].transition && Number.isFinite(p.offset) && p.offset>=0 && p.offset<=1); }
  function coordinates(p) {
    if(typeof p==='string') p={kind:'node',nodeId:p};
    if(!validPosition(p)) return null;
    if(p.kind==='node') return Object.assign({},nodes[p.nodeId]);
    var e=edges[p.edgeId],g=e.geometry,total=0;
    for(var i=1;i<g.length;i++) total+=Math.hypot(g[i][0]-g[i-1][0],g[i][1]-g[i-1][1]);
    var remaining=total*p.offset;
    for(var j=1;j<g.length;j++){var len=Math.hypot(g[j][0]-g[j-1][0],g[j][1]-g[j-1][1]);if(remaining<=len || j===g.length-1){var t=len?remaining/len:0;return {x:g[j-1][0]+(g[j][0]-g[j-1][0])*t,y:g[j-1][1]+(g[j][1]-g[j-1][1])*t,floor:nodes[e.from].floor};}remaining-=len;}
  }
  function segment(e,a,b) {return {edgeId:e.id,from:a===0?e.from:a===1?e.to:null,to:b===0?e.from:b===1?e.to:null,fromOffset:a,toOffset:b,cost:e.cost*Math.abs(b-a),transition:e.transition||null};}
  function score(segments,p){var cost=0,exposed=0;segments.forEach(s=>{cost+=s.cost;if(['exposed','unknown'].includes(edges[s.edgeId].environment))exposed+=s.cost;});return p==='prefer_sheltered'?[exposed,cost]:[cost,exposed];}
  function compare(a,b){return a[0]-b[0]||a[1]-b[1];}
  function path(origin,target,p){
    var queue=[],best={};
    if(origin.kind==='node')queue.push({id:origin.nodeId,segments:[]});
    else {var oe=edges[origin.edgeId];if(!allowed(oe,p))return null;if(oe.bidirectional!==false&&oe.oneWay!==true)queue.push({id:oe.from,segments:[segment(oe,origin.offset,0)]});queue.push({id:oe.to,segments:[segment(oe,origin.offset,1)]});}
    while(queue.length){queue.sort((a,b)=>compare(score(a.segments,p),score(b.segments,p))||a.id.localeCompare(b.id));var cur=queue.shift(),sc=score(cur.segments,p);if(best[cur.id]&&compare(best[cur.id],sc)<=0)continue;best[cur.id]=sc;if(cur.id===target)return cur.segments;
      data.edges.forEach(e=>{if(!allowed(e,p))return;var next=e.from===cur.id?e.to:e.to===cur.id&&e.bidirectional!==false&&e.oneWay!==true?e.from:null;if(next)queue.push({id:next,segments:cur.segments.concat(segment(e,e.from===cur.id?0:1,e.from===cur.id?1:0))});});
    }return null;
  }
  function planTrip(input){
    var origin=typeof input.origin==='string'?{kind:'node',nodeId:input.origin}:input.origin,p=input.preference||input.routePreference||'shortest',target=input.destinationId||'water';
    if(!validPosition(origin)||!['shortest','prefer_sheltered','indoor_only','sheltered_only'].includes(p))return {status:'invalid_request'};
    var building=data.buildings.find(b=>b.id===target);if(building)target=building.entranceNodeIds[0];
    if(target!=='water'&&!nodes[target])return {status:'no_grounding'};
    var excluded=input.excludedPointIds||[],water=data.waterPoints.filter(w=>w.status==='active'&&!excluded.includes(w.id)),candidates=[];
    if(target==='water'||input.viaWater){water.forEach(w=>{var a=path(origin,w.nodeId,p),b=target==='water'?[]:path({kind:'node',nodeId:w.nodeId},target,p);if(a&&b)candidates.push({segments:a.concat(b),waypointIds:target==='water'?[]:[w.nodeId],destinationId:target==='water'?w.nodeId:target,waterPointId:w.id});});}
    else{var direct=path(origin,target,p);if(direct)candidates.push({segments:direct,waypointIds:[],destinationId:target});}
    if(!candidates.length)return {status:(target==='water'||input.viaWater)&&!water.length?'no_available':['indoor_only','sheltered_only'].includes(p)?'no_route_under_constraints':'no_route',preferenceApplied:p};
    candidates.sort((a,b)=>compare(score(a.segments,p),score(b.segments,p))||(a.waterPointId||a.destinationId).localeCompare(b.waterPointId||b.destinationId));
    var chosen=candidates[0],summary={indoor:0,covered_outdoor:0,exposed:0,unknown:0};chosen.segments.forEach(s=>summary[edges[s.edgeId].environment]+=s.cost);
    return Object.assign(chosen,{status:'ok',origin:origin,dataVersion:data.dataVersion,routeId:'route-'+Date.now(),preferenceApplied:p,cost:chosen.segments.reduce((a,s)=>a+s.cost,0),costUnit:'simulation_units',distanceMeters:null,durationSeconds:null,exposureSummary:summary,provenance:'simulated',arrivalFeasibility:'unknown'});
  }
  function createJourney(route){var j={route:route,segmentIndex:0,offset:0,motion:route.segments.length?'idle':'arrived',pending:null,positionRevision:0,waypointsConfirmed:{}};if(route.origin.kind==='node'&&route.waypointIds.includes(route.origin.nodeId)){stop(j,'waypoint',1);j.pending.nodeId=route.origin.nodeId;}return j;}
  function position(j){var s=j.route.segments[j.segmentIndex];if(!s)return j.route.origin;var t=s.fromOffset+(s.toOffset-s.fromOffset)*j.offset;if(t<=0)return {kind:'node',nodeId:edges[s.edgeId].from};if(t>=1)return {kind:'node',nodeId:edges[s.edgeId].to};return {kind:'edge',edgeId:s.edgeId,offset:t};}
  function stop(j,type,direction){j.pending={type:type,direction:direction,label:type==='waypoint'?'Đã lấy nước — tiếp tục':transitionLabel(j,direction)};j.motion='awaiting_'+type;}
  function transitionLabel(j,d){var s=j.route.segments[j.segmentIndex],e=edges[s.edgeId],from=nodes[d>0?s.from:s.to],to=nodes[d>0?s.to:s.from];return e.transition==='door'?(to.floor==='campus'?'Ra tòa':'Vào tòa'):(Number(to.floor)>Number(from.floor)?'Lên tầng':'Xuống tầng');}
  function advance(j,distance){
    if(!Number.isFinite(distance)||!distance||j.pending||!j.route.segments.length)return j;
    var direction=distance>0?1:-1,remaining=Math.abs(distance);j.motion=direction>0?'forward':'backward';
    while(remaining>0){var s=j.route.segments[j.segmentIndex];if(s.transition){stop(j,'transition',direction);break;}var available=(direction>0?1-j.offset:j.offset)*s.cost,step=Math.min(remaining,available);j.offset+=s.cost?direction*step/s.cost:direction;j.offset=Math.max(0,Math.min(1,j.offset));remaining-=step;if(step)j.positionRevision++;
      if(step<available)break;
      var reached=direction>0?s.to:s.from;
      if(direction>0&&j.route.waypointIds.includes(reached)&&!j.waypointsConfirmed[reached]){stop(j,'waypoint',direction);j.pending.nodeId=reached;break;}
      var next=j.segmentIndex+direction;if(next<0){j.motion='idle';break;}if(next>=j.route.segments.length){j.motion='arrived';break;}
      j.segmentIndex=next;j.offset=direction>0?0:1;
      if(j.route.segments[next].transition){stop(j,'transition',direction);break;}
    }return j;
  }
  function confirmStop(j){if(!j.pending)return j;var pending=j.pending,d=pending.direction,s=j.route.segments[j.segmentIndex];if(pending.type==='waypoint'){j.waypointsConfirmed[pending.nodeId||s.to]=true;}else{j.offset=d>0?1:0;j.positionRevision++;var next=j.segmentIndex+d;if(next>=0&&next<j.route.segments.length){j.segmentIndex=next;j.offset=d>0?0:1;}}j.pending=null;j.motion=!j.route.segments.length||(j.segmentIndex===j.route.segments.length-1&&j.offset===1)?'arrived':'idle';return j;}
  function progress(j){return j.route.segments.slice(0,j.segmentIndex).reduce((a,s)=>a+s.cost,0)+(j.route.segments[j.segmentIndex]?.cost||0)*j.offset;}
  var api={setData:setData,configure:setData,validPosition:validPosition,coordinates:coordinates,planTrip:planTrip,createJourney:createJourney,advance:advance,confirmStop:confirmStop,position:position,progress:progress};return api;
});
