var can = document.querySelectorAll("canvas")[0];
var ctx = can.getContext("2d");

var w = can.width = window.innerWidth;
var h = can.height = 800;

ctx.fillStyle = "rgba(255,255,255,1)";
ctx.fillRect(0,0,w,h);

// Draw tree

var trees = [];

function new_tree(type,x,y,vx,vy,size,life,count,cx,cy){
    var count = count || 1;
    var cx = cx || Math.random() * 4 - 2;
    var cy = cy || Math.random() * 4 - 2;
    
    for(var i = 0; i < count; i++){
        trees.push({
            type: type,
            x: x + i * cx,
            y: y + i * cy,
            vx: vx,
            vy: vy,
            dead: false,
            size: size,
            dist: 0,
            life: life
        });
    }
}

new_tree(0,w/2,h,0,-6,30,h * 0.8);

function update_trees(trees){
    for(var i = 0; i < trees.length; i++){
        var t = trees[i];
        if(t.dead){
            continue;
        }
        if(t.type == 0){
            t.vx += Math.random() - 0.5;
        }
        t.vy += 0.01 * (Math.random()-0.5);
        if(t.type == 1){
            t.vy += 0.3 * (Math.random()-0.5);
        }
        if(t.type == 0){
            t.vx *= 0.8;
        }
        
        t.vy *= 0.994;
        if(t.type < 2){
            t.real_size = (1 - t.dist / t.life) * t.size;
        } else {
            t.real_size = t.size;
        }
        t.x += t.vx;
        t.y += t.vy;

        t.dist += Math.sqrt(t.vx * t.vx + t.vy*t.vy);
        
        if(t.dist > t.life){
            t.dead = true;
        }
        
        var liferatio = 1 - t.dist/t.life;
        for(var j = 0; j < 3; j++){
            if(t.type == 0 && liferatio < 0.9){
                new_tree(
                    1,
                    t.x,
                    t.y,
                    Math.random() < 0.5? (-3): 3,
                    (-0.5),
                    5,
                    300 * liferatio * Math.random()
                );
            }
            if(t.type == 1 && Math.random() < 0.5){
                new_tree(
                    2,
                    t.x,
                    t.y,
                    Math.random() < 0.5? (-1): 1,
                    Math.random() < 0.5? (-1): 1,
                    1,
                    10,
                    6
                );
            }
        }
    }
}

function draw_trees(trees){
    for(var i = 0; i < trees.length; i++){
        var t = trees[i];
        
        if(t.dead){
            continue;
        }
        
        if(t.type < 2){
            randrgba(70,50,20,1,0.3);
        } else {
            randrgba(50,70,40,0.9,0.3);
        }
        
        ctx.fillRect(
            t.x-t.real_size/2,
            t.y-t.real_size/2,
            t.real_size,
            t.real_size
        );
    }
}


function randrgba(r,g,b,a,randfactor){
    ctx.fillStyle = "rgba("+
        Math.floor(( (1 + randfactor * Math.random()) * (r)))+","+
        Math.floor(( (1 + randfactor * Math.random()) * (g)))+","+
        Math.floor(( (1 + randfactor * Math.random()) * (b)))+","+a+")";
}

setInterval(update,80)

function update(){
    update_trees(trees);
    draw_trees(trees)
}
