var canvas = document.getElementsByName("light")[0];

var width = canvas.width;
var height = canvas.height;

var mouseX = 0;
var mouseY = 0;

var rays = [];

function redraw(){
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000"
	ctx.clearRect(0,0,width,height);
	ctx.fillRect(0,0,width,height);
}

var interval;
    
function startInterval(){
    interval = setInterval(function(){
        redraw();
    },33);
}

function stopInterval(e){
    clearInterval(interval);
    e.preventDefault();
};

function move(e){
    mouseX = e.pageX - canvas.offsetLeft;
    mouseY = e.pageY - canvas.offsetTop;
    e.preventDefault();
}

function touchMove(e){
    mouseX = (e.targetTouches[0].pageX - canvas.offsetLeft);
    mouseY = (e.targetTouches[0].pageY - canvas.offsetTop);
    e.preventDefault();
}

if("ontouchstart" in document.documentElement){
    //canvas.ontouchstart = startInterval;
    //canvas.ontouchend = stopInterval;
    canvas.addEventListener("touchmove",touchMove);
} else {
    //canvas.onmouseenter = startInterval;
    //canvas.onmouseleave = stopInterval;
    canvas.onmousemove = move;
}

startInterval();

redraw();
