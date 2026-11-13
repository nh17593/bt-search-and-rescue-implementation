// Keep this a JSON string: Medic reads it into bb.victim_report.
// V2's deadline is supplied by the fixed Operation Quick Rescue scene.
bb.report = JSON.stringify({tick:tick,found:bb.found || {}});
