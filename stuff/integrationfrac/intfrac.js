var can = document
    .querySelectorAll("canvas[name=potato]")[0];
ctx = can.getContext("2d");

//w = can.width = window.innerWidth;
//h = can.height = window.innerHeight;
w = can.width = 300;
h = can.height = 300;

can.style.width = "100%";
can.style.height = "100%";

ctx.fillStyle = "#000"
ctx.fillRect(0,0,w,h);

num = 7;

var arr = [];

for(var i = 0; i < w; i++){
    arr[i] = [];
    for(var j = 0; j < h; j++){
        arr[i][j] = 0;
    }
}

// y = i x ** 2 + j x

can.onclick = update;

setInterval(update,100);

function update(){
    iterate();
    draw_frac();
}

function f(i,j,x){
    //return Math.pow(i * x, 2) + j * x;
    return Math.sin(i * x) + Math.cos(j * x);
}

var x = 0;
var dx = 0.03;
function iterate(){
    x += dx;
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            //arr[i][j] += dx * (f(i,j,x) - f(i,j,x-dx))
	    // Crazy shit:
	    //arr[i][j] += dx * f(i,j,x*i)
	    // Stars + shooting stars
	    //arr[i][j] += dx * f(i,j,x*i*j)
	    // shit looks like water
	    //arr[i][j] += dx * f(i*ex,j*x,x)
	    arr[i][j] += dx * f(i*x,j*Math.pow(x,2),x)
        }
    }
}

function draw_frac(){
    var data = ctx.createImageData(w,h);
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var index = 4 * (j * w + i);
            var red = arr[i][j] * 255;
            var green = arr[i][j] * 255;
            var blue = arr[i][j] * 255;

            data.data[index+0] = red;
            data.data[index+1] = green;
            data.data[index+2] = blue;
            data.data[index+3] = 254;
        }
    }

    ctx.putImageData(data,0,0);
}
