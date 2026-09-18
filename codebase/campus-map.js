(function attachCampusMap(global) {
  'use strict';

  var WIDTH = 1126;
  var HEIGHT = 906;

  // Geometry comes from the same simulated dataset used by the route planner.
  var nodes = {};
  var edges = [];
  function syncData() {
    var nav=global.VmapNavigation;
    if(nav && nav.data){nodes=nav.nodes;edges=nav.data.edges.map(e=>[e.from,e.to]);global.CampusMap.nodes=nodes;global.CampusMap.edges=edges;}
  }

  var starts = ['west_gate', 'south_gate', 'square', 'c_walk', 'e_entrance'];
  var destination = 'water';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function line(points, cls, extra) {
    return '<polyline class="' + cls + '" points="' + points + '"' + (extra || '') + '/>';
  }

  function label(x, y, text, cls) {
    return '<text class="' + (cls || 'map-label') + '" x="' + x + '" y="' + y + '">' + esc(text) + '</text>';
  }

  function campusBuilding(id, x, y, w, h, title, kind) {
    var isFocus = id === 'E';
    var special = isFocus ? ' building building-focus' : ' building';
    var shape = kind === 'round'
      ? '<ellipse cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" rx="' + (w / 2) + '" ry="' + (h / 2) + '"/>'
      : '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10"/>';

    var badge = isFocus
      ? '<rect class="focus-badge" x="' + (x + w/2 - 50) + '" y="' + (y + h/2 - 14) + '" width="100" height="28" rx="14"/>' +
        '<text class="focus-badge-text" x="' + (x + w/2) + '" y="' + (y + h/2 + 5) + '">💧 ' + esc(title) + '</text>'
      : label(x + w / 2, y + h / 2 + 5, title, 'building-label');

    return '<g class="' + special.trim() + '" data-building="' + esc(id) + '" tabindex="0" role="button" aria-label="' + esc(title) + '">' +
      shape +
      badge +
      '</g>';
  }

  function campusBase() {
    var s = '';
    // Background Ground
    s += '<rect class="campus-ground" x="0" y="0" width="1126" height="906"/>';

    // River
    s += '<path class="river" d="M0 710 C170 690 275 760 410 820 C570 890 725 825 830 748 C950 661 1028 524 1126 400 L1126 906 L0 906Z"/>';
    s += '<path class="river-highlight" d="M16 752 C170 730 284 804 418 850 C585 904 750 833 858 757 C958 687 1024 572 1111 460"/>';

    // Outer City Roads
    s += '<path class="outer-road" d="M0 170 L210 135 L390 168 L610 144 L860 150 L1126 80"/>';
    s += '<path class="outer-road" d="M95 0 L40 250 L65 520 L0 688"/>';
    s += '<path class="outer-road" d="M1126 132 L1046 330 L1000 512 L1050 690"/>';

    // Only graph-backed walkways are rendered below, after the background.

    // Landscape Garden Detail Areas
    s += '<g class="campus-detail">';
    s += '<path d="M170 255 L315 255 L347 290 L200 290Z"/><path d="M160 304 L280 304 L315 339 L175 339Z"/>';
    s += '<path d="M830 160 L935 160 L968 194 L850 194Z"/><path d="M972 235 L1080 235 L1108 267 L990 267Z"/>';
    s += '<path d="M103 612 L159 580 L198 611 L140 647Z"/><path d="M1003 650 L1045 624 L1090 663 L1048 695Z"/>';
    s += '</g>';

    // Campus Buildings (Clean 2D footprints, exactly aligned with walkway nodes)
    s += campusBuilding('H', 350, 270, 110, 86, 'H Building');
    s += campusBuilding('G', 460, 270, 95, 80, 'G Building');
    s += campusBuilding('A', 393, 390, 82, 67, 'A Building');
    s += campusBuilding('I', 350, 490, 65, 32, 'I Building');
    s += campusBuilding('C', 282, 390, 91, 72, 'C Building');
    s += campusBuilding('D', 199, 406, 82, 72, 'D Building');
    s += campusBuilding('E', 440, 483, 112, 75, 'E Building'); // Target water building
    s += campusBuilding('F', 447, 590, 83, 70, 'F Building');
    s += campusBuilding('stadium', 540, 188, 150, 165, 'VinUni Stadium', 'round');

    // Stadium Running Track
    s += '<g class="track"><ellipse cx="615" cy="270" rx="74" ry="56"/><ellipse cx="615" cy="270" rx="46" ry="31"/></g>';

    // Sports Complex and Dormitory
    s += campusBuilding('sports', 735, 300, 143, 106, 'Indoor Sports');
    s += campusBuilding('dorm', 885, 402, 126, 148, 'VinUni Dormitory');

    // Central Square (Park & Fountain)
    s += '<g class="square" aria-label="Central Square"><ellipse cx="320" cy="610" rx="113" ry="88"/><ellipse cx="320" cy="610" rx="57" ry="38"/><path d="M208 610H432M320 522V698"/></g>';

    // VinUni Lake
    s += '<g class="lake"><ellipse cx="580" cy="770" rx="64" ry="31"/><ellipse cx="580" cy="770" rx="37" ry="16"/></g>';

    // Clean Map Labels
    s += label(320, 731, 'Central Square', 'place-label');
    s += label(580, 817, 'VinUni Lake', 'place-label');

    // Gate Markers
    s += '<g class="gate-marker"><circle cx="94" cy="500" r="10" class="gate-circle"/><text x="94" y="534" class="gate-label">Cổng Tây</text></g>';
    s += '<g class="gate-marker"><circle cx="220" cy="780" r="10" class="gate-circle"/><text x="220" y="814" class="gate-label">Cổng Nam</text></g>';

    // Minimal Compass & Simulated Note
    s += '<g class="north"><circle cx="1045" cy="58" r="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/><path d="M1045 70V46M1045 46l-6 10h12Z" fill="#1e293b"/><text x="1041" y="36">N</text></g>';
    s += '<g class="map-note"><rect x="40" y="40" width="220" height="34" rx="17"/><circle cx="58" cy="57" r="5"/><text x="72" y="61">Bản đồ khuôn viên · Dữ liệu mô phỏng</text></g>';

    return s;
  }

  function room(x, y, w, h, title, cls) {
    return '<g class="room ' + (cls || '') + '">' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6"/>' +
      label(x + w / 2, y + h / 2 + 5, title, 'room-label') +
      '</g>';
  }

  function indoorBase(floor) {
    var s = '';
    s += '<rect class="indoor-backdrop" x="0" y="0" width="1126" height="906"/>';

    // Building Shell
    s += '<g class="floor-shell"><rect x="170" y="150" width="760" height="590" rx="20"/>';
    s += '<path class="wall" d="M170 295H930 M170 584H930 M505 150V740 M730 150V740"/>';
    s += '<path class="hall" d="M190 300H910V570H190Z"/>';
    s += '<path class="door" d="M260 295v18 M505 420v22 M730 500v18 M910 410v20"/>';

    // Rooms
    s += room(195, 175, 285, 100, 'Phòng học A', 'room-soft');
    s += room(525, 175, 185, 100, 'Phòng họp', 'room-soft');
    s += room(750, 175, 155, 100, 'Văn phòng', 'room-soft');
    s += room(195, 600, 285, 112, 'Phòng học B', 'room-soft');
    s += room(525, 600, 185, 112, 'Phòng tự học', 'room-soft');
    s += room(750, 600, 155, 112, 'Kho thiết bị', 'room-soft');

    // Stairs
    s += '<g class="stairs"><rect x="548" y="370" width="103" height="120" rx="8"/><path class="stair-lines" d="M556 390h87M556 408h87M556 426h87M556 444h87M556 462h87"/><text x="599" y="506">Cầu thang</text></g>';

    // Elevator
    s += '<g class="elevator" transform="translate(0 -70)"><rect x="755" y="365" width="87" height="105" rx="8"/><path class="elevator-doors" d="M772 420h53M798 395v51M785 407l13-13 13 13M785 433l13 13 13-13"/><text x="798" y="488">Thang máy</text></g>';

    // Entrance
    s += '<g class="entrance"><path d="M150 412h42v42h-42Z" rx="6"/><path d="M155 433h32"/><text x="171" y="475">Cửa vào</text></g>';
    s += '</g>';

    // Floor Header Banner
    s += '<g class="indoor-header"><rect x="170" y="78" width="760" height="52" rx="16"/><text x="200" y="111">TÒA E · TẦNG ' + esc(floor) + '</text><text x="680" y="110">Mặt bằng mô phỏng để kiểm thử luồng</text></g>';

    // Floor Legend
    s += '<g class="floor-legend"><circle cx="204" cy="804" r="8" fill="#1a73e8"/><text x="223" y="809">Vị trí của bạn</text><circle class="water-dot" cx="390" cy="804" r="8" fill="#059669"/><text x="409" y="809">Máy nước</text></g>';

    return s;
  }

  function renderNodes(floor, position) {
    var s = '';
    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      if (n.floor !== floor || (floor === 'campus' && !starts.includes(id) && !['d_entrance','water_d','water_square'].includes(id))) return;
      var isCurrent = false;
      var isWater = ['water','water_d','water_square'].includes(id);
      var cls = 'campus-node' + (isCurrent ? ' node-current' : '') + (isWater ? ' node-water' : '');

      s += '<g class="' + cls + '" data-node="' + esc(id) + '" tabindex="0" role="button" aria-label="' + esc(n.label) + '">';
      if (isCurrent) {
        // Google Maps style pulsating blue dot
        s += '<circle class="node-pulse" cx="' + n.x + '" cy="' + n.y + '" r="22"/>';
        s += '<circle class="node-halo" cx="' + n.x + '" cy="' + n.y + '" r="14"/>';
        s += '<circle class="node-dot" cx="' + n.x + '" cy="' + n.y + '" r="9"/>';
      } else if (isWater) {
        // Emerald Water Pin
        s += '<circle cx="' + n.x + '" cy="' + n.y + '" r="16" class="water-halo"/>';
        s += '<circle cx="' + n.x + '" cy="' + n.y + '" r="11" class="water-circle"/>';
        s += '<path class="water-symbol" d="M' + (n.x) + ' ' + (n.y - 7) + ' c3 4 5 7 5 10 a5 5 0 0 1 -10 0 c0 -3 2 -6 5 -10 Z"/>';
      } else {
        // Regular clean node
        s += '<circle class="node-halo" cx="' + n.x + '" cy="' + n.y + '" r="12"/>';
        s += '<circle class="node-dot-regular" cx="' + n.x + '" cy="' + n.y + '" r="7"/>';
      }
      s += '</g>';
    });
    return s;
  }

  function renderPath(floor, path) {
    if (!Array.isArray(path) || path.length < 2) return '';
    var s = '';
    for (var i = 0; i < path.length - 1; i += 1) {
      var a = nodes[path[i]];
      var b = nodes[path[i + 1]];
      if (!a || !b || a.floor !== floor || b.floor !== floor) continue;
      // Glowing backing line + crisp dashed navigation route
      s += line(a.x + ',' + a.y + ' ' + b.x + ',' + b.y, 'route-glow');
      s += line(a.x + ',' + a.y + ' ' + b.x + ',' + b.y, 'route-line');
    }
    return s;
  }


  function renderRoads(floor) {
    var nav=global.VmapNavigation;if(!nav||!nav.data)return '';
    return nav.data.edges.filter(e=>!e.transition&&nodes[e.from].floor===floor).map(e=>line(e.geometry.map(p=>p.join(',')).join(' '),'graph-road road-'+e.environment)).join('') +
      '<g class="map-note"><rect x="30" y="848" width="780" height="35" rx="12"/><text x="45" y="871">Xanh nhạt: mái che · Trắng nét đứt: ngoài trời · Vàng: chưa rõ · Tất cả là dữ liệu mẫu</text></g>';
  }
  function segmentPoints(s, start, end) {
    var nav=global.VmapNavigation,e=nav.edges[s.edgeId],g=e.geometry;
    var a=s.fromOffset+(s.toOffset-s.fromOffset)*start,b=s.fromOffset+(s.toOffset-s.fromOffset)*end;
    var total=g.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-g[i][0],p[1]-g[i][1]),0),acc=0,points=[];
    var first=nav.coordinates({kind:'edge',edgeId:e.id,offset:a}),last=nav.coordinates({kind:'edge',edgeId:e.id,offset:b});
    points.push([first.x,first.y]);
    var inner=[];for(var i=1;i<g.length;i++){acc+=Math.hypot(g[i][0]-g[i-1][0],g[i][1]-g[i-1][1]);var t=acc/total;if(t>Math.min(a,b)&&t<Math.max(a,b))inner.push(g[i]);}
    if(a>b)inner.reverse();points=points.concat(inner,[[last.x,last.y]]);
    return points.map(p=>p.join(',')).join(' ');
  }
  function renderRoute(floor,route,j) {
    return route.segments.map((s,i)=>{
      var e=global.VmapNavigation.edges[s.edgeId];if(!e||e.transition||nodes[e.from].floor!==floor)return '';
      var done=j?(i<j.segmentIndex?1:i===j.segmentIndex?j.offset:0):0;
      return line(segmentPoints(s,0,done),'route-traveled',' data-traveled="'+i+'"')+
        line(segmentPoints(s,done,1),'route-line',' data-remaining="'+i+'"');
    }).join('');
  }
  function updateProgress(svg,route,j) {
    if(!svg||!route||!j)return;
    route.segments.forEach((s,i)=>{
      if(s.transition)return;
      var done=i<j.segmentIndex?1:i===j.segmentIndex?j.offset:0;
      var traveled=svg.querySelector('[data-traveled="'+i+'"]'),remaining=svg.querySelector('[data-remaining="'+i+'"]');
      if(traveled)traveled.setAttribute('points',segmentPoints(s,0,done));
      if(remaining)remaining.setAttribute('points',segmentPoints(s,done,1));
    });
  }
  function renderPlayer(floor,p) {
    var nav=global.VmapNavigation,c=nav&&nav.coordinates(p);if(!c||c.floor!==floor)return '';
    return '<g data-player="true" transform="translate('+c.x+' '+c.y+')" aria-label="Bạn đang ở đây">'+
      '<ellipse cy="5" rx="17" ry="7" fill="#1d4ed8" opacity=".18"/><circle cy="-27" r="8" fill="#2563eb" stroke="white" stroke-width="3"/>'+
      '<path d="M-10 -3v-14q0-7 10-7t10 7V-3M-5 -3v12M5 -3v12" fill="#2563eb" stroke="white" stroke-width="5" stroke-linecap="round"/>'+
      '<path d="M-10 -3v-14q0-7 10-7t10 7V-3M-5 -3v12M5 -3v12" fill="#2563eb" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>'+
      '<rect x="-67" y="-62" width="134" height="25" rx="12" fill="white" stroke="#bfdbfe"/>'+label(0,-45,'Bạn đang ở đây','place-label')+'</g>';
  }

  function render(options) {
    syncData();
    options = options || {};
    var floor = String(options.floor || 'campus');
    if (floor !== 'campus' && floor !== '1' && floor !== '2') floor = 'campus';
    var position = typeof options.position==='object' ? options.position : {kind:'node',nodeId:nodes[options.position]?options.position:starts[0]};
    var path = Array.isArray(options.path) ? options.path : [];
    var zoom = Number(options.zoom);
    if (!isFinite(zoom)) zoom = 1;
    zoom = Math.max(0.8, Math.min(1.6, zoom));
    var dx = (WIDTH - WIDTH * zoom) / 2;
    var dy = (HEIGHT - HEIGHT * zoom) / 2;
    var body = floor === 'campus' ? campusBase() : indoorBase(floor);
    body += renderRoads(floor);
    body += options.route ? renderRoute(floor,options.route,options.journey) : renderPath(floor, path);
    body += renderNodes(floor, position);
    body += renderPlayer(floor,position);
    if(options.route){var dest=nodes[options.route.destinationId];if(dest&&dest.floor===floor)body+='<g transform="translate('+dest.x+' '+dest.y+')"><circle r="21" fill="none" stroke="#047857" stroke-width="4"/>'+label(0,-29,'Đích đến','place-label')+'</g>';}

    var actual=global.VmapNavigation&&global.VmapNavigation.coordinates(position);
    if (actual && actual.floor!==floor) {
      body += '<g class="floor-status"><rect x="740" y="774" width="180" height="40" rx="12"/><text x="752" y="799">Bạn đang ở ' + esc(actual.floor==='campus'?'khuôn viên':'tầng '+actual.floor) + '</text></g>';
    }

    var styles = '<style><![CDATA[' +
      '.route-traveled{fill:none;stroke:#94a3b8;stroke-width:7;stroke-linecap:round;}' +
      '.graph-road{fill:none;stroke-width:13;stroke-linecap:round;stroke-linejoin:round}.road-indoor{stroke:#a7f3d0}.road-covered_outdoor{stroke:#99d5e5}.road-exposed{stroke:#fff;stroke-dasharray:12 5}.road-unknown{stroke:#fcd34d;stroke-dasharray:5 5}' +
      '.campus-ground { fill: #f3f6f0; }' +
      '.river { fill: #c2e7ff; }' +
      '.river-highlight { fill: none; stroke: #e0f2fe; stroke-width: 14; opacity: 0.6; }' +
      '.outer-road { fill: none; stroke: #ffffff; stroke-width: 28; stroke-linecap: round; stroke-linejoin: round; filter: url(#road-shadow); }' +
      '.campus-road { fill: none; stroke: #ffffff; stroke-width: 20; stroke-linecap: round; stroke-linejoin: round; filter: url(#road-shadow); }' +
      '.walking-path { fill: none; stroke: #ffffff; stroke-width: 9; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 4 12; }' +
      '.walking-dash { fill: none; stroke: #ffffff; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 3 8; }' +
      '.campus-detail { fill: #e5ede0; stroke: #d6e2d0; stroke-width: 1.5; }' +
      '.building { cursor: pointer; filter: url(#b-shadow); transition: transform 0.15s; }' +
      '.building:hover { filter: url(#b-shadow-hover); }' +
      '.building rect, .building ellipse { fill: #ffffff; stroke: #d1d5db; stroke-width: 1.5; }' +
      '.building-focus rect { fill: #ecfdf5; stroke: #10b981; stroke-width: 3; }' +
      '.focus-badge { fill: #10b981; filter: drop-shadow(0 2px 4px rgba(16,185,129,0.3)); }' +
      '.focus-badge-text { fill: #ffffff; font-size: 13px; font-weight: 700; text-anchor: middle; font-family: system-ui, -apple-system, sans-serif; }' +
      '.building-label { fill: #374151; font-size: 13px; text-anchor: middle; font-weight: 600; font-family: system-ui, -apple-system, sans-serif; pointer-events: none; }' +
      '.track ellipse { fill: #fed7aa; stroke: #fdba74; stroke-width: 10; }' +
      '.track ellipse+ellipse { fill: #86efac; stroke: #ffffff; stroke-width: 6; }' +
      '.square ellipse { fill: #e0f2fe; stroke: #bae6fd; stroke-width: 2; }' +
      '.square ellipse+ellipse { fill: #7dd3fc; stroke: #ffffff; stroke-width: 4; }' +
      '.square path { stroke: #ffffff; stroke-width: 2.5; }' +
      '.lake ellipse { fill: #7dd3fc; stroke: #ffffff; stroke-width: 4; }' +
      '.place-label { fill: #475569; font-size: 13px; text-anchor: middle; font-weight: 600; font-family: system-ui, -apple-system, sans-serif; }' +
      '.gate-circle { fill: #3b82f6; stroke: #ffffff; stroke-width: 3; filter: url(#b-shadow); }' +
      '.gate-label { fill: #1e293b; font-size: 12px; font-weight: 600; text-anchor: middle; font-family: system-ui, -apple-system, sans-serif; }' +
      '.north text { fill: #1e293b; font-size: 13px; font-weight: 800; font-family: system-ui, -apple-system, sans-serif; }' +
      '.map-note rect { fill: rgba(255,255,255,0.94); stroke: #e2e8f0; stroke-width: 1; }' +
      '.map-note circle { fill: #10b981; }' +
      '.map-note text { fill: #475569; font-size: 12px; font-weight: 500; font-family: system-ui, -apple-system, sans-serif; }' +
      '.campus-node { cursor: pointer; }' +
      '.node-pulse { fill: none; stroke: #3b82f6; stroke-width: 2; opacity: 0; animation: gpulse 1.8s infinite cubic-bezier(0.25, 0.1, 0.25, 1); }' +
      '@keyframes gpulse { 0% { r: 10; opacity: 0.8; } 100% { r: 28; opacity: 0; } }' +
      '.node-halo { fill: #ffffff; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2)); }' +
      '.node-dot { fill: #1a73e8; }' +
      '.node-dot-regular { fill: #94a3b8; stroke: #ffffff; stroke-width: 2; }' +
      '.water-halo { fill: rgba(16,185,129,0.2); }' +
      '.water-circle { fill: #059669; stroke: #ffffff; stroke-width: 2.5; filter: drop-shadow(0 2px 4px rgba(5,150,105,0.35)); }' +
      '.water-symbol { fill: #ffffff; }' +
      '.route-glow { fill: none; stroke: rgba(16,185,129,0.25); stroke-width: 14; stroke-linecap: round; stroke-linejoin: round; }' +
      '.route-line { fill: none; stroke: #10b981; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 10 8; animation: gwalk 1s linear infinite; }' +
      '@keyframes gwalk { to { stroke-dashoffset: -18; } }' +
      '.indoor-backdrop { fill: #f8fafc; }' +
      '.floor-shell > rect { fill: #ffffff; stroke: #cbd5e1; stroke-width: 2; filter: url(#b-shadow); }' +
      '.floor-shell .hall { fill: #f1f5f9; stroke: #e2e8f0; stroke-width: 1.5; }' +
      '.wall { fill: none; stroke: #64748b; stroke-width: 8; stroke-linecap: square; }' +
      '.door { fill: none; stroke: #94a3b8; stroke-width: 6; stroke-linecap: round; }' +
      '.room rect { fill: #ffffff; stroke: #cbd5e1; stroke-width: 1.5; }' +
      '.room-soft rect { fill: #fafaf9; }' +
      '.room-label { fill: #334155; font-size: 13px; text-anchor: middle; font-weight: 600; font-family: system-ui, -apple-system, sans-serif; }' +
      '.stairs rect { fill: #f0fdf4; stroke: #86efac; stroke-width: 1.5; }' +
      '.stair-lines { stroke: #86efac; stroke-width: 2; }' +
      '.stairs text, .elevator text, .entrance text { fill: #475569; font-size: 12px; text-anchor: middle; font-weight: 600; font-family: system-ui, -apple-system, sans-serif; }' +
      '.elevator rect { fill: #eff6ff; stroke: #93c5fd; stroke-width: 1.5; }' +
      '.elevator-doors { fill: none; stroke: #60a5fa; stroke-width: 2; }' +
      '.entrance path { fill: #d1fae5; stroke: #10b981; stroke-width: 2; }' +
      '.indoor-header rect { fill: #1e293b; }' +
      '.indoor-header text { fill: #ffffff; font-size: 15px; font-weight: 700; font-family: system-ui, -apple-system, sans-serif; }' +
      '.indoor-header text+text { fill: #94a3b8; font-size: 12px; font-weight: 400; }' +
      '.floor-legend text { fill: #475569; font-size: 12px; font-family: system-ui, -apple-system, sans-serif; }' +
      '.floor-status rect { fill: #ffffff; stroke: #cbd5e1; filter: url(#b-shadow); }' +
      '.floor-status text { fill: #334155; font-size: 12px; font-weight: 600; font-family: system-ui, -apple-system, sans-serif; }' +
      ']]></style>';

    var defs = '<defs>' +
      '<filter id="road-shadow" x="-5%" y="-5%" width="110%" height="110%">' +
      '<feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.06"/>' +
      '</filter>' +
      '<filter id="b-shadow" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.08"/>' +
      '</filter>' +
      '<filter id="b-shadow-hover" x="-15%" y="-15%" width="130%" height="130%">' +
      '<feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.14"/>' +
      '</filter>' +
      '</defs>';

    return '<svg class="campus-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1126 906" role="img" aria-label="Bản đồ VinUni và sơ đồ Tòa E" data-floor="' + esc(floor) + '" data-zoom="' + zoom + '">' +
      styles + defs +
      '<g transform="translate(' + dx.toFixed(2) + ' ' + dy.toFixed(2) + ') scale(' + zoom.toFixed(2) + ')">' + body + '</g></svg>';
  }

  global.CampusMap = {
    nodes: nodes,
    edges: edges,
    starts: starts,
    destination: destination,
    syncData: syncData,
    updateProgress: updateProgress,
    render: render
  };
})(window);
