// Optional DevTools check. Runs 100 real playground steps and downloads actual evidence.
// First follow README.txt through the fresh scene load, import, Scout selection and Reset.
(async () => {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  check(!running && tick === 0, 'Start paused at tick 0 after a fresh scene load and import.');
  check(activeBTId === 'scout', 'Select the imported R1 Scout BT tab before starting.');
  check(ROB_SPEED === 10 && FOV_DEG === 360, 'Set Robot speed to 10 and FOV to 360.');
  check(ENV.packages.length === 0, 'Use Operation Quick Rescue with no packages.');
  check(ENV.victims.length === 3 && ENV.victims.every(v => !v.rescued),
    'Reload Operation Quick Rescue and reimport: Reset alone does not restore rescued humans.');
  const v2 = ENV.victims.find(v => v.id === 'V2');
  check(v2 && v2.hidden && v2.spawnAtTick === 20 && v2.timeoutTicks === 15,
    'Fresh native V2 schedule required: appear 20, expire 35.');
  check(Object.entries({0:'scout',1:'medic',2:'guard'}).every(([i,id]) => robBTAssign[i] === id),
    'Assign R1 to scout, R2 to medic, R3 to guard.');
  const filters = Object.values(nodes).filter(n => n.type === 'c_victim').map(n => n.p3).sort();
  check(JSON.stringify(filters) === JSON.stringify(['V0','V1','V2']),
    'Scout ID filters missing. Select the imported R1 Scout tab to reload its saved fields.');

  const records = [], events = [], originalLogMsg = logMsg;
  logMsg = function (html) {
    if (/Rescued victim|appeared at tick|timed out at tick|CustomProcess error/.test(html)) {
      events.push({tick, text:html.replace(/<[^>]*>/g,'')});
    }
    return originalLogMsg(html);
  };
  try {
    for (let i = 0; i < 100; i++) {
      stepOnce();
      check(tick === i + 1, 'Simulation halted; inspect the BT validation and error logs.');
      records.push(JSON.parse(JSON.stringify({tick,
        victims:ENV.victims,
        robots:robots.map(r => ({name:r.name,x:r.wx,y:r.wy,
          victims_found:r.bb.victims_found,known:r.bb.known,done:r.bb.done,
          urgent:r.bb.urgent,v2_timedout:r.bb.v2_timedout,
          return_active:r.bb.return_active,returns_completed:r.bb.returns_completed,
          corridor_blocked:r.bb.corridor_blocked,corridor_clear:r.bb.corridor_clear})),
        topics:Object.fromEntries(Object.entries(topicBus).map(([key,messages]) => [key,messages.at(-1)])),
        trace:lastTickTrace
      })));
      await new Promise(resolve => setTimeout(resolve,0));
    }
  } finally {
    logMsg = originalLogMsg;
  }
  const rescueEvents = events.filter(e => e.text.includes('Rescued victim'));
  const v2Rescue = rescueEvents.find(e => e.text.includes('victim V2!'));
  const last = records.at(-1), medic = last.robots[1];
  const tests = {
    noPrematureV2Report:records.slice(0,19).every(r =>
      !JSON.parse(r.topics['/victim_found']?.value || '{"found":{}}').found.V2),
    receivedV2ByTick20:!!records[19].robots[1].known?.V2,
    v2RescuedBefore35:!!v2Rescue && v2Rescue.tick >= 20 && v2Rescue.tick < 35,
    allThreeHumansRescued:last.victims.length === 3 && last.victims.every(v => v.rescued),
    nativeRescueCount:medic.victims_found === 3,
    returnedToSZ:medic.returns_completed === 3 && !medic.return_active && ENV.collectionZones.some(z =>
      medic.x >= z.x && medic.x <= z.x+z.w && medic.y >= z.y && medic.y <= z.y+z.h),
    blockedReceivedAt16:records[15].robots[1].corridor_blocked === true,
    clearReceivedAt43:records[42].robots[1].corridor_clear === true
  };
  const evidence = {kind:'actual browser simulation',sourceReference:'d9db22b22fe4b4f3c2c13436ccee6dd010bb60e8',
    actualSourceVersion:'Verify the deployed or downloaded index.html separately; this is not an automatic source hash check.',
    generated:new Date().toISOString(),tests,rescueEvents,events,records};
  window.humanRescueEvidence = evidence;
  console.table(tests); console.table(rescueEvents);
  const url = URL.createObjectURL(new Blob([JSON.stringify(evidence,null,2)],{type:'application/json'}));
  const anchor = document.createElement('a');
  anchor.href=url; anchor.download='human_rescue_browser_evidence.json'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
  console.log('Actual browser evidence saved. Overall pass:',Object.values(tests).every(Boolean));
})();
