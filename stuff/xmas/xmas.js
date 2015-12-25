
bricks(1,function(w,h){
    tree(w/2,1037,w,1000,100);
    
    var can = document
        .querySelectorAll("canvas[name='tree']")[0];
    var ctx = can.getContext("2d");
    
    setTimeout(function(){
        var snowh = 0;
        var snow_int = setInterval(function(){
            snowh += 2;
            snow(0,1000,w,snowh);
            if(snowh >= 80){
                clearInterval(snow_int);
                village();
            }
        },100);
    },800)
    
    function snow(x,y,w,h){
        ctx.fillStyle = "rgba(255,255,255,1)";
        for(var i = 0; i < w; i++){
            var height = 0.5 * h *
                (Math.cos(0.005 * i + 1.8)+1);
            ctx.fillRect(x+i,y-height,1,height);
        }
    }
});


function bricks(delay,callback){
    var can = document
        .querySelectorAll("canvas[name='bricks']")[0];
    var ctx = can.getContext("2d");
    
    var w = can.width = window.innerWidth;
    var h = can.height = 1000;
    
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0,0,w,h);

    var brickw = 100;
    var brickh = 30;
    var h = 1000;
    
    brick(140,140,140,0,0,0,w,h);
    
    var i = 0;
    var j = 1;
    var brickint = setInterval(function(){
        var offset = (j % 2 == 0 ? brickw / 2: 0) - brickw;
        var mortar = 5;
        var randlum =
            2*Math.sin(5 * i/(w/brickw)) + Math.random() * 2;
        
        brick(
            80 + 30 * randlum,10,10,0.5,
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
            callback(w,h);
        }
    },delay);
    
    function brick(r,g,b,rand,x,y,w,h){
        for(var i = 0; i < w; i++){
            if(i % 6 < 4){
                var ra = rand * 0.9;
                randrgba(ctx,r*ra,g*ra,b*ra,0.8,0);
            } else {
                var ra = rand * 1.1;
                randrgba(ctx,r*ra,g*ra,b*ra,0.8,0);
            }
            ctx.fillRect(x + i, y, 1, h);
        }
    }
}

// Draw tree
function tree(x,y,width,life,delay){
    var can = document
        .querySelectorAll("canvas[name='tree']")[0];
    var ctx = can.getContext("2d");
    
    var w = can.width = window.innerWidth;
    var h = can.height = 1000;

    var trees = [];
    new_tree(0,x,y,0,-8,80,life,1,20,10,10,1);

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
    
    var p1 = 0.3;
    var p2 = 0.1;
    var p3 = 0.2;
    
    function update_trees(trees){
        for(var i = 0; i < trees.length; i++){
            var t = trees[i];
            var life_ratio = 1 - t.dist/t.life;
            
            if(t.dead){
                continue;
            }
            if(t.type < 3){
                t.vx += Math.random() - 0.5;
            }
            
            
            if(t.type == 1){
                t.vy += 0.3 * (Math.random()-0.5);
            }
            if(t.type == 0){
                // trunc
                t.vx *= 0.8;
                if(life_ratio > 0.9){
                    t.size *= 0.99
                }
            } else {
                t.vy += 0.01 * (Math.random()-0.5);
                t.vy *= 0.994;
            }
            
            if(t.type == 1){
                t.vy -= 0.01;
            }
            
            if(t.type == 2){
                t.lum += 0.01;
            }
            
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
               life_ratio < 0.80 &&
               Math.random() < p1){
                for(var j = 0; j < 2; j++){
                    new_tree(
                        1,
                        t.x,
                        t.y,
                        j % 2 == 0 ? (-3): 3,
                        (-0.5),
                        10,
                        width * life_ratio * Math.random(),
                        1,
                        30,
                        20,
                        20,
                        Math.random() * 0.5 + 0.2
                    );
                }
            } if(t.type == 1 && Math.random() < p2){
                for(var j = 0; j < 6; j++){
                    new_tree(
                        2,
                        t.x,
                        t.y,
                        Math.random() < 0.5? (-1): 1,
                        (Math.random()-0.5)*2,
                        4,
                        100 * life_ratio * Math.random(),
                        1,
                        30,
                        20,
                        20,
                        Math.random() * 0.5 + 0.2
                    );
                }
            } else if(t.type == 2 && Math.random() < p3){
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
                ctx,
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

function village(){
    var can = document
        .querySelectorAll("canvas[name='village']")[0];
    var ctx = can.getContext("2d");

    var w = can.width = window.innerWidth;
    var h = can.height = 240;

    var i = 0;
    var j = 10;
    
    var house_interval = setInterval(function(){
        i += Math.random()*60 + 60;
        if(i > w){
            i = 0;
            j += 60;
        }
        if(j > h - 100){
            clearInterval(house_interval);
            return;
        }
        var dist_ratio = Math.abs(w/2 - i) / (w/2);
        if(dist_ratio > 0.4){
            return;
        }
        
        house(i+Math.random()*20,j+Math.random()*10-5);
    },100);

    function house(x,y){
        var bricks_can = document
            .querySelectorAll("canvas[name=bricks]")[0];

        randrgba(ctx,120,30,10,1,0.4);
        var size = 35 + Math.random() * 10;
        ctx.fillRect(x,y,size,size);

        // roof
        var roof_h = 25 + Math.random() * 30;
        for(var i = 0; i < roof_h; i++){
            randrgba(ctx,40+Math.random() * 40,70,20,1,0.6);
            var roof_w = size - i + 5;
            ctx.fillRect(x + i/2 - 2.5,y-i,roof_w,1.5);
        }
    }
}

function randrgba(ctx,r,g,b,a,randfactor){
    ctx.fillStyle = "rgba("+
        Math.floor(( (1 + randfactor * Math.random()) * (r)))+","+
        Math.floor(( (1 + randfactor * Math.random()) * (g)))+","+
        Math.floor(( (1 + randfactor * Math.random()) * (b)))+","+a+")";
}
