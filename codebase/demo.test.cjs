// Logic checks only; these do not replace visual/browser testing.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const handlers = {};
const root = { innerHTML: '' };
const fakeDocument = {
  getElementById: () => root,
  querySelector: () => null,
  addEventListener: (name, handler) => { handlers[name] = handler; },
  createElement: () => ({ remove() {} }),
  body: { append() {} }
};
const context = vm.createContext({
  document: fakeDocument, location: { hash: '' },
  window: { addEventListener() {}, scrollTo() {} },
  setTimeout: () => 1, clearTimeout() {}, console
});
vm.runInContext(fs.readFileSync(__dirname + '/demo.js', 'utf8') + '\nglobalThis.demo={nodes,edges,starts,waters,state,route,choices,currentRoute,render,report,reset,esc};', context);
const d = context.demo;
// Compare every route with an independent all-pairs shortest-path reference.
const keys = Object.keys(d.nodes);
const dist = Object.fromEntries(keys.map(a => [a, Object.fromEntries(keys.map(b => [b, a === b ? 0 : Infinity]))]));
for (const [a,b] of d.edges) dist[a][b] = dist[b][a] = Math.hypot(d.nodes[a][0]-d.nodes[b][0],d.nodes[a][1]-d.nodes[b][1]);
for (const k of keys) for (const a of keys) for (const b of keys) dist[a][b] = Math.min(dist[a][b],dist[a][k]+dist[k][b]);
for (const a of keys) for (const b of keys) {
  const r = d.route(a,b);
  assert.equal(r.path[0], a); assert.equal(r.path.at(-1), b);
  assert.equal(r.meters, Math.round(dist[a][b]*.55/5)*5);
  for (let i=1;i<r.path.length;i++) assert.ok(d.edges.some(([u,v]) => u===r.path[i-1]&&v===r.path[i] || v===r.path[i-1]&&u===r.path[i]));
}
console.log(`PASS ${keys.length ** 2} routes are shortest paths on the demo walkway graph`);
d.state.origin = 'c'; assert.equal(d.choices()[0].id,'A');
d.state.origin = 'sw'; assert.equal(d.choices()[0].id,'B');
d.state.origin = 'ne'; assert.equal(d.choices()[0].id,'C');
d.state.filter = 'refill'; assert.ok(d.choices().every(w => w.type === 'refill'));
d.state.blocked.add('A'); assert.equal(d.choices().length,1); assert.equal(d.choices()[0].id,'B');
d.state.blocked.add('B'); assert.equal(d.choices().length,0);
console.log('PASS changing position changes ranking; refill and outage filters work');
d.reset();d.state.located=true;
for (const name of ['welcome','location','search','results','detail','navigate','arrived']) {
  context.location.hash='#'+name;d.render();
  assert.ok(root.innerHTML.includes('campus-map'),name+' renders a map');
  assert.ok(!root.innerHTML.includes('NaN'),name+' has valid distances');
}
context.location.hash='#navigate';d.state.step=1;d.report();
assert.equal(d.state.origin,'ad');assert.ok(d.state.blocked.has('A'));assert.notEqual(d.state.selected,'A');
console.log('PASS all screens render; outage during navigation reroutes from current position');
d.reset();d.state.located=true;context.location.hash='#navigate';
const total=d.currentRoute().path.length-1;
for(let i=0;i<total;i++) handlers.click({target:{closest:()=>({dataset:{action:'walk'}})}});
assert.equal(context.location.hash,'arrived');
assert.equal(d.state.step,total);
assert.equal(d.esc('<img onerror="alert(1)">'),'&lt;img onerror=&quot;alert(1)&quot;&gt;');
console.log('PASS walking reaches destination; user text is HTML-escaped');
