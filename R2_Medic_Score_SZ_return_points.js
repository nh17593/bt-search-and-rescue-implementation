if (!bb.return_scored) {
  const right=rob.wx>148;
  const prefix=right ? (bb.last_rescued==='V2'
    ? Math.hypot(rob.wx-295,rob.wy-55)+Math.hypot(295-150,55-25)+35
    : Math.hypot(rob.wx-150,rob.wy-25)+35) : 0;
  const cost=(x,y)=>right ? prefix+Math.hypot(115-x,25-y) : Math.hypot(rob.wx-x,rob.wy-y);
  bb.score_north=1000/(1+cost(95,50));
  bb.score_east=1000/(1+cost(95,80));
  bb.return_scored=true;
}
