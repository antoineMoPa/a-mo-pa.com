var can = document
    .querySelectorAll("canvas[name=potato]")[0];
ctx = can.getContext("2d");

w = can.width = 1000;
h = can.height = 800;

can.style.width = "100%";

ctx.fillStyle = "rgba(0,0,0,1)";
ctx.fillRect(0,0,w,h);

var int = setInterval(update,33);

var angle = 0;

var r = 0.1;
var g = 0.3;
var b = 0.7;

function update(){
    ctx.fillStyle = "rgba(0,0,0,0.01)";
    ctx.fillRect(0,0,w,h);
    
    ctx.save();
    ctx.translate(w/2,h/2)
    ctx.rotate(angle);
    ctx.fillStyle = "#000";
    ctx.font = '200px Sans-serif'
    ctx.fillText("JTM",-98,48);
    ctx.font = '200px Sans-serif'
    ctx.fillStyle = "rgb("+col(r)+","+col(g)+","+col(b)+")";
    ctx.fillText("JTM♥",-100,50);
    ctx.restore();

    function col(color){
        return parseInt(255 * Math.sin(color*30));
    }
    
    angle += 0.06;

    r += 0.003;
    g += 0.005;
    b += 0.0045;
}
