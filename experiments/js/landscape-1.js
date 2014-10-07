var canvas = document.getElementsByName("landscape-1")[0];

var width = canvas.width;
var height = canvas.height;

var images = document.getElementsByTagName("img");

var mouseX = 0;
var mouseY = 0;
var halfX = width/2;
var halfY = height/2;

var layerMouseWeights = [0.04,0.028,0.024,0.020,0.05,0.01]

function redraw(){
    var x,y;

	ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,width,height);

	for(i = images.length - 1; i >= 0 ; i--){
        x = layerMouseWeights[i] * (mouseX - halfX);
        y = layerMouseWeights[i] * (mouseY - halfY);
	    ctx.drawImage(images[i],x,y);
    }
}

var interval;
    
function startInterval(){
    interval = setInterval(function(){
        redraw();
    },33)
}

redraw();

canvas.onmouseenter = startInterval;
canvas.onmouseleave = function(){
    clearInterval(interval);
};

canvas.onmousemove = function(e){
    mouseX = e.clientX - canvas.offsetLeft;
    mouseY = e.clientY - canvas.offsetTop + window.scrollY;
}