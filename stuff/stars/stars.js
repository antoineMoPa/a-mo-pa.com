var can = document.querySelectorAll("canvas[name=stars]")[0];
var ctx = can.getContext("2d");

var w = can.width = window.innerWidth;
var h = can.height = window.innerHeight;

var starship = [w/2+20,h/2+20,7,4];
var planets = [[w/2,h/2],[3*w/4,h/2]];
var size = 10;

ctx.fillStyle = "#000";
ctx.fillRect(0,0,w,h);

function draw(){
    var s = starship;
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(s[0]-25,s[1]-size,size,size);
    ctx.beginPath();
    for(var i = 0; i < planets.length; i++){
        var p = planets[i];
        ctx.arc(p[0],p[1],size, 0, 2*Math.PI, false);
    }
    ctx.fill();
}

function update(){
    var s = starship;

    // compute speed
    s[0] += s[2];
    s[1] += s[3];
    //s[2] *= 0.9;
    //s[3] *= 0.9;

    for(var i = 0; i < planets.length; i++){
        var p = planets[i];
        // Planet gravity
        var d = dist(s[0],s[1],p[0],p[1]);
        s[2] -= 0.2 * 1/d * (s[0] - p[0]);
        s[3] -= 0.2 * 1/d * (s[1] - p[1]);
    }
}

function dist(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(y2 - y1,2) + Math.pow(x2 - x1,2));
}

window.ontouch = window.onmousedown = function(e){
    starship[3] -= 3;
};

setInterval(draw,20);
setInterval(update,20);

