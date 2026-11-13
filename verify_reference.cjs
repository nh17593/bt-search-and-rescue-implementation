// Source-engine verification with display adapters; this is not a browser UI test.
// Usage: node verify_reference.cjs /path/to/downloaded/upstream/index.html
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const here=__dirname;
const source=fs.readFileSync(process.argv[2]||path.join(here,'upstream_index.html'),'utf8');
const commit='d9db22b22fe4b4f3c2c13436ccee6dd010bb60e8';
const treeBase=JSON.parse(fs.readFileSync(path.join(here,'bt_tree.json'),'utf8'));
const configBase=JSON.parse(fs.readFileSync(path.join(here,'bt_sim_config.json'),'utf8'));
const sourceHash=crypto.createHash('sha256').update(source.replace(/\r\n/g,'\n').trimEnd()).digest('hex');
assert.equal(sourceHash,'45cb25a1fcbf77661253608463b522653e1af5607504b2294e6d707a03d820f5',
 'This verifier expects upstream commit '+commit+'; review a changed engine before using its results.');
function section(start,end){
 const first=source.indexOf(start),last=source.indexOf(end,first+start.length);
 assert(first>=0&&last>first,'Source section missing: '+start);
 return source.slice(first,last);
}
const code=[
 section('const ND = {','// GLOBAL STATE'),
 section('function makeRobot(i){','// SLIDER CONTROLS'),
 section('function validateBT(){','// Show validation errors'),
 section('function tickBT(){','function getRobSensor'),
 section('function getRobSensor','// ═══════════════════════════════════════════\n// NAVIGATION HELPERS'),
 section('function _resolveNavTarget(paramStr','function checkObstacle'),
 section('function checkObstacle','function setRobotSensor'),
 section('function inFOVfull','// nodeUtility[id]'),
 section('function tickNode(id,rob,depth)','// Tick a snapshot BT'),
 section('function evaluateSchedules(){','// STUB FUNCTIONS (from removed responsive layer)'),
 section('const CHALL_OQR = {','const CHALL_FORAGING ='),
].join('\n');

function verifyStructure(t){
 const roots=Object.values(t.nodes).filter(n=>n.type==='root');assert.equal(roots.length,1);
 const seen=new Set();
 function walk(id){
  assert(!seen.has(id),'Cycle or duplicate parent: '+id);seen.add(id);const n=t.nodes[id];assert(n);
  if(['root','repeat','timeout','cooldown','force_ok','inverter'].includes(n.type))assert.equal(n.children.length,1);
  n.children.forEach(walk);
 }
 walk(roots[0].id);assert.equal(seen.size,Object.keys(t.nodes).length);
 const edgeSet=new Set(t.edges.map(e=>e.from+'|'+e.to));
 for(const n of Object.values(t.nodes))for(const child of n.children)assert(edgeSet.has(n.id+'|'+child));
}

function simulate(variant){
 const tree=JSON.parse(JSON.stringify(treeBase)),config=JSON.parse(JSON.stringify(configBase));
 Object.values(tree.btLibrary).forEach(verifyStructure);
 if(variant==='blackout')for(const t of Object.values(tree.btLibrary))for(const n of Object.values(t.nodes)){
  if(['a_pub_topic','a_sub_topic'].includes(n.type)){n.type='c_true';n.p1='';n.p2='';}
 }
 const context=vm.createContext({console,tree,config,Math,variant,setTimeout:()=>0,clearInterval:()=>0});
 vm.runInContext(`
 var document={getElementById:()=>null};
 var nodes,edges,robots,ENV,btLibrary,robBTAssign,activeBTId='scout';
 var tick=0,utilityScores={},lastTickTrace=[],nodeUtility={},GLOBAL_PARAMS={};
 var ROB_SPEED=config.globalSettings.ROB_SPEED,SENSOR_RANGE=config.globalSettings.SENSOR_RANGE,
     COMM_RANGE=config.globalSettings.COMM_RANGE,FOV_DEG=config.globalSettings.FOV_DEG,
     globalBatDrain=config.globalSettings.globalBatDrain;
 var robSensorRange=config.robSensorRange,robCommRange=config.robCommRange;
 var running=false,interval=null,_tickingActiveBT=true,logs=[],records=[],commLog=[],topicBus={},
     RCOLS=['a','b','c'],METRICS_HIST={},_lightDirty=false;
 function setNodeSt(){} function updateTick(){} function recordMetrics(){} function drawEdges(){}
 function renderBB(){} function renderComms(){} function updateExplainability(){}
 function renderSensorTab(){} function updateSbar(){} function evalCustomMetrics(){}
 function saveBTSnapshot(){btLibrary[activeBTId].nodes=nodes;btLibrary[activeBTId].edges=edges;}
 function logMsg(s){logs.push({tick,text:s.replace(/<[^>]*>/g,'')});}
 function addComm(from,to,key,value,type){commLog.push({tick,from,to,key,value,type});}
 function takeSnapshot(){records.push(JSON.parse(JSON.stringify({tick,
   robots:robots.map(r=>({name:r.name,x:r.wx,y:r.wy,status:r.status,bb:r.bb})),
   victims:ENV.victims,packages:ENV.packages,zones:ENV.collectionZones,trace:lastTickTrace,topics:topicBus,global:GLOBAL_PARAMS})));}
 ${code}
 // Model the native scene load first, then the actual importer's supported env fields.
 ENV=JSON.parse(JSON.stringify(CHALL_OQR.env));
 for(const k of ['walls','dynObstacles','collectionZones','chargingStations','lightSources','waypoints','packages']){
   ENV[k]=JSON.parse(JSON.stringify(config.env[k]||[]));
 }
 if(variant==='early-expiry')ENV.victims.find(v=>v.id==='V2').timeoutTicks=8;
 for(const o of [...ENV.walls,...ENV.victims,...ENV.packages]){
   if(o.waitTicks>0){o.hidden=true;o.spawnAtTick=o.waitTicks;}
 }
 btLibrary=JSON.parse(JSON.stringify(tree.btLibrary));robBTAssign=tree.robBTAssign;
 nodes=btLibrary.scout.nodes;edges=btLibrary.scout.edges;
 robots=[0,1,2].map(makeRobot);robots.forEach(resetRobotState);
 var structureChecks={};
 for(const [key,t] of Object.entries(btLibrary)){
  nodes=t.nodes;edges=t.edges;structureChecks[key]=validateBT();
 }
 nodes=btLibrary.scout.nodes;edges=btLibrary.scout.edges;
 `,context);
 const valid=vm.runInContext('structureChecks',context);
 Object.values(valid).forEach(v=>assert(v.ok,JSON.stringify(v.errors)));
 vm.runInContext('for(let i=0;i<100;i++)tickBT();',context,{timeout:15000});
 return JSON.parse(JSON.stringify(vm.runInContext('({records,logs,structureChecks})',context)));
}

const results={};
for(const variant of ['normal','early-expiry','blackout']){
 const r=simulate(variant),last=r.records.at(-1),medic=last.robots[1];
 assert.equal(r.records.length,100);assert.equal(last.packages.length,0);
 assert(!r.logs.some(l=>/CustomProcess error|halted/i.test(l.text)));
 for(const rec of r.records){
  assert.equal(Object.keys(rec.global).length,0);
  for(const m of rec.topics['/victim_found']||[]){
   const report=JSON.parse(m.value);if(m.tick<20)assert(!report.found.V2,'Hidden V2 was reported');
  }
 }
 const events=r.logs.filter(l=>/Rescued victim/.test(l.text));
 const rescued=last.victims.filter(v=>v.rescued).map(v=>v.id);
 assert.equal(medic.bb.victims_found,rescued.length);
 if(variant==='normal'){
  assert.deepEqual(rescued,['V0','V1','V2']);
  const v2=events.find(e=>e.text.includes('victim V2!'));assert(v2&&v2.tick>=20&&v2.tick<35);
  assert.equal(medic.bb.all_rescued,true);assert.equal(medic.bb.return_active,false);
  assert.equal(medic.bb.returns_completed,3);
  assert(last.zones.some(z=>medic.x>=z.x&&medic.x<=z.x+z.w&&medic.y>=z.y&&medic.y<=z.y+z.h));
  assert(r.records[19].robots[1].bb.known.V2);
  assert.equal(r.records[15].robots[1].bb.corridor_blocked,true);
  assert.equal(r.records[42].robots[1].bb.corridor_clear,true);
  assert(r.logs.some(l=>l.text.includes('Exploration turnaround: success')));
 }else if(variant==='early-expiry'){
  assert.deepEqual(rescued,['V0','V1']);assert.equal(medic.bb.all_rescued,false);
  assert(!events.some(e=>e.text.includes('victim V2!')),'Expired V2 was rescued');
 }else{assert.equal(rescued.length,0);assert.equal(Object.keys(medic.bb.known).length,0);}
 results[variant]={passed:true,rescued,rescueEvents:events,
   returnEvents:r.records.filter((rec,i)=>rec.robots[1].bb.returns_completed>(i?r.records[i-1].robots[1].bb.returns_completed||0:0))
     .map(rec=>({tick:rec.tick,total:rec.robots[1].bb.returns_completed})),
   finalMedic:{x:medic.x,y:medic.y,victims_found:medic.bb.victims_found,
     all_rescued:medic.bb.all_rescued,returns_completed:medic.bb.returns_completed||0},
   structureChecks:r.structureChecks};
}
const summary={verification:'source engine with display adapters; browser verification pending',
 sourceCommit:commit,sourceCanonicalSha256:sourceHash,results};
fs.writeFileSync(path.join(here,'REFERENCE_RESULTS.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
