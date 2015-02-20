var can = document.querySelectorAll("canvas[name=tomato]")[0];
var ctx = can.getContext("2d");

w = 500;
h = 500;

can.width = w;
can.height = h;

ctx.fillStyle = "rgba(0,0,0,0.1)"
ctx.fillRect(0,0,w,h)

var frames = [];
var currentFrame = 0;

var points = [];
var editing = true;
var dragging = -1;

initEditorUI();
initLoopButton();
initEditor();
draw();

function initLoopButton(){
    var play_btn = document.querySelectorAll(".actions .play.btn")[0];
    play_btn.onclick = function(){
        currentFrame = 0;
        for(var i = 0; i < frames.length-1; i++){
            setTimeout(function(){
                currentFrame++;
                editing = false;
                draw();
                editing = true;
            },i*130);
        }
    }
}


function initEditorUI(){
    var next_btn = document.querySelectorAll(".actions .next.btn")[0];
    var prev_btn = document.querySelectorAll(".actions .prev.btn")[0];
    var curr_frame = document.querySelectorAll(".actions .frame")[0]
    var num_frame = document.querySelectorAll(".actions .frames-num")[0]
    

    next_btn.onclick = next_frame;
    prev_btn.onclick = prev_frame;

    initKeyboard();
    function initKeyboard(){
        var keys = [
            [39,next_frame], // Right
            [37,prev_frame], // Left
            ['N',break_obj]
        ];
        
        document.onkeydown = function(e){        
            for(key in keys){
                /* direct numbers  */
                if(e.keyCode == keys[key][0]){
                    keys[key][1]();
                } else if (String.fromCharCode(e.keyCode) == keys[key][0]){
                    keys[key][1]();
                }
            }
        }    
    }

    function next_frame(){
        currentFrame++;
        validate_and_write_frame();
    };    
    function prev_frame(){
        currentFrame--;
        validate_and_write_frame();
    };
    
    function break_obj(){
        if(frames[currentFrame].points < 2){
            return;
        } if(frames[currentFrame].points.length % 2 == 0){
            return;
        }
        frames[currentFrame].points.push("break");
        draw();
    }
    
    function validate_and_write_frame(){
        if(currentFrame < 0){
            currentFrame = 0;
        } else if (currentFrame >= frames.length){
            newFrame();
            currentFrame = frames.length - 1;
            copy_last_into_new();
        }
        curr_frame.innerHTML = currentFrame + 1;
        num_frame.innerHTML = frames.length;
        draw();
    }
    function copy_last_into_new(){
        frames[frames.length-1].points =
            frames[frames.length-2].points.slice(0);
    }
}

function newFrame(){
    frames.push({
        points:[]
    });
}


function initEditor(){
    newFrame();

    function getPos(e){
        x = e.clientX - can.offsetLeft + window.scrollX;
        y = e.clientY - can.offsetTop + window.scrollY;
        return [x,y];
    }

    can.onmousedown = function(e){
        var pos = getPos(e);
        down(pos[0],pos[1]);
    };

    can.onmouseup = function(e){
        var pos = getPos(e);
        up(pos[0],pos[1]);
    };

    can.onmousemove = function(e){
        var points = frames[currentFrame].points;
        var pos = getPos(e);
        x = pos[0];
        y = pos[1];
        if(dragging != -1){
            points[dragging] = [x,y];
            draw();
        }
    };

    function down(x,y){
        var points = frames[currentFrame].points;
        // Verify if a point was clicked
        var selected = -1;
        var treshold = 6;
        for(var i in points){
            var point = points[i];
            var d = distance(point[0],point[1],x,y);
            if(d < treshold){
                selected = i;
                break;
            }
        }
        if(selected == -1){
            points.push([x,y]);
        } else {
            dragging = selected;
        }
        draw();
    }

    function up(x,y){
        var points = frames[currentFrame].points;
        if(dragging != -1){
            points[dragging] = [x,y];
            dragging = -1;
            draw();
        }
     }
}

function distance(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(y2 - y1,2) + Math.pow(x2 - x1,2));
}

function draw(){
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,w,h);

    var frame = frames[currentFrame];
    var points = frame.points;

    if(editing){    
        for(var i = 0; i < points.length; i++){
            var size = 3;
            if(dragging != -1 && dragging == i){
                ctx.fillStyle = "rgba(255,0,0,0.9)";
            } else {
                ctx.fillStyle = "rgba(0,0,0,0.9)";
            }
            ctx.fillRect(points[i][0]-size, points[i][1]-size, 2*size,2*size);
        }
    }
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.beginPath();
    if(points.length > 0){
        ctx.moveTo(points[0][0],points[0][1]);
    }
    var breaking = false;
    
    for(var i = 1; i < points.length - 1; i+=2){
        // point
        var p = points[i];
        
        if(p == "break"){
            breaking = true;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(points[i+1][0],points[i+1][1]);
            continue;
        }
        
        // lastpoint
        var lp = points[i-1];
        var np = points[i+1];
        // calculate resolution
        var res = distance(p[0],p[1],lp[0],lp[1]) + distance(p[0],p[1],np[0],np[1]);
        res/=20
        
        for(var j = 0; j < res; j++){
            var k = j/res;
            var m = (1-k) * lp[0] + (k) * p[0];
            var n = (1-k) * lp[1] + (k) * p[1];
            var q = (1-k) * p[0] + (k) * np[0];
            var r = (1-k) * p[1] + (k) * np[1];
            var s = (1-k) * m + (k) * q;
            var t = (1-k) * n + (k) * r;
            ctx.lineTo(s,t);
        }
    }
    if(points.length > 1){
        var len = points.length
        var lastIndex = len % 2 == 1? len: len - 1
        var last = points[points.length-1];
        ctx.lineTo(last[0],last[1]);        
    }
    ctx.stroke();
}
