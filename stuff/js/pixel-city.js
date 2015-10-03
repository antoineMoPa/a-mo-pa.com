var can = document.querySelectorAll(".pixel-city")[0];
var ctx = can.getContext("2d");

can.height = can.getAttribute("data-height");
can.width = document.body.clientWidth;

var particles = [];
var max_depth = 5;
var min_dir_change = 1;
var max_children = 4;

for(var i = 0; i < 5; i++){
    particles.push(new_particle(0));
}

function new_particle(level,x,y){
    var x = x || Math.random() * can.width;
    var y = y || Math.random() * can.height;

    if(level == 0){
	var r = Math.floor(Math.random() * 255);
	var g = Math.floor(Math.random() * 50);
	var b = Math.floor(Math.random() * 55);
	var a = 1;
	var style = "rgba("+r+","+g+","+b+","+a+")";
    } else {
	style = -1;
    }
    
    return {
	stop: false,
	level: level,
	x: x,
	y: y,
	style: style,
	dir: 1, // 0 left 1 down 2 right 3 up
	children: [],
	last_dir_change: 0
    };
}

function draw(particles){
    for(var i = 0; i < particles.length; i++){
	var p = particles[i];
	var size = (Math.pow(1-p.level/max_depth, 2)) * 10;
	// Use fill style of parent for everything
	if(p.level == 0){
	    ctx.fillStyle = p.style;
	}
	if(!p.stop){
	    ctx.fillRect(p.x,p.y,size,size);
	    switch(p.dir){
	    case 0:
		p.x -= size;
		break;
	    case 1:
		p.y += size;
		break;
	    case 2:
		p.x += size;
		break;
	    case 3:
		p.y -= size;
		break;
	    }
	    if( p.last_dir_change > min_dir_change
		&& (Math.random() < 0.03) * 1
	      ){
		p.last_dir_change = 0;
		p.dir += Math.round(Math.random()*4);
		p.dir %= 4;
	    }
	    if(Math.random() < 0.02){
		p.stop = true;
	    }
	}
	draw(p.children);
	if( p.children.length < max_children
	    && p.level < max_depth && Math.random() < 0.1){
	    p.children.push(
		new_particle(p.level + 1, p.x,p.y)
	    );
	}
	p.last_dir_change++;
    }
}

function frame(){
    draw(particles);
}

var interval = setInterval(
    frame,
    30
);
