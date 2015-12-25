var can = document.querySelectorAll("canvas")[0];
var ctx = can.getContext("2d");

var w = can.width = window.innerWidth;
var h = can.height = 800;

ctx.fillStyle = "rgba(255,255,255,1)";
ctx.fillRect(0,0,w,h);

bricks(1,function(){
    tree(w/2,h+50,0.8*h,100);
});

function bricks(delay,callback){
    var brickw = 100;
    var brickh = 30;
    
    brick(140,140,140,0,0,0,w,h);
    
    var i = 0;
    var j = 0;
    var brickint = setInterval(function(){
        var offset = (j % 2 == 0 ? brickw / 2: 0) - brickw;
        var mortar = 5;
        var randlum =
            Math.cos(5 * i/(w/brickw));
        
        brick(
            130 + 30 * randlum,20 + 20 * randlum,30,0.2,
            i * (brickw + mortar) + offset,
            h - (j * (brickh + mortar)),
            brickw,
            brickh
        );
        
        i++;
        if(i >= w / brickw + 2){
            i=0;
            j++;
        }
        if(j >= h / brickh + 2){
            j = 0;
            clearInterval(brickint);
            callback();
        }
    },delay);

}

function brick(r,g,b,rand,x,y,w,h){
    var stripes = 10;
    for(var i = 0; i < stripes; i++){
        randrgba(r,g,b,0.8,rand);
        ctx.fillRect(x + i*w/stripes - 1, y, w/stripes + 1, h);
    }
}


// Draw tree
function tree(x,y,life,delay){
    var trees = [];
    
    function new_tree(type,x,y,vx,vy,size,life,count,r,g,b,lum){
        if(type > 1){
            var size = size * (0.5 * Math.random() + 0.5);
        }
        
        var cx = Math.random() * 4 - 2;
        var cy = Math.random() * 4 - 2;
        
        for(var i = 0; i < count; i++){
            trees.push({
                type: type,
                x: x + i * cx,
                y: y + i * cy,
                lum: lum,
                vx: vx,
                vy: vy,
                r: r,
                g: g,
                b: b,
                dead: false,
                size: size,
                dist: 0,
                life: life
            });
        }
    }
    
    new_tree(0,x,y,0,-4,80,life,1,50,40,30,1);
    
    function update_trees(trees){
        for(var i = 0; i < trees.length; i++){
            var t = trees[i];
            var liferatio = 1 - t.dist/t.life;
            
            if(t.dead){
                continue;
            }
            if(t.type < 3){
                t.vx += Math.random() - 0.5;
            }
            t.vy += 0.01 * (Math.random()-0.5);
            
            if(t.type == 1){
                t.vy += 0.3 * (Math.random()-0.5);
            }
            if(t.type == 0){
                t.vx *= 0.8;
                t.vy -= 0.001;
                if(liferatio > 0.9){
                    t.size *= 0.99
                }
            }
            
            if(t.type == 1){
                t.vy -= 0.01;
            }
            
            if(t.type == 2){
                t.lum += 0.01;
            }
            
            t.vy *= 0.994;
            if(t.type < 3){
                t.real_size = (1 - t.dist / t.life) * t.size;
            } else {
                t.real_size = t.size;
            }
            t.x += t.vx;
            t.y += t.vy;
            
            t.dist += Math.sqrt(t.vx * t.vx + t.vy*t.vy);
            
            if(t.dist > t.life){
                t.dead = true;
            }
            
            if(t.type == 0 &&
               liferatio < 0.80 &&
               Math.random() < 0.1){
                for(var j = 0; j < 3; j++){
                    new_tree(
                        1,
                        t.x,
                        t.y,
                        Math.random() < 0.5? (-3): 3,
                        (-0.5),
                        5,
                        400 * liferatio * Math.random(),
                        1,
                        30,
                        20,
                        20,
                        Math.random() * 0.5 + 0.2
                    );
                }
            } if(t.type == 1 && Math.random() < 0.2){
                for(var j = 0; j < 6; j++){
                    new_tree(
                        2,
                        t.x,
                        t.y,
                        Math.random() < 0.5? (-1): 1,
                        (Math.random()-0.5)*2,
                        4,
                        100 * liferatio * Math.random(),
                        1,
                        30,
                        20,
                        20,
                        Math.random() * 0.5 + 0.2
                    );
                }
            } else if(t.type == 2 && Math.random() < 0.2){
                var r = 50 + Math.random() * 20;
                var g = 70 + Math.random() * 20;
                var b = 40 + Math.random() * 20;
                
                for(var j = 0; j < 3; j++){
                    new_tree(
                        3,
                        t.x,
                        t.y,
                        Math.random() < 0.5? (-2): 2,
                        Math.random() < 0.5? (-2): 2,
                        2,
                        10,
                        6,
                        r,
                        g,
                        b,
                        t.lum
                    );
                }
            }
        }
    }
    
    function draw_trees(trees){
        // Uncomment for fireworks
        //ctx.fillStyle = "rgba(255,255,255,0.1)";
        //ctx.fillRect(0,0,w,h);
        for(var i = 0; i < trees.length; i++){
            var t = trees[i];
            
            if(t.dead){
                continue;
            }
            
            randrgba(
                t.lum * t.r,
                t.lum * t.g,
                t.lum * t.b,
                0.9,
                0.3
            );
            
            ctx.fillRect(
                t.x-t.real_size/2,
                t.y-t.real_size/2,
                t.real_size,
                t.real_size < 10 ? t.real_size: 10
            );
        }
    }
        
    setInterval(update,100)
    
    function update(){
        update_trees(trees);
        draw_trees(trees)
    }
}

function randrgba(r,g,b,a,randfactor){
    ctx.fillStyle = "rgba("+
        Math.floor(( (1 + randfactor * Math.random()) * (r)))+","+
        Math.floor(( (1 + randfactor * Math.random()) * (g)))+","+
        Math.floor(( (1 + randfactor * Math.random()) * (b)))+","+a+")";
}
