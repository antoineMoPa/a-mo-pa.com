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
var currentObject = 0;

var points = [];
var editing = true;
var dragging = -1;


var ADD_MOVE_POINT = 0;
var DEL_POINT = 1;
var click_mode = ADD_MOVE_POINT;

initEditorUI();
initLoopButton();
initEditor();
initTabs();
draw();

function initTabs(){
    var alltitles = document.querySelectorAll("tabtitles");
    for(var i = 0; i < alltitles.length; i++){
        var tabtitles = alltitles[i].children;
        console.log(alltitles,tabtitles)
        switchTo(tabtitles[0], 0);
        for(var j = 0; j < tabtitles.length; j++){
            addClickToTab(tabtitles[j], j);
        }

    }
    
    function addClickToTab(i,index){
        i.onclick = function(){
            switchTo(i,index);
        }
    }
    function switchTo(title,index){
        var tabs = title
            .parentNode
            .parentNode
            .getElementsByTagName("tabs")[0].children;

        var tabtitles = title.parentNode.children;

        for(var i = 0; i < tabtitles.length; i++){
            tabtitles[i].classList.remove("active");
            tabs[i].style.display = "none";
        }
        title.classList.add("active");
        tabs[index].style.display = "block";
    }
}

function initLoopButton(){
    var play_btn = document.querySelectorAll(".actions .play")[0];
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
    var next_btn = document.querySelectorAll(".actions .next")[0];
    var prev_btn = document.querySelectorAll(".actions .prev")[0];
    var curr_frame = document.querySelectorAll(".actions .frame")[0]
    var num_frame = document.querySelectorAll(".actions .frames-num")[0]


    next_btn.onclick = next_frame;
    prev_btn.onclick = prev_frame;

    initKeyboard();
    function initKeyboard(){
        var keys = [
            [39,next_frame], // Right
            [37,prev_frame], // Left
            ['D',next_frame],
            ['A',prev_frame],
            ['N',break_obj],
            ['R',del_point]
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

    function del_point(){
        click_mode = DEL_POINT;
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
        currentObject++;
        frames[currentFrame].objects.push({points:[]});
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
        frames[frames.length-1].objects = [];
        for(var obj in frames[frames.length-2].objects){
            console.log(frames[frames.length-2].objects[obj]);
            frames[frames.length-1].objects[obj] = {points:[]};
            frames[frames.length-1].objects[obj].points =
                frames[frames.length-2].objects[obj].points.slice(0);
        }
    }
}

function newFrame(){
    frames.push({
        objects: [{points: []}]
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
        var points = frames[currentFrame].objects[currentObject].points;
        var pos = getPos(e);
        x = pos[0];
        y = pos[1];
        if(dragging != -1){
            points[dragging] = [x,y];
            draw();
        }
    };

    function down(x,y){
        switch(click_mode){
        case DEL_POINT:
            var selected = clicked_point(x,y);

            if(selected != -1){
                points = frames[currentFrame]
                    .objects[currentObject].points;

                points = points.splice(selected,1);
                draw();
                click_mode = ADD_MOVE_POINT;
            }
            break;
        case ADD_MOVE_POINT:
        default:
            // Verify if a point was clicked
            var selected = clicked_point(x,y);
            if(selected == -1){
                // add point + middle point
                var points = frames[currentFrame]
                    .objects[currentObject].points;

                // add middle point
                if(points.length > 2){
                    var last = points[points.length - 1];
                    var dx = x - last[0];
                    var dy = y - last[1];
                    var middle = [last[0] + dx/2, last[1] + dy/2];
                    points.push(middle);
                }
                points.push([x,y]);
            } else {
                // drag
                dragging = selected;
            }
            draw();
            break;
        }
    }

    function clicked_point(x,y){
        var selected = -1;
        var treshold = 6;
        for(var obj in frames[currentFrame].objects){
            var points = frames[currentFrame]
                .objects[obj].points;
            for(var i in points){
                var point = points[i];
                var d = distance(point[0],point[1],x,y);
                if(d < treshold){
                    currentObject = obj;
                    selected = i;
                    break;
                }
            }
            if(selected != -1){
                break;
            }
        }
        return selected;
    }

    function up(x,y){
        var points = frames[currentFrame].objects[currentObject].points;
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

    for(var obj = 0; obj < frame.objects.length; obj++){
        var points = frame.objects[obj].points;
        if(editing){
            for(var i = 0; i < points.length; i++){
                var size = 3;
                if( obj == currentObject &&
                    dragging != -1 &&
                    dragging == i ){
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
}
