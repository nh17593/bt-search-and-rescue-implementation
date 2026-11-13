// Coordinates come only from the preceding Victim Near? sensor.
bb.found = bb.found || {};
const id = bb.victim_id;
bb.found[id] = {id:id,x:bb.victim_x,y:bb.victim_y,
  expires:id==='V2' ? 35 : null};
