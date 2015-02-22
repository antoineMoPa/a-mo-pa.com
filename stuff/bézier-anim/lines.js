/*

  Copyright Antoine Morin-Paulhus 2014

  You can use/share/modify/eat
  this file under the terms of
  the GNU GPL V3

  The legal text is there:

  http://www.gnu.org/licenses/gpl-3.0.txt

  And remember that a non-free software
  is a software that sucks!

*/
/*
  Goals:

  - No external libraries
  - No direct copy paste from stackoverflow
    without understanding and rewriting.

*/

var can = document
    .querySelectorAll("canvas[name=tomato]")[0];
var ctx = can.getContext("2d");

w = 500;
h = 500;

var frames = [];
var currentFrame = 0;
var currentObject = 0;

var points = [];
var editing = true;
var dragging = -1;
var add_after = 0;

var ADD_MOVE_POINT = 0;
var DEL_POINT = 1;
var click_mode = ADD_MOVE_POINT;

initEditorUI();
initLoopButton();
initEditor();
initTabs();
initActions();

updateCanvasSize();

function updateCanvasSize(){
    can.width = w;
    can.height = h;
    ctx.fillStyle = "rgba(0,0,0,0.1)"
    ctx.fillRect(0,0,w,h)
    draw();
}

draw();

var inputs = {
    'object_color':'#000000'
};

initInputs(inputs);

var object_inputs = default_object_inputs();

initInputs(object_inputs, updateObjectInputs);

function updateObjectInputs(){
    frames[currentFrame]
        .objects[currentObject]
        .inputs = deep_copy(object_inputs);

    draw();
}

function initInputs(inputs,callback){
    var callback = callback || function(){};
    for(input in inputs){
        var html_input = document
            .querySelectorAll("input[name="+input+"]")[0];
        if(html_input.attributes == undefined){
            continue;
        }
        enableInput(html_input, input);
    }

    function enableInput(html_input, input){
        html_input.value = inputs[input];

        html_input.onkeyup =
            html_input.onchange = function(){
                inputs[input] = this.value;
                callback();
            }
    }
}

function updateObjectOptions(){
    updateObjectInputs();
    updateObjectSwitches();
}

var switches = {
    'new-points-mode': "not-smooth",
};

initSwitches(switches);

object_switches = default_object_switches();

initSwitches(object_switches, updateObjectSwitches);

function updateObjectSwitches(){
    frames[currentFrame]
        .objects[currentObject]
        .switches = deep_copy(object_switches);

    draw();
}

function initSwitches(switches, callback){
    var callback = callback || function(){};

    for(var sw in switches){
        var curr_switch = sw;
        var swit = document
            .querySelectorAll(
                "switch[name="+sw+"]"
            )[0];

        var options = swit.children;
        for(var option in options){
            if(options[option].attributes == undefined){
                continue;
            }
            options[option].classList.remove("active");
            enableSwitch(curr_switch, options, option);
        }
    }
    function enableSwitch(curr_switch, options, option){
        var value = options[option]
            .attributes
            .getNamedItem("data-value")
            .value;

        if(value == switches[curr_switch]){
            options[option].classList.add("active");
        }

        options[option].onclick = function(){
            for(var opt in options){
                if(options[opt].classList == undefined){
                    continue;
                }
                options[opt].classList.remove("active");
                callback();
            }
            options[option].classList.add("active");
            switches[curr_switch] = value;
            draw();
        }
    }
}

function initActions(){
    var actions = [
        ["animation_clear",action_animation_clear],
        ["frame_clear",action_frame_clear],
        ["frame_delete",action_frame_delete],
        ["frame_copy",action_frame_copy],
        ["frame_paste",action_frame_paste],
        ["object_delete",action_object_delete],
    ];

    for(var act = 0; act < actions.length; act++){
        var btn = document
            .querySelectorAll(
                "action[name="+actions[act][0]+"]"
            )[0];
        btn.onclick = actions[act][1];
    }
}

function action_object_delete(){
    var objs = frames[currentFrame].objects;
    objs.splice(currentObject,1);
    currentObject = 0;
    if(objs.length == 0){
        objs.push(default_object());
    }
    updateObjectOptions();
    draw();
}

function action_frame_clear(){
    frames[currentFrame] = emptyFrame();
    currentObject = 0;
    draw();
}

function action_frame_delete(){
    frames.splice(currentFrame,1);
    currentFrame--;
    if(currentFrame < 0){
        currentFrame = 0;
    }
    if(frames.length == 0){
        frames.push(emptyFrame());
    }
    validate_and_write_frame();
}

var current_frame_clipboard = emptyFrame();

function action_animation_clear(){
    frames = [];
    frames.push(emptyFrame());
    currentFrame = 0;
    currentObject = 0;
    validate_and_write_frame();
    draw();
    click_mode = ADD_MOVE_POINT;
}

function action_frame_copy(){
    current_frame_clipboard =
        deep_copy(frames[currentFrame]);
}

function action_frame_paste(){
    frame_copy = deep_copy(
        current_frame_clipboard
    );
    frames.splice(currentFrame, 0, frame_copy);
    currentFrame++;
    validate_and_write_frame();
    draw();
}

function deep_copy(obj){
    var new_obj = {};
    if(obj instanceof Array){
        new_obj = [];
    }
    if(obj == null){
        return null;
    }
    for(el in obj){
        if(typeof(obj[el]) == "object"){
            new_obj[el] = deep_copy(obj[el]);
        } else {
            new_obj[el] = obj[el];
        }
    }
    return new_obj;
}

function initTabs(){
    var alltitles = document.querySelectorAll("tabtitles");
    for(var i = 0; i < alltitles.length; i++){
        var tabtitles = alltitles[i].children;
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
        draw();
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


var curr_frame = document.querySelectorAll(".actions .frame")[0]
var num_frame = document.querySelectorAll(".actions .frames-num")[0]

function validate_and_write_frame(){
    if(currentFrame < 0){
        currentFrame = 0;
    } else if (currentFrame >= frames.length){
        newFrame();
        currentFrame = frames.length - 1;
        copy_last_frame_into_new();
    }
    curr_frame.innerHTML = currentFrame + 1;
    num_frame.innerHTML = frames.length;
    // I like it better if it switches back to that
    click_mode = ADD_MOVE_POINT;
    draw();
}

function copy_last_frame_into_new(){
    frames[frames.length-1] =
        deep_copy(frames[frames.length-2]);
}

function initEditorUI(){
    var next_btn = document.querySelectorAll(".actions .next")[0];
    var prev_btn = document.querySelectorAll(".actions .prev")[0];

    next_btn.onclick = next_frame;
    prev_btn.onclick = prev_frame;

    initKeyboard();
    function initKeyboard(){
        var keys = [
            [39,next_frame], // Right
            [37,prev_frame], // Left
            ['N',new_obj],
            ['B',break_obj],
            ['D',del_point],
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
        if(click_mode == DEL_POINT){
            click_mode = ADD_MOVE_POINT;
        } else {
            click_mode = DEL_POINT;
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

    function new_obj(){
        currentObject++;
        frames[currentFrame]
            .objects.push(default_object());
        draw();
    }
    function break_obj(){
        var pts = frames[currentFrame]
            .objects[currentObject].points;
        
        pts.push("break");
        add_after++;
        
        if(pts.length % 2 == 0){
            pts.push("break");
            add_after++;
        }
    }
}

function default_object(){
    return {
        points:[],
        switches: default_object_switches(),
        inputs: default_object_inputs()
    }
}

function default_object_inputs(){
    return {
        'object_color': '#000000'
    }
}

function default_object_switches(){
    return {
        'object-fill': "no-fill"
    };
}

function newFrame(){
    frames.push(emptyFrame());
}

function emptyFrame(){
    return {
        objects: [default_object()]
    };
}

function update_object_ui(){
    var switches = frames[currentFrame]
        .objects[currentObject].switches;

    initSwitches(switches);
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
            }
            break;
        case ADD_MOVE_POINT:
        default:
            // Verify if a point was clicked
            var selected = clicked_point(x,y);
            if(selected == -1){
                var points = frames[currentFrame]
                    .objects[currentObject].points;

                if(points.length == 0){
                    add_after = 0;
                }

                // add middle point
                if(points.length > 0 &&
                   switches['new-points-mode'] != 'smooth' &&
                   points.length % 2 == 1 &&
                   add_after == points.length
                  ){
                    var last = points[points.length - 1];
                    var dx = x - last[0];
                    var dy = y - last[1];
                    var middle = [last[0] + dx/2, last[1] + dy/2];
                    points.splice(add_after,0,middle);

                    // add point
                    points.splice(add_after+1,0,[x,y]);
                    add_after+=2
                } else {
                    // add point
                    points.splice(add_after,0,[x,y]);
                    /*
                    if(add_after > 1 &&
                       add_after + 1 < points.length){
                        var temp = points[add_after];

                        points[add_after+1] = points[add_after];
                        points[add_after] = temp;
                    }*/

                    add_after++;
                }
            } else {
                // drag
                dragging = selected;
                add_after = selected;
            }
            update_object_ui();
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

        var switches = frame.objects[obj].switches;
        var inputs = frame.objects[obj].inputs;

        ctx.fillStyle = inputs['object_color'];
        ctx.strokeStyle = inputs['object_color'];
        ctx.beginPath();
        if(points.length > 0){
            ctx.moveTo(points[0][0],points[0][1]);
        }

        for(var i = 1; i < points.length - 1; i+=2){
            if(points[i] == "break" || points[i-1] == "break"){
                while(points[i] == "break"){
                    i++;
                }
                if(points[i+1] != undefined){
                    ctx.fillStyle = "#ff0000";
                    ctx.moveTo(points[i+1][0],points[i+1][1]);
                }
            }

            if( i >= points.length - 1){
                continue;
            }

            var p = points[i];
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

            if(switches['object-fill'] == "no-fill"){
                ctx.stroke();
            } else {
                ctx.fill();
            }
        }

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
    }
}
