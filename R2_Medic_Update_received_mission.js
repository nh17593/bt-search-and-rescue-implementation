// No ENV victim lookup: mission locations come from Scout's received topic.
bb.known = bb.known || {};
bb.done = bb.done || {};
if (typeof bb.victim_report === 'string') {
  try {
    const report = JSON.parse(bb.victim_report);
    for (const [id, v] of Object.entries(report.found || {})) {
      if (['V0','V1','V2'].includes(id) && Number.isFinite(v.x) && Number.isFinite(v.y)) {
        bb.known[id] = v;
      }
    }
  } catch (e) {}
}
const v2 = bb.known.V2;
const deadline = v2 && Number.isFinite(v2.expires) ? v2.expires : 35;
bb.urgent = !!(v2 && !bb.done.V2 && !bb.v2_timedout && tick < deadline);
bb.ordinary_allowed = !!(bb.done.V2 || bb.v2_timedout || tick >= deadline);
for (const id of ['V0','V1','V2']) {
  bb['pending_'+id] = !!(bb.known[id] && !bb.done[id]);
  if (bb.known[id]) bb['target_'+id] = bb.known[id].x+','+bb.known[id].y;
}
bb.all_rescued = !!(bb.done.V0 && bb.done.V1 && bb.done.V2);
bb.mission_finished = !!(bb.done.V0 && bb.done.V1 && (bb.done.V2 || bb.v2_timedout || tick >= deadline));
