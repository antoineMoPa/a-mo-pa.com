var can = document.querySelectorAll(".curves")[0];
var ctx = can.getContext("2d");

//can.height = can.getAttribute("data-height");
//can.width = document.body.clientWidth;

can.width = 400;
can.height = 400;

var iteration = 1;

function draw(){
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    var dist = 10;
    for(i = 0; i < can.width/dist; i++){
	var t = iteration / dist;
	var r = 30 + 20 * Math.cos(i/5);
	var size = 2 + 3 * Math.cos(i);
	var x = i * dist + r * Math.cos(t);
	var y = can.height - iteration + r * Math.sin(t) + 100 * Math.cos(i/20) + 50;
	ctx.fillRect(x,y,size,size);
    }
    iteration++;
}

function frame(){
    ctx.fillStyle = "rgba(255,255,255,0)";
    //ctx.fillRect(0, 0, can.width, can.height);
    draw();
}

var interval = setInterval(
    frame,
    80
);
