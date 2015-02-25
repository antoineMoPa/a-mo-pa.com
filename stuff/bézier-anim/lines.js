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

  - No external libraries for UI
    or things that are easy to code.    
  - No direct copy paste from stackoverflow
    without understanding and rewriting.
  - Limit the width of code lines so they fit in 
    half a emacs window on my thinkpad laptop
*/

var can = QSA("canvas[name=tomato]")[0];
var ctx = can.getContext("2d");

w = 500;
h = 500;

var frames = [];
var currentFrame = 0;
var currentObject = 0;

var editing = true;
var dragging = -1;
var add_after = 0;

var ADD_POINTS = 0;
var DEL_POINTS = 1;
var MOVE_POINTS = 2;
var MOVE_OBJECTS = 3;
var click_mode = ADD_POINTS;
var POINT_POINT = 0;
var POINT_GUIDE = 1;
var POINT_NOT_SMOOTH = 2;

var selected_point = 0;

initEditor();
initTabs();
initActions();

var inputs = {
    'animation_width':'500',
    'animation_height':'500'
};

initInputs(inputs, updateInputs);

function QSA(selector){
    // shit is so long to write
    return document.querySelectorAll(selector);
}

function updateInputs(){
    updateCanvasSize();
}

function updateCanvasSize(){
    w = inputs['animation_width'];
    h = inputs['animation_height'];
    can.width = w;
    can.height = h;
    draw();
}

updateCanvasSize();
draw();

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
        var html_input = QSA("input[name="+input+"]")[0];
        if(html_input.attributes == undefined){
            continue;
        }
        enableInput(html_input, input);
    }

    function enableInput(html_input, input){
        html_input.value = inputs[input];

        /* don't change frame on arrow down! */
        html_input.onkeydown = function(e){
            e.stopPropagation();
        }

        html_input.onkeyup =
            html_input.onchange = function(){
                inputs[input] = this.value;
                callback();
                draw();
            }
    }
}

function updateObjectOptions(){
    updateObjectInputs();
    updateObjectSwitches();
}

var switches = {
    'global-mode': 'add-points',
    'new-points-mode': "not-smooth",
};

initSwitches(switches,updateSwitches);

function updateSwitches(){
    switch(switches['global-mode']){
    case 'add-points':
        click_mode = ADD_POINTS;
        break;
    case 'move-points':
        click_mode = MOVE_POINTS;
        break;
    case 'delete-points':
        click_mode = DEL_POINTS;
        break;
    case 'move-objects':
        click_mode = MOVE_OBJECTS;
        break
    }
}

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
        var swit = QSA(
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
            }
            options[option].classList.add("active");
            switches[curr_switch] = value;
            callback();
            draw();
        }
    }
}

function initActions(){
    var actions = [
        ["animation_play","",action_animation_play],
        ["animation_clear","",action_animation_clear],
        ["animation_save","",action_animation_save],
        ["animation_restore","",action_animation_restore],
        ["frame_clear","",action_frame_clear],
        ["frame_delete","",action_frame_delete],
        ["frame_copy","",action_frame_copy],
        ["frame_paste","",action_frame_paste],
        ["object_delete","",action_object_delete],
        ["object_bring_up","",action_object_bring_up],
        ["object_bring_down","",action_object_bring_down],
        ["object_break_path","B",action_break_path],
        ["object_new","N",new_obj],
        ["object_copy","",action_object_copy],
        ["object_paste","",action_object_paste],
        ["","D",action_toggle_point_mode],
        ["path_invert_direction","",path_invert_direction],
        ["frame_next",39,action_next_frame], // Right
        ["frame_prev",37,action_prev_frame], // Left
    ];

    for(var act = 0; act < actions.length; act++){
        if(actions[act][0] != ""){
            var btn = QSA(
                "action[name="+actions[act][0]+"]"
            )[0];
            btn.onclick = actions[act][2];
        }
    }

    initKeyboard();
    function initKeyboard(){
        document.onkeydown = function(e){
            for(key in actions){
                str = String.fromCharCode(e.keyCode);
                /* direct numbers  */
                if(e.keyCode == actions[key][1]){
                    actions[key][2]();
                } else if (str == actions[key][1]){
                    actions[key][2]();
                }
            }
        }
    }

}


function action_animation_save(){
    window.localStorage.saved_animation =
        JSON.stringify(deep_copy(frames));
}

function action_animation_restore(){
    frames =
        JSON.parse(window.localStorage.saved_animation);
    currentFrame = 0;
    currentObject = 0;
    add_after = 0;
    draw();
    validate_and_write_frame();
}

var object_clipboard = default_object();

function action_object_copy(){
    object_clipboard = deep_copy(
        frames[currentFrame].objects[currentObject]
    );
}

function action_object_paste(){
    var new_object = deep_copy(object_clipboard);
    move_points(new_object.points,14,14);
    frames[currentFrame]
        .objects
        .push(new_object);

    draw();
}

function action_object_bring_up(){
    if(swap_objects(
        currentObject,currentObject+1)
      ){
        currentObject++;
    }
}

function action_object_bring_down(){
    if(swap_objects(
        currentObject,parseInt(currentObject)-1)
      ){
        currentObject--;
    }
}

function swap_objects(lhs, rhs){
    var objects = frames[currentFrame]
        .objects;
    var temp = deep_copy(objects[lhs]);

    if(lhs >= objects.length || lhs < 0 ||
       rhs >= objects.length || rhs < 0
      ){
        return false;
    }
    objects[lhs] = deep_copy(objects[rhs]);
    objects[rhs] = temp;
    draw();
    return true;
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

function action_next_frame(){
    currentFrame++;
    validate_and_write_frame();
};
function action_prev_frame(){
    currentFrame--;
    validate_and_write_frame();
};


var current_frame_clipboard = emptyFrame();

function action_animation_clear(){
    frames = [];
    frames.push(emptyFrame());
    currentFrame = 0;
    currentObject = 0;
    validate_and_write_frame();
    draw();
    click_mode = ADD_POINTS;
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

function action_toggle_point_mode(){
    if(click_mode == DEL_POINTS){
        click_mode = ADD_POINTS;
        switches['global-mode'] = 'add-points';
    } else {
        click_mode = DEL_POINTS;
        switches['global-mode'] = 'delete-points';
    }
    initSwitches(switches,updateSwitches);
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
    var alltitles = QSA("tabtitles");
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

function action_animation_play(){
    currentFrame = 0;
    editing = false;
    draw();
    for(var i = 0; i < frames.length-1; i++){
        setTimeout(function(){
            currentFrame++;
            editing = false;
            draw();
            editing = true;
            validate_and_write_frame();
        },(i+1)*130);
    }
}

var curr_frame = QSA(".actions .frame")[0]
var num_frame = QSA(".actions .frames-num")[0]

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
    if(click_mode == DEL_POINTS){
        click_mode = ADD_POINTS;
    }
    draw();
}

function copy_last_frame_into_new(){
    frames[frames.length-1] =
        deep_copy(frames[frames.length-2]);
}

function new_obj(){
    frames[currentFrame]
        .objects.push(default_object());
    currentObject = frames[currentFrame].objects.length - 1;
    click_mode = ADD_POINTS;
    draw();
}

function action_break_path(){
    var pts = frames[currentFrame]
        .objects[currentObject].points;

    pts.push("break");
    add_after++;
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
        'object_color': '#000000',
        'object_opacity': 1,
        'object_line_width': 1
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

    var inputs = frames[currentFrame]
        .objects[currentObject].inputs;

    initInputs(inputs);
}

function path_invert_direction(){
    var points = frames[currentFrame]
        .objects[currentObject].points;

    var start = add_after;
    var end = add_after;

    if(points[add_after-1] != undefined){
        for(var i = add_after-1; i > 0; i--){
            start = i;
            if(points[i] == "break" || points[i] == undefined){
                start++;
                break;
            }
        }
    }
    if(points[add_after+1] != undefined){
        for(var i = add_after+1; i < points.length; i++){
            end = i;
            if(points[i] == "break"){
                end--;
                break;
            }
        }
    }
    var copy = [];
    for(var i = start; i < end; i++){
        copy.push(points[i].slice(0));
    }
    copy = copy.reverse();
    for(var i = start; i < end; i++){
        points[i] = copy[i-start];
    }
    draw();
}

function move_points(object,dx,dy){
    for(point in object){
        object[point][0] += dx;
        object[point][1] += dy;
    }
}

function initEditor(){
    newFrame();
    
    function getPos(e){
        x = e.clientX - can.offsetLeft + window.scrollX;
        y = e.clientY - can.offsetTop + window.scrollY;
        return [x,y];
    }

    var mouse_down = false;

    can.onmousedown = function(e){
        var pos = getPos(e);
        mouse_down = true;
        down(pos[0],pos[1]);
    };

    can.onmouseup = function(e){
        var pos = getPos(e);
        mouse_down = false;
        up(pos[0],pos[1]);
    };

    can.onmousemove = function(e){
        move(e);
    };

    var obj_move = {};

    function move(e){
        var pos = getPos(e);
        x = pos[0];
        y = pos[1];

        switch(click_mode){
        case MOVE_OBJECTS:
            if(mouse_down){
                var new_points = deep_copy(
                    obj_move.initialPoints
                );
                var dx = x - obj_move.initialX;
                var dy = y - obj_move.initialY;
                move_points(new_points,dx,dy);
                frames[currentFrame]
                    .objects[currentObject]
                    .points = new_points;
                draw();
            }
            break;
        case ADD_POINTS:
            break;
        default:
            if(mouse_down){
                var points = frames[currentFrame].objects[currentObject].points;
                if(dragging != -1){
                    points[dragging][0] = x;
                    points[dragging][1] = y;
                    draw();
                }
            }
            break;
        }
    }


    function down(x,y){
        switch(click_mode){
        case DEL_POINTS:
            var selected = clicked_point(x,y,6);

            if(selected != -1){
                points = frames[currentFrame]
                    .objects[currentObject].points;

                points = points.splice(selected,1);
                draw();
            }
            break;
        case MOVE_OBJECTS:
            var selected = clicked_point(x,y,10);
            obj_move.initialX = x;
            obj_move.initialY = y;
            obj_move.initialPoints = deep_copy(
                frames[currentFrame]
                    .objects[currentObject]
                    .points
            );
            break;
        case ADD_POINTS:
            var points = frames[currentFrame]
                .objects[currentObject].points;

            if(points.length == 0){
                add_after = 0;
            }
            if(points.length > 2){
                point_type = points[points.length-1][2];
            }
            if( switches['new-points-mode'] == 'not-smooth'){
                points.splice(add_after+1,
                              0,
                              [x,y,POINT_NOT_SMOOTH]
                             );
                add_after++;
            } else {
                // smooth
                var point_type = POINT_GUIDE;
                if( points.length > 0
                    && points[
                        points.length-1
                    ][2] == POINT_GUIDE ){
                    point_type = POINT_POINT;
                }
                if(points[points.length-1] == "break"){
                    point_type = POINT_POINT;
                }
                if(points.length == 0){
                    point_type = POINT_POINT;
                }
                // add point
                points.splice(add_after,
                              0,
                              [x,y,point_type]
                             );
                add_after++;
            }
            update_object_ui();
            draw();
            selected_point = add_after;
            break;
        default:
        case MOVE_POINTS:
            // Verify if a point was clicked
            var selected = clicked_point(x,y,10);
            dragging = selected;
            update_object_ui();
            draw();
        }
    }

    function clicked_point(x,y,treshold){
        var selected = -1;
        var closest = -1;
        var closest_distance = treshold;
        for(var obj in frames[currentFrame].objects){
            var points = frames[currentFrame]
                .objects[obj].points;
            for(var i in points){
                var point = points[i];
                var d = distance(point[0],point[1],x,y);
                if(!point_viewable(obj,i)){
                    continue;
                }
                
                if(d < treshold && d < closest_distance){
                    currentObject = parseInt(obj);
                    closest_distance = d;
                    selected = i;
                }
            }
        }
        selected_point = selected;
        return selected;
    }

    function up(x,y){
        var points = frames[currentFrame].objects[currentObject].points;
        if(dragging != -1){
            points[dragging][0] = x;
            points[dragging][1] = y;
            dragging = -1;
            draw();
        }
     }
}

function point_viewable(obj,i){
    var points = frames[currentFrame]
        .objects[obj].points;

    if(obj != currentObject){
        return false;
    }
    if(points[i][2] != POINT_GUIDE){
        return true;
    }
    if(Math.abs(i - selected_point) < 3){
        return true;
    }
    return false;
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
        ctx.globalAlpha = inputs['object_opacity'];
        ctx.lineWidth = inputs['object_line_width'];
        ctx.beginPath();
        if(points.length > 0){
            ctx.moveTo(points[0][0],points[0][1]);
        }

        for(var i = 1; i < points.length; i++){
            if(points[i] == "break"){
                if(points[i+1] != undefined){
                    ctx.moveTo(
                        points[i+1][0],
                        points[i+1][1]
                    );
                }
                continue;
            }

            var p = points[i];
            var lp = points[i-1];
            var np = points[i+1];

            if( i < points.length -1 &&
                p[2] == POINT_GUIDE ){
                // lastpoint
                // calculate resolution
                var res = distance(p[0],p[1],lp[0],lp[1])
                    + distance(p[0],p[1],np[0],np[1]);
                res /= 20;
                ctx.moveTo(lp[0],lp[1]);
                for(var j = 0; j <= res; j++){
                    var k = j/res;
                    var m = (1-k) * lp[0] + (k) * p[0];
                    var n = (1-k) * lp[1] + (k) * p[1];
                    var q = (1-k) * p[0] + (k) * np[0];
                    var r = (1-k) * p[1] + (k) * np[1];
                    var s = (1-k) * m + (k) * q;
                    var t = (1-k) * n + (k) * r;
                    ctx.lineTo(s,t);
                }
                if(np[2] != POINT_GUIDE){
                    ctx.lineTo(np[0],np[1]);
                }
            }
            if(p[2] == POINT_NOT_SMOOTH){
                ctx.lineTo(p[0],p[1]);
            }
        }
        if(points.length > 1){
            if(switches['object-fill'] == "no-fill"){
                ctx.stroke();
            } else {
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;

        if(editing){
            for(var i = 0; i < points.length; i++){
                ctx.setLineDash([5,5]);
                if( i > 0
                    && point_viewable(obj,i-1)
                    && point_viewable(obj,i)
                  ){
                    ctx.beginPath();
                    if(points[i-1][2] == POINT_GUIDE){
                        ctx.moveTo(points[i-1][0],
                                   points[i-1][1]);
                        ctx.lineTo(points[i][0],
                                   points[i][1]);
                    }
                    if(points.length > i+1
                       && point_viewable(obj,i+1)){
                        ctx.moveTo(points[i][0],
                                   points[i][1]);
                        ctx.lineTo(points[i+1][0],
                                   points[i+1][1]);
                    }
                    ctx.stroke();
                    ctx.closePath();
                }
                ctx.setLineDash([5,0]);
                var size = 3;
                if( obj == currentObject &&
                    dragging != -1 &&
                    dragging == i ){
                    ctx.fillStyle = "rgba(255,0,0,0.9)";
                } else if ( obj == currentObject){
                    ctx.fillStyle = "rgba(255,100,0,0.9)";
                } else {
                    ctx.fillStyle = "rgba(0,0,0,0.9)";
                }
                if(!point_viewable(obj,i)){
                    continue;
                }

                ctx.fillRect(points[i][0]-size, points[i][1]-size, 2*size,2*size);
            }
        }
    }
}
