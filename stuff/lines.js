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
    x = e.clientX - can.offsetLeft;
    y = e.clientY - can.offsetTop;
    points.push([x,y]);
    draw();
};

function draw(){
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    for(var i = 1; i < points.length; i++){   
        var res = 20;
        // point
        var p = points[i];
        // lastpoint
        var lp = points[i-1];
        var dx = p[0] - lp[0];
        var dy = p[1] - lp[1];
        
        ctx.fillRect(p[0]-2, p[1]-2, 4, 4);        
        
        for(var j = 0; j < res ; j++){             
            var m = lp[0] + j / res * dx;
            var n = lp[1] + j / res * dy;            
            ctx.fillRect(m-1, n-1, 2, 2);
        }
    }
}

var points = [];