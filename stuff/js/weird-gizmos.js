(function(){
    can = document.createElement("canvas");
    
    wg = document.querySelectorAll(".weird-gizmos")[0];
    canwidth = window.innerWidth;
    can.width = canwidth;
    can.height = wg.getAttribute("data-height");
    
    wg.appendChild(can);

    ctx = can.getContext("2d");

    var dist = 10;
    var width = 20;
    var height = 5;
    
    var particles = [];
    var pres = 2 * Math.PI * height;
    var num = canwidth / dist;
    
    for(var i = 0; i < num; i++){
	var r = 20 * Math.random() + 20;
	var dir = Math.random() < 0.5? 1: 0;
	var curl = 1;
	var h = Math.random() * ((can.height-40)/height);
	var w = Math.pow(Math.random(),2) * 8 + 1;
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
	if(j < part.h){
	    ctx.fillRect(i*dist,j*height,part.w,height);
	} else if (part.curl && j < part.h + pres){
	    var k = j - part.h;
	    var t =  (1-k/pres) * Math.PI;
	    var rx = part.r; 
	    if(part.dir == 1){
		rx *= -1;
	    }
	    ctx.fillRect(
		i * dist + rx * Math.cos(t) + rx,
		part.h * height + 2 * r * Math.sin(t),
		part.w - (part.w * (k/pres)),
		height - (height * (k/pres))
	    );
	}
    }

    var time = 0;
    
    var interval = setInterval(function(){
	for(var i = 0; i < num; i++){
	    draw_particle(i,time,particles[i]);
	}
	time++;
	if(time > can.height / height){
	    clearInterval(interval);
	    console.log("done");
	}
    },33);
})();
