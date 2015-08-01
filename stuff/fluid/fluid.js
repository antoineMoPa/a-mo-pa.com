var can = document
    .querySelectorAll("canvas[name='my-damn-canvas']")[0];
var ctx = can.getContext('2d');
var w = can.width = 500;
var h = can.height = 500;
var lastmousemove = {};
/* see particle_spec.txt */
var particles = [];

can.onmousemove = function(e){
    lastmousemove = e;
}

for(var i = 0; i < 10; i++){
    for(var j = 0; j < 10; j++){
	new_particle(i*30+30,j*30+30);
    }
}

function new_particle(x,y){
    particles.push([
	x,
	y,
	0,   // vx
	0,   // vy
	0,   // speed
	0,   // angle
	0.1, // fx
	0.1, // fy
	0,   // ax
	0,   // ay
	0.2  // mass
    ]);
}

setInterval(anim,100)

function anim(){
    calc();
    draw();
}

function calc(){
    var kcs = kcursorspeed = 1;
    var pointerX = lastmousemove.pageX || 0;
    var pointerY = lastmousemove.pageY || 0;
    for(var i = 0; i < particles.length;i++){

	// reset forces
	particles[i][6] = 0;
	particles[i][7] = 0;

	var deltaX = pointerX - particles[i][0];
	var deltaY = pointerY - particles[i][1];
	var d = Math.sqrt(
	    Math.pow(deltaX,2) +
		Math.pow(deltaY,2)
	);
	// towards pointer force
	particles[i][6] += kcs * deltaX / Math.pow(
	    d,2
	);
	particles[i][7] += kcs * deltaY / Math.pow(
	    d,2
	);
    }
    
    // calculate acceleration, speed, update position
    for(var i = 0; i < particles.length;i++){
	//
	// F = ma => a = f/m
	// (yeah)

	// x
	particles[i][8] = particles[i][6] / particles[i][10];
	// y
	particles[i][9] = particles[i][7] / particles[i][10];
	
	//
	// v = v + a
	//

	// x
	particles[i][2] = particles[i][2] + particles[i][8];
	// y
	particles[i][3] = particles[i][3] + particles[i][9];

	//
	// p = p + v
	//
	
	// x
	particles[i][0] = particles[i][0] + particles[i][2];
	// y
	particles[i][1] = particles[i][1] + particles[i][3];
	
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
