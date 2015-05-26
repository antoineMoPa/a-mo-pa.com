var can = document
    .querySelectorAll("canvas[name='potato']")[0];
var ctx = can.getContext('2d');

var w = can.width = window.innerWidth;
var h = can.height = window.innerHeight;

var cities = [];
var cars = [];
var traffic = [];

for(var i = 0; i < 6; i++){
    cities.push([Math.random()*w,Math.random()*h]);
}

var roads = [];

can.onclick = function(e){
    var pos = getPos(e);
    var close = closestCity(pos,35);
    if(close != -1){
        pos = cities[close].slice(0);
    }
    roads.push(pos);
    traffic.push([]);
    update();
}

function closestCity(pos,tresh){
    var tresh = tresh || 10;
    var smallest = -1;
    for(var i = 0; i < cities.length; i++){
        if(dist(cities[i],pos) < tresh && (smallest == -1 || dist(cities[i],pos) < dist(cities[smallest],pos))){
            smallest = i;
        }
    }
    return smallest;
}

function getPos(e){
    return [
        e.clientX-can.offsetLeft + window.scrollX,
        e.clientY-can.offsetTop + window.scrollY
    ];
}

setInterval(update,100);

update();


function update(){
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "#3af";
    if(roads.length > 0){
        var r = Math.floor(Math.random()*roads.length);
        traffic[r] = traffic[r].concat(0.01);
    }
    for(var i = 0; i < cities.length;i++){
        var c = cities[i];
        ctx.fillRect(c[0]-5,c[1]-5,10,10);
    }
    for(var i = 1; i < roads.length;i++){
        ctx.strokeStyle = "#3fa";
        var p1 = roads[i-1];
        var p2 = roads[i];
        line(p1,p2);
        var t = traffic[i];
        for(var j = 1; j < t.length; j++){
            draw_car(p1,p2,t[j]);
            t[j]+=0.01;
            if(t[j] >= 1){
                traffic[i][j] = undefined;
            }
        }
    }
}

function draw_car(p1,p2,pos){
    var x = (1-pos) * p1[0] + pos * p2[0];
    var y = (1-pos) * p1[1] + pos * p2[1];
    ctx.fillStyle = "#fa3";
    ctx.fillRect(x-2,y-2,4,4);
}

setInterval(create_traffic,3000);

function create_traffic(){
    for(var i = 0; i < cities.length;i++){
        for(var j = 1; j < roads.length;j+=2){
            var deltas = dx_dy(roads[j],cities[i]);
            if(Math.abs(deltas[0]) < 25 || Math.abs(deltas[1]) < 25){
                traffic[j-1].push(0);
            }
        }
    }
}

function dx_dy(p1,p2){
    var dx = p1[0] - p2[0];
    var dy = p1[1] - p2[1];
    return [dx,dy];
}

function dist(p1,p2){
    var deltas = dx_dy(p1,p2);
    return Math.sqrt(
        Math.pow(deltas[0],2)+
            Math.pow(deltas[1],2)
    );
}

function line(from,to){
    ctx.beginPath();
    ctx.moveTo(from[0],from[1]);
    ctx.lineTo(to[0],to[1]);
    ctx.stroke();
    ctx.closePath();
}
