BT PLAYGROUND: THREE-ROBOT RESCUE TREES

Overview
This repository contains a Behavior Tree implementation for the BT Playground rescue scenario with three robots: R1 Scout, R2 Medic, and R3 Guard. The source logic is based on the original project at commit f9fa69bc91c57f80004c0d76f143128735d9a0b0, with the rendering layer adapted for this implementation.

The repository includes:
- bt_tree.json: the staged behavior tree data for all three robots
- bt_sim_config.json: the simulation configuration and required scene correction
- BT_build_guide.html: the full manual build guide with exact node parent/child order, settings, and all Custom Process expressions
- R1_Scout_Prepare_victim_report.js and the related R2 Medic scripts: the matching code for the Custom Process nodes

Quick start
1. Open BT_build_guide.html in a browser for the complete build guide.
2. To import the project, load Operation Quick Rescue, then import bt_tree.json and bt_sim_config.json together and apply.
3. Set the visible Robot speed slider to 10.
4. Display Scout before stepping the simulation.
5. Reset the simulator before the first Step or Run.
6. Use R1 -> Scout, R2 -> Medic, R3 -> Guard.

Required setup and scene notes
- The config adds the missing physical collection zone around the SZ waypoint.
- Scout uses sensor range 200; every robot uses communication range 300.
- Global FOV is 360 degrees.
- The original five waypoints, four walls, and package schedules are preserved.
- Use the simulator's Reset before stepping because delayed appearances are initialized there: W4 at 15 and V2 at 20.
- Do not switch BT tabs mid-run. This implementation recreates node IDs, which can invalidate the ID-indexed memory of running tasks.
- For a manual build, copy the Custom Process JavaScript snippets from the matching .js file into the node's Expression field. These snippets are intended to run inside Custom Process nodes, not in the browser console.
- Keep Scout visible during the run. The Explain pane contains the trace for all robots.

Scene correction
The stock rescue scene has an SZ waypoint but an empty collectionZones list. A drop off outside the collection zone re-creates an uncollected package. The supplied config adds a collection rectangle around SZ with the following area: x=60, y=45, width=40, height=40. Its valid drop targets are North=(95,50) and East=(95,80).

Build guide summary
The full manual build guide in BT_build_guide.html describes every node, parent, left-to-right child order, exact settings, and Custom Process expressions. Use it as the authoritative reference if you are not importing the JSON files.

How to build from the tables
- Start with the Root node and add each numbered node in order.
- Apply the exact label and settings shown in the guide.
- Connect each node to its numbered parent.
- Arrange children left-to-right in the same priority order shown in the guide.
- Composite nodes can have several children; decorators take exactly one child.
- For Navigate To nodes, use the required coordinates and config parameters when specified.
- Publish Topic values accept a literal or local ~parameter, but not an evaluated bb.key expression.
- Blackboard state is local. Do not prefix a BB key with /, do not select global scope, and do not write GLOBAL_PARAMS.

Robot behaviors
R1 Scout
- Receives corridor updates
- Scans and broadcasts a cumulative discovery report
- Resumes the stateful exploration itinerary
- Uses the EX2 branch to choose the upper bypass when blocked

R2 Medic
- Reads discoveries from Read Topic
- Picks up packages and travels to valid drop-off points
- Uses the collection zone and the North/East drop targets as defined by the scene config

R3 Guard
- Handles obstacle avoidance and guard-route behavior
- Uses the appropriate navigation and obstacle settings in the guide

Verification and run notes
- Engine reference: V2 is picked up at tick 31; all three deliveries are complete by tick 97.
- This was tested using the original source logic with rendering replaced by adapters.
- Run the browser simulation yourself for your screenshot, log, and report.

Repository source
Source commit: f9fa69bc91c57f80004c0d76f143128735d9a0b0
Repository: https://github.com/herolab-uga/robotics-bt-playground

The exhaustive node tables and all code snippets are in BT_build_guide.html and the included .js files. This README is the condensed combined reference for setup, import, runtime notes, and build workflow.
