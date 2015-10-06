var can = document.querySelectorAll(".trees-planet")[0];
var ctx = can.getContext("2d");

window.delay = 100;

// To work with or without canvas2gif
var render =  render || function(){};
var addFrame = addFrame || function(){};

can.width = 500;
can.height = 500;

var branches = [];
var max_size = 6;

// Planet radius
var pr = 10;
var athmosphere = 100;

/* sky */

ctx.fillStyle = "rgba(10,10,10,1)";
ctx.fillRect(0,0,can.width,can.height);

/* stars */

for(var i = 0; i < 40; i++){
    var x = Math.random() * can.width;
    var y = Math.random() * can.height;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(x,y,2,2);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(x-2,y-2,6,6);
}

/* Athmosphere */

for(var i = 0; i < can.width; i++){
    for(var j = 0; j < can.height; j++){
	// There comes the great Pythagorus
	var radius = Math.sqrt(
	    Math.pow(i-can.width/2,2) +
		Math.pow(j-can.height/2,2)
	);
	var planet_dist = radius - pr;
	if(planet_dist > athmosphere){
	    continue;
	}

	var blue = Math.pow(1 - planet_dist / athmosphere,4);
	
	var r = Math.floor(0);
	var g = Math.floor(0);
	var b = Math.floor(blue * 255);
	var a = blue;
	
	var style = "rgba("+r+","+g+","+b+","+a+")";
	ctx.fillStyle = style;
	ctx.fillRect(i,j,1,1);
    }
}


for(var i = 0; i < 300; i++){
    new_tree();
}

function new_tree(){
    branches.push(
	new_branch(
	    Math.floor(
		Math.pow(
		    Math.random(),
		    30
		)
		    * (max_size-1)
	    ) + 1
	)
    );
}

function new_branch(size,theta,radius){
    var size = size || max_size;
    var children = [];
    var vtheta = (Math.random()-0.5) * 0.02;
    var vradius = size/2;
    var radius = radius || pr;
    var theta = theta || Math.random() * 2 * Math.PI;
    var r = Math.floor((1-size/max_size) * 120);
    var g = Math.floor(Math.random() * 55);
    var b = Math.floor(Math.random() * 50);
    var a = 1;
    var style = "rgba("+r+","+g+","+b+","+a+")";
    
    return {
	stop: false,
	theta: theta,
	radius: radius,
	vtheta: vtheta,
	vradius: vradius,
	d: 0,
	style: style,
	size: size,
	children: children
    };
}

function draw(branches,level){
    var level = level || 0;
    for(var i = 0; i < branches.length; i++){
	var b = branches[i];
	ctx.fillStyle = b.style;
	// draw branch
	if(!b.stop){
	    var x = Math.cos(b.theta) * b.radius + can.width/2;
	    var y = Math.sin(b.theta) * b.radius + can.height/2;
	    
	    // Draw
	    ctx.fillRect(x,y,b.size,b.size);

	    // Move
	    var atheta = 0.02 * (Math.random() - 0.5);
	    b.vtheta += atheta;
	    b.vtheta *= 0.8;
	    //b.vtheta = -3+Math.abs(b.vtheta/1.6);
	    b.theta += b.vtheta;
	    b.radius += b.vradius;
	    b.size *= 0.98 * (1-r/10000);
	    if(b.size < 0.5){
		b.stop = true;
	    }
	    // add children sometimes
	    if(level < 3 && Math.random() < 0.08){
		b.children.push(
		    new_branch(b.size,b.theta,b.radius)
		);
	    }
	}
	draw(b.children,level + 1);
    }
}

var it = 0;
var interval = setInterval(function(){
    if(it > 100){
	clearInterval(interval);
	render();
    }
    if(it % 3 == 0){
	addFrame();
    }
    draw(branches);
    it++;
},100);

