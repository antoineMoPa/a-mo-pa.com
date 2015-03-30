var can = document
    .querySelectorAll("canvas[name=potato]")[0];
ctx = can.getContext("2d");

w = can.width = window.innerWidth;
h = can.height = window.innerHeight;

points = [];
links = [];

can.onmousedown = down;

function down(e){
    var x = e.clientX;
    var y = e.clientY;

    points.push([x,y,0,0]);

    if(points.length > 1){
        links.push([points.length-1,points.length - 2]);
    }
    
    draw();
}

setInterval(update,33);

function update(){
    /* set speed  */
    
    manage_point_gravity();
    manage_floor_colisions();
    manage_link_attraction();

    move_stuff_according_to_acc();
    
    draw();
}

function manage_point_gravity(){
    for(var point in points){
        var p = points[point];
        p[3] += 1;
    }
}

function move_stuff_according_to_acc(){
    /* move */
    for(var point in points){
        var p = points[point];
        p[0] += p[2];
        p[1] += p[3];
    }
}

function manage_floor_colisions(){
    for(var point in points){
        var p = points[point];
        
        if(p[1] >= h){
            p[3] *= -1;
            /*
              h                p[1]
              ----------------|----|

              h - (p[1] - h)
              -----------|
              
              h - (p[1] - h) = h - p[1] + h = 2h - p[1]
             */
            p[1] = 2*h - p[1];
        }
    }
}

function manage_link_attraction(){
    for(var link in links){
        var l = links[link];
        var p1 = points[l[0]];
        var p2 = points[l[1]];
        var d = p_distance(p1,p2);
        var dx = p_dx(p1,p2);
        var dy = p_dy(p1,p2);

        var factor = 42 * Math.pow(d,-2);
        
        // inverse square those values
        
        // depending on dx, accelerate points
        // towards the other on the x axis
        p1[2] += factor * dx;
        p2[2] -= factor * dx;

        // Same reasoning for dy
        p1[3] += factor * dy;
        p2[3] -= factor * dy;
        
    }
}



function p_dx(p1,p2){
    return p2[0] - p1[0];
}

function p_dy(p1,p2){
    return p2[1] - p1[1];
}

function p_distance(p1,p2){
    var x1 = p1[0];
    var y1 = p1[1];
    var x2 = p2[0];
    var y2 = p2[1];
    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}

ctx.fillStyle = "rgba(255,255,255,1)";
ctx.fillRect(0,0,w,h);


function draw(){
    //ctx.clearRect(0,0,w,h);
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0,0,w,h);
    draw_editing_stuff();
}

function draw_editing_stuff(){
    ctx.fillStyle = "#000";

    ctx.beginPath();
    for(var link in links){
        var l = links[link];
        var p1 = points[l[0]];
        var p2 = points[l[1]];
        ctx.moveTo(p1[0],p1[1]);
        ctx.lineTo(p2[0],p2[1]);
    }
    ctx.closePath();
    ctx.stroke();
    for(var point in points){
        var p = points[point];
        ctx.fillRect(p[0]-2,p[1]-2,4,4);
    }
}
