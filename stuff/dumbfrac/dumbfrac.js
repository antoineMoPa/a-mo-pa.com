var can = document
    .querySelectorAll("canvas[name=potato]")[0];
ctx = can.getContext("2d");

//w = can.width = window.innerWidth;
//h = can.height = window.innerHeight;
w = can.width = 300;
h = can.height = 300;


ctx.fillStyle = "#000"
ctx.fillRect(0,0,w,h);

num = 7;

var arr = [];

for(var i = 0; i < w; i++){
    arr[i] = [];
    for(var j = 0; j < h; j++){
        arr[i][j] = i/w+j/h;
    }
}

can.onclick = update;

setInterval(update,33);

function update(){
    iterate();
    draw_frac();
}

var exp = 1;

function iterate(){
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            arr[i][j] = i/w + j/h + arr[i][j];
        }
    }
}

function draw_frac(){
    var data = ctx.createImageData(w,h);
    for(var i = 0; i < w; i++){
        for(var j = 0; j < h; j++){
            var index = 4 * (j * w + i);
            var red = 0;
            if((arr[i][j] * Math.pow(10,exp)) % 10 < 5){
                red = 254;
            }
            data.data[index+0] = red;
            data.data[index+1] = 0;
            data.data[index+2] = 0;
            data.data[index+3] = 254;
        }
    }

    ctx.putImageData(data,0,0);
}
