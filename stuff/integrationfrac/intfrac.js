var can = document
    .querySelectorAll("canvas[name=potato]")[0];
ctx = can.getContext("2d");

//w = can.width = window.innerWidth;
//h = can.height = window.innerHeight;
w = can.width = 500;
h = can.height = 500;

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

can.onclick = update;

setInterval(update,100);

function update(){
    iterate();
    draw_frac();
}

function f(i,j,x){
    var i = 0.1 * i;
    var j = 0.1 * j;

    //return i * Math.pow(x, 2) + j * Math.pow(x,2);
    //return Math.sin(i * x) + Math.cos(j * x);
    //return Math.sin(i*x) * Math.cos(j*x);
    return Math.cos(i*x) * Math.sin(j*x) * i * j;
}

var x = 0;
var dx = 0.0005;
var w2 = w/2;
var h2 = h/2;

function iterate(){
    x += dx;
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            //arr[i][j] += dx * (f(i-w2,j-h2,x) - f(i-w2,j-h2,x-dx))
	        // Crazy shit:
	        arr[i][j] += dx * f(i-w2,j-h2,x*(i-w2)*(j-h2))
	        // Stars + shooting stars
	        //arr[i][j] += dx * f(i-w2,j-h2,x*(i-w2)*(j-h2))
	        // shit looks like water
	        //arr[i][j] += dx * f((i-w2),(j-h2),x)
	        //arr[i][j] += dx * f((i-w2)*x,(j-h2)*Math.pow(x,2),x)
        }
    }
}

function draw_frac(){
    var data = ctx.createImageData(w,h);
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var index = 4 * (j * w + i);
            var red = arr[i][j] * 155;
            var green = arr[i][j] * 55;
            var blue = arr[i][j] * 255;

            data.data[index+0] = red;
            data.data[index+1] = green;
            data.data[index+2] = blue;
            data.data[index+3] = 254;
        }
    }

    ctx.putImageData(data,0,0);
}
