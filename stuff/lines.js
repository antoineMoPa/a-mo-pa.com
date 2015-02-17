var can = document.querySelectorAll("canvas[name=tomato]")[0];
var ctx = can.getContext("2d");

w = 500;
h = 500;

can.width = w;
can.height = h;

ctx.fillStyle = "rgba(0,0,0,0.1)"
ctx.fillRect(0,0,w,h)

var lastX = 0;
var lastY = 0;

var points = [];

can.onclick = function(e){
    ctx.fillStyle = "rgba(0,0,0,0.9)"
    x = e.clientX - can.offsetLeft;
    y = e.clientY - can.offsetTop;
    
    var res = 20;
    
    var dx = x - lastX;
    var dy = y - lastY;
    
    ctx.fillRect(x-2, y-2, 4, 4);
    
    for(var i = 0; i < res ; i++){        
        
        var m = lastX + i / res * dx;
        var n = lastY + i / res * dy;
        
        ctx.fillRect(m-1, n-1, 2, 2);
    }
   

    lastX = x;
    lastY = y;
};

var points = [];