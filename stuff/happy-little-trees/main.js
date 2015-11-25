var can = document.getElementsByTagName("canvas")[0];
var ctx = can.getContext("2d");
var w = document.body.clientWidth;
var h = window.innerHeight;

can.width = w;
can.height = h;


// Sky
for(var i = 0; i < h; i++){
    var g = i / h;
    ctx.fillStyle = rgba(g+0.2,g/2,g/8,1);
    ctx.fillRect(0,i,w,1);
}

// Mountains
var seeds = [];
var lasty = h/3 + (Math.random()-1) * 80;
for(var i = 0; i < 10; i++){
    var y = lasty - Math.random() * 10;
    lasty = y;
    var x = Math.pow(Math.random() * w,(Math.random()+0.5));
    
    seeds.push({
        x: x,
        y: y,
        tint: Math.random() * 0.1,
        size:1,
        xspeed:0,
        end: h - y,
        step:0
    });

    seeds.push({
        x: x + (Math.random()-0.5) * 4,
        y: y,
        tint: Math.random() * 0.1,
        size:1,
        xspeed:0,
        end: h - y,
        step:0
    });

}

setInterval(function(){
    mountain(seeds);
},20);

function mountain(seeds){
    for(seed in seeds){
        var s = seeds[seed];

        if(s.step < s.end){
            var xgrowth = (Math.random() * 10);
            s.xspeed += (Math.random() - 0.5) * 2;
            s.xspeed *= 0.8;
            s.size += xgrowth;
            s.x -= xgrowth / 2;
            s.x += s.xspeed;
            s.y += 1;
            var g = s.step / s.end;
            ctx.fillStyle = rgba(
                0.7-g/2 + s.tint,
                0.7-g/2 + s.tint,
                0.7-g/3.3 + s.tint,
                1
            );
            ctx.fillRect(s.x,s.y,s.size,1);
            s.step++;
        }
    }
}

function rgba(r,g,b,a){
    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    return "rgba("+r+","+g+","+b+","+a+")";
}
