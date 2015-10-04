var can = document.querySelectorAll(".trees")[0];
var ctx = can.getContext("2d");

window.delay = 100;

// To work with or without canvas2gif
var render =  render || function(){};
var addFrame = addFrame || function(){};

can.width = 400;
can.height = 400;

var branches = [];
var max_size = 10;

/* sky */

for(var i = 0; i < can.height; i++){
    var h = i/can.height;
    var b = Math.floor(100+h*100);
    var r = Math.floor(25+h*150);
    var g = Math.floor(45+h*50);

    var a = 1;
    var style = "rgba("+r+","+g+","+b+","+a+")";
    ctx.fillStyle = style;
    ctx.fillRect(0,i,can.width,1);
}

/* stars */

for(var i = 0; i < 40; i++){
    var x = Math.random() * can.width;
    var y = Math.random() * can.height;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(x,y,2,2);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(x-2,y-2,6,6);
}

for(var i = 0; i < 300; i++){
    new_tree();
}

function new_tree(x,y){
    var x = x || Math.random() * can.width;
    var y = y || can.height;
    branches.push(
	new_branch(x,y,
		   Math.floor(
		       Math.pow(
			   Math.random(),
			   130
		       )
			   * (max_size-1)
		   ) + 1
		  )
    );
}

function new_branch(x,y,size){
    var size = size || max_size;
    var children = [];
    var vx = (Math.random()-0.5) * 2;
    var vy = size/2;
    var r = Math.floor((1-size/max_size) * 80);
    var g = Math.floor(Math.random() * 55);
    var b = Math.floor(Math.random() * 50);
    var a = 1;
    var style = "rgba("+r+","+g+","+b+","+a+")";
    
    return {
	stop: false,
	x: x,
	y: y,
	vx: vx,
	vy: vy,
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
	    ctx.fillRect(b.x,b.y,b.size,b.size);
	    b.vx += 2*(Math.random()-0.5);

	    var ax = (Math.random() - 0.5);
	    b.vx += ax;
	    b.vx *= (1-Math.abs(b.vx)/40);
	    b.vy = -3+Math.abs(b.vx/1.6);
	    b.y += b.vy;
	    b.x += b.vx;
	    b.d += Math.sqrt(Math.pow(b.vx,2) + Math.pow(b.vy,2));
	    b.size *= 0.98 * (1-b.d/10000);
	    if(b.size < 0.5){
		b.stop = true;
	    }
	    // add children sometimes
	    if(level < 3 && Math.random() < 0.08){
		b.children.push(
		    new_branch(b.x,b.y,b.size)
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

