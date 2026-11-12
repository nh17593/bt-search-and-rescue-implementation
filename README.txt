BT PLAYGROUND THREE-ROBOT TREES

Open BT_build_guide.html in a browser. It contains every node's parent,
left-to-right child order, exact settings, and all Custom Process expressions.
For a manual build, copy the matching code from the included .js file into
the node's Expression field. These snippets run inside Custom Process nodes.

For import: stage bt_tree.json and bt_sim_config.json together and apply.
Set the visible Robot speed slider to 10, display Scout, then use simulator
Reset before stepping. R1 -> Scout, R2 -> Medic, R3 -> Guard.

The config adds the missing physical collection zone around the SZ waypoint,
uses sensor range 200 for Scout, comm range 300 for every robot, FOV 360,
and preserves the original five waypoints, four walls and package schedules.

Engine reference: V2 picked up at 31; all three delivered by 97.
Tested using original source logic with rendering replaced by adapters.
Run the browser simulation yourself for your screenshot, log, and report.
Do not switch BT tabs mid-run: this implementation recreates node IDs.

Source commit: f9fa69bc91c57f80004c0d76f143128735d9a0b0
https://github.com/herolab-uga/robotics-bt-playground
