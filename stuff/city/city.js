var can = document.querySelectorAll("canvas")[0];
var ctx = can.getContext("2d");

can.width = w = window.innerWidth;
can.height = h = window.innerHeight;

// Put (x,y) = (0,0) is at bottom left like
// a normal cartesian space
ctx.translate(0,h);
ctx.scale(1,-1);

cities = [];

for(var i = 0; i < 20;i++){
    cities.push(new_city());
}

function rgba(r,g,b,a){
    return "rgba("+r+","+g+","+b+","+a+")";
}

function new_city(){
    var x = Math.random() * w;
    var y = Math.random() * h;
    var pop = Math.random() * 3000;
    
    return {
        x: x,
        y: y,
        pop: pop,
        radius: 0,
        links: []
    };
}

function draw_cities(cities){
    for(var city in cities){
        var c = cities[city];
        if(city == selected_city){
            ctx.fillStyle = rgba(180,55,5,0.8);
        } else {
            ctx.fillStyle = rgba(255,255,255,0.8);
        }
        circle([c.x,c.y],c.radius);
    }
    for(var city in cities){
        var c = cities[city];
        for(var link in c.links){
            draw_link_curve(city,link);
        }
    }
}

function draw_link_curve(c1,link){
    var c1 = cities[c1];
    var c2 = cities[c1.links[link]];
    var p1 = [c1.x,c1.y];
    var p2 = [c2.x,c2.y];
    var center = kv1v2(0.5,p1,p2)
    // Half of the vector from p1 to p2
    var v1_2 = substractvect(center,p1);
    var dist = distance(p1,p2);
    var vp = unitv(perpendicular(v1_2),link*30+100);
    
    ctx.fillStyle = rgba(0,100,155,1);
    var circles = dist/5;
    for(var i = 0; i < circles; i++){
        circle(addvect(p1,curve(i/circles,addvect(v1_2,vp),substractvect(v1_2,vp))),2);
    }
}

/* Curve function between 2 vectors */
function curve(t,v1,v2){
    return kv(t,addvect(kv(1-t,v1),kv(t,addvect(v2,v1))));
}

function drawvect(vect,pos){
    var px = pos[0];
    var py = pos[1];
    var vx = vect[0];
    var vy = vect[1];
    ctx.beginPath();
    ctx.moveTo(px,py);
    ctx.lineTo(vx+px,vy+py);
    ctx.stroke();
    ctx.closePath();
}

function circle(pos,r){
    ctx.beginPath();
    ctx.arc(pos[0],pos[1],r,0,2 * Math.PI);
    ctx.fill();
}

function anglep1p2(p1,p2){
    var dx = p2[0] - p1[0];
    var dy = p2[1] - p1[1];
    var theta = Math.atan(dy/dx);
    if(dx > 0 && dy > 0){
        // x+ y+
        return theta;
    } else if (dx > 0 && dy < 0){
        // x+ y-
        return 2 * Math.PI + theta;
    } else if (dx < 0 && dy < 0){
        // x- y-
        return Math.PI + theta;
    } else {
        // x- y+
        return Math.PI + theta;
    }
    
}

/* takes vector and returns a unit vectors times k (or 1) in the same direction */
function unitv(v,k){
    var k = k || 1;
    var l = vlength(v);
    var factor = 1 / l * k;
    var x = v[0] * factor;
    var y = v[1] * factor;
    return [x,y];
}

function negatevect(v1){
    return [-v1[0],-v1[1]];
}

function substractvect(v1,v2){
    return [v1[0] - v2[0],v1[1]-v2[1]];
}

function addvect(v1,v2){
    return [v1[0] + v2[0],v1[1]+v2[1]];
}

function perpendicular(vect){
    var a1 = vect[0];
    var a2 = vect[1];
    return [-a2,a1];
}

/* take part (k) of one point and part of the other  */
function kv1v2(k,v1,v2){
    var x = k * v1[0] + (1-k) * v2[0];
    var y = k * v1[1] + (1-k) * v2[1];
    return [x,y];
}

/* Multiplies vector by a constant */
function kv(k,v1){
    var x = k * v1[0];
    var y = k * v1[1];
    return [x,y];
}

function update_game(){
    for(var city in cities){
        var c = cities[city];
        c.pop += Math.random() * Math.log(c.pop) * 0.1;
        if(city == 3)
            console.log(c.pop);
        c.radius = Math.floor(Math.log(c.pop)/Math.log(100)*3)+1;
    }
}
//for(var i = 0; i < 40; i++ ){
//    frame();
//}
setInterval(frame,70);

function frame(){
    update_game();
    
    ctx.fillStyle = rgba(0,0,0,1);
    ctx.fillRect(0,0,w,h);
    draw_cities(cities);
    
}

function detect_click(mousep){
    for(var city in cities){
        var c = cities[city];
        var d = distance(mousep,[c.x,c.y]);
        if(d < 10 || d < c.radius){
            return city;
        }
    }
    return -1;
}

/* Find vector length */
function vlength(v){
    return Math.sqrt(
        Math.pow(v[1],2) +
            Math.pow(v[0],2)
    );
}

function distance(p1,p2){
    return Math.sqrt(
        Math.pow(p2[1] - p1[1],2) +
            Math.pow(p2[0] - p1[0],2)
    );
}

var mousep = [0,0];

can.onmousemove = mousemove;

function mousemove(e){
    var x = e.clientX + window.scrollX;
    var y = e.clientY + window.scrollY;
    mousep[0] = x;
    mousep[1] = h - y;
}

window.onkeydown = function(e){
    if(String.fromCharCode(e.keyCode) == "W"){
        new_city_at_mouse();
    }
}

function new_city_at_mouse(){
    var city = detect_click(mousep);
    if(city == -1){
        var c = new_city();
        c.x = mousep[0];
        c.y = mousep[1];
        c.pop = -1;
        cities.push(c);
    }
}

var selected_city = -1;

can.onclick = function(e){
    mousemove(e);
    var city = detect_click(mousep);
    if(city == -1){
        new_city_at_mouse();
    } else if(selected_city == -1){
        selected_city = city;
    } else {
        var c1 = selected_city;
        var c2 = city;
        
        cities[c1].links.push(c2);
        
        selected_city = -1;
    }
}
