var canvas = document.getElementsByName("moire")[0];

var width = canvas.width;
var height = canvas.height;

var images = document.getElementsByTagName("img");

var deviceorientation = 0;

var mouseX = 0;
var mouseY = 0;
var halfX = width/2;
var halfY = height/2;

var layerMouseWeights = [0.6,0.18,0.04,0.04];
var layerZooms = [1,1,1,1];
var angles = [0,0,0.2,-0.2];

var hidden = document.querySelectorAll(".hidden");

for(var i = 0; i < hidden.length; i++){
    hidden[i].style.display = 'none';
}

function redraw(){
    var x,y,w,h,dw,dh;
    ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,width,height);
	for(i = images.length - 1; i >= 0 ; i--){
        w = layerZooms[i] * width;
        h = layerZooms[i] * height;
        dw = (w - width)/2;
        dh = (h - height)/2;
        
        x = layerMouseWeights[i] * 
            ((mouseX + deviceorientation * 3) - halfX);
        y = layerMouseWeights[i] * 
            (mouseY - halfY);
        ctx.rotate(angles[i]);

        ctx.drawImage(images[i],x-dw,y-dh,w,h);
        ctx.rotate(-angles[i]);
    }
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

window.addEventListener("deviceorientation",function(e){
    deviceorientation = e.gamma;
});

startInterval();

redraw();
