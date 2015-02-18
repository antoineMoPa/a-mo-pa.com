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
can.onmousedown = function(e){
    x = e.clientX - can.offsetLeft;
    y = e.clientY - can.offsetTop;
    down(x,y);
};
can.onmouseup = function(e){
    x = e.clientX - can.offsetLeft;
    y = e.clientY - can.offsetTop;
    up(x,y);
};

can.onmousemove = function(e){
    x = e.clientX - can.offsetLeft;
    y = e.clientY - can.offsetTop;
    if(dragging != -1){
        points[dragging] = [x,y];
        draw();
    }
};

var dragging = -1;
function down(x,y){
    // Verify if a point was clicked
    var selected = -1;
    var treshold = 6;
    for(var i in points){
        var point = points[i];
        var d = distance(point[0],point[1],x,y);
        if(d < treshold){
            selected = i;
            break;
        }
    }
    if(selected == -1){
        points.push([x,y]);
    } else {
        dragging = selected;
    }
    draw();
}

function up(x,y){
    if(dragging != -1){
        points[dragging] = [x,y];
        dragging = -1;
        draw();
    }
 }

function distance(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(y2 - y1,2) + Math.pow(x2 - x1,2));
}

function draw(){
    ctx.fillStyle = "#eee";
    ctx.fillRect(0,0,w,h);
    for(var i = 0; i < points.length; i++){
        var size = 3;
        if(dragging != -1 && dragging == i){
            ctx.fillStyle = "rgba(255,0,0,0.9)";
        } else {
            ctx.fillStyle = "rgba(0,0,0,0.9)";
        }
        ctx.fillRect(points[i][0]-size, points[i][1]-size, 2*size,2*size);   
    }
    ctx.fillStyle = "rgba(0,0,0,0.9)";
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
