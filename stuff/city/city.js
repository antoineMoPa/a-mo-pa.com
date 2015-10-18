var can = document.querySelectorAll("canvas")[0];
var ctx = can.getContext("2d");

can.width = w = window.innerWidth;
can.height = h = window.innerHeight;

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
            ctx.fillStyle = rgba(255,0,0,1);
        } else {
            ctx.fillStyle = rgba(255,255,255,1);
        }
        circle(c.x,c.y,c.radius);
    }
    for(var city in cities){
        var c = cities[city];
        for(var link in c.links){
            draw_link(city,link);
        }
    }
}


function draw_link(c1,link){
    var c1 = cities[c1];
    var c2 = cities[c1.links[link]];
    var p1 = [c1.x,c1.y];
    var p2 = [c2.x,c2.y];
    var center = kp1p2(0.5,p1,p2)
    var x = center[0];
    var y = center[1];
    var r = distance(p1,p2)/2;
    var start_angle = anglep1p2(p1,p2);
    ctx.strokeStyle = rgba(255,255,0,0.6);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x,y,r,start_angle,start_angle + Math.PI);
    ctx.stroke();
}

function circle(x,y,r){
    ctx.beginPath();
    ctx.arc(x,y,r,0,2 * Math.PI);
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

/* take part of one point and part of the other  */
function kp1p2(k,p1,p2){
    var x = k * p1[0] + (1-k) * p2[0];
    var y = k * p1[1] + (1-k) * p2[1];
    return [x,y];
}

function update_game(){
    for(var city in cities){
        var c = cities[city];
        c.pop += Math.random() * 6 + 2;
        c.radius = Math.ceil(c.pop/300);
        if(Math.random() < 0.1){
            c.links.push(Math.floor(Math.random() * cities.length));
        }
    }
}
for(var i = 0; i < 40; i++ ){
    frame();
}
//setInterval(frame,70);

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

function distance(p1,p2){
    return Math.sqrt(
        Math.pow(p2[1] - p1[1],2) +
            Math.pow(p2[0] - p1[0],2)
    );
}

var mousep = [0,0];

can.onmousemove = function(e){
    var x = e.clientX + window.scrollX;
    var y = e.clientY + window.scrollY;
    mousep[0] = x;
    mousep[1] = y;
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
    var x = e.clientX - window.scrollX;
    var y = e.clientY - window.scrollY;
    mousep[0] = x;
    mousep[1] = y;
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
