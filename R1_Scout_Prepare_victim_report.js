// Perception: inspect only physically present packages within R1's sensor/FOV.
bb.found = bb.found || {};
for (const p of ENV.packages) {
  if (p.hidden || p.collected) continue;
  if (!inFOVfull(rob, p.x, p.y, getRobSensor(rob), FOV_DEG)) continue;
  bb.found[p.label] = {id:p.label,x:p.x,y:p.y,
    expires:p.timeoutTicks ? p._visibleSince + p.timeoutTicks : null};
}
bb.report = JSON.stringify({tick:tick,found:bb.found});
// Bind a local node parameter. Publish Topic does not evaluate bb references.
const pub = Object.values(nodes).find(n => n.label === 'Publish victim report');
if (pub) { pub.params = pub.params || {}; pub.params.payload = bb.report; }
