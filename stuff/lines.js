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
draw();
can.onclick = function(e){
    x = e.clientX - can.offsetLeft;
    y = e.clientY - can.offsetTop;
    points.push([x,y]);
    draw();
};

function draw(){
    ctx.fillStyle = "#eee";
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    for(var i = 0; i < points.length; i++){
        ctx.fillRect(points[i][0]-2, points[i][1]-2, 4, 4);   
    }
    for(var i = 1; i < points.length - 1; i+=2){   
        var res = 100;
        // point
        var p = points[i];
        // lastpoint
        var lp = points[i-1];
        var np = points[i+1];             
        
        for(var j = 0; j < res ; j++){             
            var k = j/res;
            var m = k * lp[0] + (1-k) * p[0];
            var n = k * lp[1] + (1-k) * p[1];
            var q = k * p[0] + (1-k) * np[0];
            var r = k * p[1] + (1-k) * np[1];
            var s = k * m + (1-k) * q;
            var t = k * n + (1-k) * r;

            ctx.fillRect(s-1, t-1, 2, 2);
        }
    }
}

var points = [];
