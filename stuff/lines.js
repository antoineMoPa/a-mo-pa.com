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
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    for(var i = 0; i < points.length; i++){
        ctx.fillRect(points[i][0]-2, points[i][1]-2, 4, 4);   
    }
    for(var i = 1; i < points.length - 1; i+=2){   
        var res = 20;
        // point
        var p = points[i];
        // lastpoint
        var lp = points[i-1];
        var np = points[i+1];             
        
        for(var j = 0; j < res ; j++){             
            var k = j/res;
            var m = k * np[0] + (1-k) * lp[0];
            var n = k * np[1] + (1-k) * lp[1];
            if(k < 0.5){
                var u = 2*k
                var q = (1-u) * lp[0] + (u) * p[0];
                var r = (1-u) * lp[1] + (u) * p[1];
                m = u * q + (1-u) * m;
                n = u * r + (1-u) * n;
            }
            if(k >= 0.5){
                var u = 1-2*(k-0.5);
                var q = (1-u) * np[0] + (u) * p[0];
                var r = (1-u) * np[1] + (u) * p[1];
                m = u * q + (1-u) * m;
                n = u * r + (1-u) * n;
            }
            
            ctx.fillRect(m-1, n-1, 2, 2);
        }
    }
}

var points = [];
