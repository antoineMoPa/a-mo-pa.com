var can = document
    .querySelectorAll("canvas[name='my-damn-canvas']")[0];
var ctx = can.getContext('2d');
var w = can.width = 500;
var h = can.height = 500;
var lastmousemove = {};

/**
   PARTICLES SPECIFICATION
   
   0: x
   1: y
   2: vx
   3: vy
   4: (auto) absolute speed
   5: (auto) absolute angle
   6: density (future)
   7: temperature (future)
 
*/

var particles = [];

can.onmousemove = function(e){
    lastmousemove = e;
}

function new_particle(x,y){
    particles.push([x,y,0,0]);
}

for(var i = 0; i < 10; i++){
    for(var j = 0; j < 10; j++){
	new_particle(i*30+30,j*30+30);
    }
}

setInterval(anim,100)

function anim(){
    calc();
    draw();
}

function calc(){
    var kcs = kcursorspeed = 0.1;
    var pointerX = lastmousemove.pageX || 0;
    var pointerY = lastmousemove.pageY || 0;
    for(var i = 0; i < particles.length;i++){
	// set speed according to pointer
	particles[i][2] = kcs * (pointerX - particles[i][0]);
	particles[i][3] = kcs * (pointerY - particles[i][1]);
	
	// find final speed
	// v = sqrt(vx ^ 2 + vy ^ 2) [pythagorus]
	particles[i][4] =
	    Math.sqrt(
		Math.pow(particles[i][2],2) +
		    Math.pow(particles[i][3],2)
	    )
	;
	// find final angle
	// angle = atan(vy/vx)
	if(particles[i][2] >= 0){
	    particles[i][5] =
		Math.atan(
		    (particles[i][3]) /
			(particles[i][2])
		)
	    ;
	} else {
	    particles[i][5] =
		Math.PI + Math.atan(
		    (particles[i][3]) /
			(particles[i][2])
		)
	    ;

	}
    }
}

function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "rgba(0,0,0,1)";
    for(var i = 0; i < particles.length;i++){
	ctx.save();
	var px = particles[i][0];
	var py = particles[i][1];
	ctx.beginPath();
	ctx.translate(px,py);
	ctx.rotate(particles[i][5]);
	ctx.rect(
	    -5,
	    -2,
	    10,
	    4
	);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#ff0000";
	ctx.beginPath()
	// draw magnet
	ctx.rect(
	    0,
	    -2,
	    5,
	    4
	)
	ctx.closePath();
	ctx.fill();
	
	ctx.restore();
    }
    
}
