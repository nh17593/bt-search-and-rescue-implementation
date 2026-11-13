BT PLAYGROUND — THREE ROBOT TREES FOR HUMAN VICTIMS

This revision uses native human victims in Operation Quick Rescue, based on
upstream commit d9db22b22fe4b4f3c2c13436ccee6dd010bb60e8.
Your GitHub repository and the upstream playground are not modified.

IMPORTANT BEHAVIOR CHANGE
Rescue Victim marks a human rescued at their location and increments the
robot's victims_found counter. The current engine does not transport a
human to SZ. Medic returns to SZ after each rescue, without carrying a body.
Use the human rescue count and ENV.victims[].rescued as your success criteria.
Package deliveries and the zone's collected counter will remain zero.

SETUP — FOLLOW THIS ORDER FOR EVERY TRIAL
1. Open https://herolab-uga.github.io/robotics-bt-playground/ in a fresh page.
   To reproduce the reviewed source exactly, download index.html from:
   https://github.com/herolab-uga/robotics-bt-playground/blob/d9db22b22fe4b4f3c2c13436ccee6dd010bb60e8/index.html
   Open that downloaded file in a browser. No engine edits are needed.
2. Select Operation Quick Rescue (the human-victim scene).
   Do not select Operation Quick Pickup for this revision.
3. Open Import. Select bt_tree.json and bt_sim_config.json together, stage
   both, then Apply. Do not mix these files with the older package revision.
4. Confirm assignments: R1 -> R1 Scout, R2 -> R2 Medic, R3 -> R3 Guard.
   Select the imported R1 Scout BT tab (key scout), not the scene's empty tab.
   This reloads the saved ID filters on Scout's Victim Near? nodes.
5. Set the visible Robot speed slider to 10. Confirm global FOV 360 degrees,
   sensor ranges R1=200, R2=80, R3=42, communication ranges all 300,
   and global battery drain 0.7. Tick playback speed can be chosen freely.
6. Press Reset ONCE before your first Step/Run. Confirm tick 0, zero packages,
   three human victims, and no victims already rescued. V2 must have
   hidden=true, spawnAtTick=20, timeoutTicks=15. The scene loader initializes
   the human schedule; Reset initializes the imported W4 schedule.
7. Step or Run all robots together. Keep the Scout BT tab displayed.
   Do not switch BT tabs during a run: node IDs are recreated and task
   memory is indexed by ID. Use Explain and the BB robot selector instead.
8. For EVERY repeat trial, reload the page, select Operation Quick Rescue,
   reimport both files and repeat steps 4-6. Reset alone does not clear the
   human rescued flags or rearm V2 after a completed run in this source.

The configuration preserves the current native human positions, five
waypoints, four walls, human schedule and native Safe Zone rectangle.
Its packages array is intentionally empty. The importer does not apply
env.victims from JSON, so selecting the human scene FIRST is required.
The victims array included in the JSON files documents the intended scene;
it does not make the import standalone in this upstream version.

HOW THE TREES CHANGED
- Scout uses three native Victim Near? nodes, with ID filters V0, V1 and V2.
  Each visible detection is remembered locally, then published as one
  cumulative JSON string on /victim_found using P2=bb:report.
  Its coordinates come from sensors, not a direct ENV victim lookup.
- Medic receives victim_report through Read Topic and navigates using local
  BB keys target_V0, target_V1 and target_V2. It gives V2 first priority.
  A visibility/ID/range confirmation immediately precedes every Rescue
  Victim action. This prevents native rescue from accepting hidden V2.
- Human approach nodes use arrivalDist=24 and rescue/confirmation range=25.
  Human bodies are navigation obstacles with an 18-unit safety radius;
  the old package approach distance of 16 is unsuitable.
- Medic uses native a_rescue, never Pick Up or Drop Off. A utility selector
  retains the North/East SZ return-point choice after each rescue.
- Guard retains its RV obstacle watch and the complementary Boolean topics
  /corridor_blocked and /corridor_clear.
- EX2 arrivalDist is 12 so Scout can approach the waypoint while avoiding
  a nearby human body. Other navigation gains retain the previous values.

All mission state stays in each robot's local BB. Topic names still start
with /. Current topics are globally visible; communication range 300 does
not impose a radius on Publish Topic / Read Topic. This revision does not
claim distance-limited topic delivery.

V2's absolute deadline is 35, supplied by this fixed scene. A 14-tick timeout
also bounds the urgent attempt. If V2 is missed, Medic still attempts V1/V0.
For a different schedule, update the expiry in Scout's Remember nodes and
the fallback deadline in Medic's Update received mission expression.
The confirmation sensor remains the final check that V2 is physically active.

VERIFIED REFERENCE — SOURCE ENGINE WITH DISPLAY ADAPTERS
- V2 sensed and received: tick 20; rescued by Medic: tick 30.
- V1 rescued: tick 74; V0 rescued: tick 94.
- Medic completes SZ returns: ticks 57, 89 and 99.
- Guard publishes blocked at 15; Scout/Medic receive it at 16.
- W4 disappears at 40; Guard publishes clear at 42; receivers update at 43.
- All three native structural validators pass without warnings.
- Communication-disabled negative test: 0 human rescues.
- V2 timeout shortened to 8 ticks: V2 is missed, V1/V0 are still rescued;
  no hidden/expired V2 rescue is recorded.

These are source-engine results, not a claimed browser pass. Chromium could
not start in the execution environment. Run your own browser verification
and capture your own screenshots/logs. Do not submit REFERENCE_RESULTS.json
as if it were evidence from your browser.

BROWSER VERIFICATION
Pause at 20: Scout must have reported V2; Medic known.V2 must contain
x=290, y=90 and expires=35; urgent must be true.
Pause around 30: look for '[R2] Rescued victim V2' in the actual log and
verify V2.rescued=true and Medic victims_found=1 before tick 35.
By 100: V0/V1/V2 should all have rescued=true, Medic victims_found=3,
all_rescued=true, returns_completed=3, return_active=false, and Medic in SZ.
Guard's corridor notifications should switch as described above.

For an automated check, start a FRESH trial at tick 0 using the setup above.
Paste the complete contents of browser_verify.js into browser DevTools.
It runs 100 real Step operations, checks the actual state, and downloads
human_rescue_browser_evidence.json. It does not patch the engine or force
rescue outcomes. You can inspect window.humanRescueEvidence afterward.

Export the playground's Execution Log + Replay as well. This upstream log
and its replay snapshots omit the human victim array, so retain the
supplemental browser evidence and your screenshots for human-state checks.
The native renderer can show a hidden human icon: use hidden/rescued flags
and detection results, not the icon alone, to judge availability.
The scheduler may log a V2 timeout at 35 after a successful rescue; the
rescued flag and pre-deadline rescue event determine success.

REPRODUCING THE SOURCE-ENGINE CHECK
Download the pinned upstream index.html above. With Node.js installed run:
  node verify_reference.cjs /absolute/path/to/index.html
Run from this extracted folder or use the script's full path. No npm
dependencies are needed. The verifier checks the source hash, uses native
scene/BT/sensing/navigation/rescue/scheduling logic with display adapters,
and writes REFERENCE_RESULTS.json. It does not exercise the DOM/import UI.

MANUAL BUILD
Open BT_build_guide.html for every node's parent, sibling order, exact
P1/P2/P3 and Config Params. Paste the matching included .js snippets only
into the corresponding Custom Process Expression fields.

If the instructor still requires transporting human victims to SZ, this
native version does not implement that operation. This revision records
actual native rescues and Medic's own returns; it does not simulate delivery.
