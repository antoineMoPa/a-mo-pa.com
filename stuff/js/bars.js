var can = document
    .querySelectorAll("canvas[name=potato]")[0];
ctx = can.getContext("2d");

w = can.width = window.innerWidth;
h = can.height = window.innerHeight;

ctx.fillStyle = "#000"
ctx.fillRect(0,0,w,h);

num = 7;

ctx.fillStyle = "rgba(255,100,0,0.1)";
draw_bars();

function draw_bars(){
    //lines
    var barh = h / num;
    for(var i = 0; i < num; i+=2){
        ctx.fillRect(
            0,
            i * barh,
            w,
            barh
        );
        for(var j = 0; j < num; j+=2){
            ctx.fillRect(
                0,
                i * barh + j*barh/num,
                w,
                barh/num
            );
            for(var k = 0; k < num; k+=2){
                ctx.fillRect(
                    0,
                    i * barh+j*barh/num+k*barh/num/num,
                    w,
                    barh/num/num
                );
            }
        }
    }
    
    //columns
    var num_w = num/h*w
    
    for(var i = 0; i < num_w; i+=2){
        ctx.fillRect(
            i * barh,
            0,
            barh,
            h
        );
        
        for(var j = 0; j < num; j+=2){
            ctx.fillRect(
                i * barh + j * barh/num,
                0,
                barh/num,
                h
            );
            for(var k = 0; k < num; k+=2){
                ctx.fillRect(
                    i * barh+j*barh/num+k*barh/num/num,
                    0,
                    barh/num/num,
                    h
                );
            }
        }
    }   
}
