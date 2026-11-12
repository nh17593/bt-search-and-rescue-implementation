// Only R2's received messages and local mission state are used here.
bb.known = bb.known || {}; bb.done = bb.done || {};
if (typeof bb.victim_report === 'string') {
  try { const m=JSON.parse(bb.victim_report); Object.assign(bb.known,m.found||{}); } catch(e) {}
}
const v2=bb.known.V2;
bb.urgent=!!(v2 && !bb.done.V2 && !bb.v2_timedout && tick<v2.expires);
bb.ordinary_allowed=!!(bb.done.V2 || bb.v2_timedout || (v2 ? tick>=v2.expires : tick>=35));
for (const id of ['V0','V1','V2']) {
  bb['pending_'+id]=!!(bb.known[id] && !bb.done[id]);
  if (bb.known[id]) {
    for(const n of Object.values(nodes).filter(n=>n.label==='Approach '+id)) { n.params=n.params||{}; n.params.target=bb.known[id].x+','+bb.known[id].y; }
  }
}
