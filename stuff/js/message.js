var can = document
    .querySelectorAll("canvas[name=potato]")[0];
ctx = can.getContext("2d");

w = can.width = 1000;
h = can.height = 800;

var message = window.location.hash.slice(1);

document.title = message;

can.style.height = "100%";
can.style.width = "100%";

ctx.fillStyle = "rgba(0,0,0,1)";
ctx.fillRect(0,0,w,h);

var int = setInterval(update,33);

var angle = 0;

var normal_size = 200 - 20 * message.length;

if(normal_size < 20){
    normal_size = 20;
}

var size = 500;

var r = 0.1;
var g = 0.3;
var b = 0.7;

function update(){
    ctx.fillStyle = "rgba(0,0,0,0.01)";
    ctx.fillRect(0,0,w,h);
    
    ctx.save();
    ctx.translate(w/2,h/2)
    ctx.rotate(angle);
    ctx.font = parseInt(size)+'px Sans-serif'
    ctx.fillStyle = "rgb("+col(r)+","+col(g)+","+col(b)+")";
    ctx.fillText(message,-100,50);
    ctx.restore();

    function col(color){
        return parseInt(255 * Math.sin(color*20));
    }

    if(size > normal_size){
        angle += 0.2;
    } else {
        angle += 0.02;
    }
    r += 0.003;
    g += 0.005;
    b += 0.0045;
    if(size > normal_size){
        if(size > 200){
            size-=3;
        } else {
            size-=1;
        }
    } else {
        size = normal_size;
    }
}
