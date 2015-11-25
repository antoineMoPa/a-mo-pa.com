(function(){
    can = document.createElement("canvas");
    
    wg = document.querySelectorAll(".weird-gizmos")[0];
    canwidth = wg.clientWidth;
    can.width = canwidth;
    can.height = wg.getAttribute("data-height");

    var x = 0;
    var y = 0;

    can.onmousemove = function(e){
	x = e.clientX;
	y = e.clientY;
    };
    
    wg.appendChild(can);

    ctx = can.getContext("2d");

    var dist = 10;
    var width = 20;
    var height = 5;
    
    var particles = [];
    var pres = 2 * Math.PI * height;
    var num = canwidth / dist;
    
    for(var i = 0; i < num; i++){
	var r = 2 * Math.random() + 2;
	var dir = Math.random() < 0.5? 1: 0;
	var curl = 0;
	var h = Math.random() * ((can.height-40)/height);
	var w = Math.pow(Math.random(),2) * 8 + 1;
	var x = dist * i;
	var rgba = "rgba("+
	    Math.floor(
		Math.random()*255)+
	    ","+
	    Math.floor(
		Math.random()*255)+
	    ","+
	    Math.floor(
		Math.random()*255)+	
	    ","+
	    Math.floor(
		Math.random()*255)+
	    ")";
	
	particles.push({
	    pos:[x,0],
	    h:h,
	    w:w,
	    r:r,
	    curl:curl,
	    dir:dir,
	    rgba:rgba
	});
    }
    
    function draw_particle(i,j,part){
	ctx.fillStyle = part.rgba;
	if(part.curl > 50){
	    var k = part.curl - 50;
	    var t =  (1-k/pres) * Math.PI;
	    var rx = part.r;
	    if(part.dir == 1){
		rx *= -1;
	    }

	    part.pos[0] += rx * Math.cos(t) + rx;
	    part.pos[1] += 2 * r * Math.sin(t);
	    
	    if(j > 150){
		part.curl = 0;
	    }
	}
	ctx.fillRect(part.pos[0],part.pos[1],part.w,height);
	part.curl++;
    }
    
    function distance(p1,p2){
	return Math.sqrt(Math.pow(p2[1] - p1[0],2) + Math.pow(p2[1] - p1[0],2));
    }
    
    function move_particles(){
	for(var i in particles){
	    var p = particles[i];
	    var d = distance(p.pos,[x,y]);
	    var factor = 0.01 * d/can.width;
	    var deltax = p.pos[0] - x;
	    var deltay = p.pos[1] - y;
	    var randx = Math.random() < 0.001? (Math.random() - 0.5) * 160: 0;
	    var randy = Math.random() < 0.001? (Math.random() - 0.5) * 160: 0;
	    p.pos[0] = p.pos[0] - factor * deltax + randx;
	    p.pos[1] = p.pos[1] - factor * deltay + randy;
	}
    }
    
    var time = 0;
    
    var interval = setInterval(function(){
	ctx.fillStyle = "rgba(255,255,255,0.1)";
	ctx.fillRect(0,0,can.width,can.height);
	for(var i = 0; i < num; i++){
	    move_particles(particles[i]);
	    draw_particle(i,time,particles[i]);
	}
	time++;
	//if(time > can.height / height){
	//    clearInterval(interval);
	//    console.log("done");
	//}
    },33);

})();
