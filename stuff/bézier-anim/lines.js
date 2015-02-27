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

var w;
var h;
var current_animation = 0;
var frames;
var current_frame;
var selected_point;
var current_object;
var lastDraw = 0;

var editing = true;
var dragging = -1;
var rotating = -1;
var add_after = 0;

var ADD_MOVE_POINTS = 0;
var DEL_POINTS = 1;
var MOVE_OBJECTS = 3;
var IMAGE_MODE = 4;
var click_mode = ADD_MOVE_POINTS;
var POINT_POINT = 0;
var POINT_GUIDE = 1;
var POINT_NOT_SMOOTH = 2;
var TYPE_PATH = 0;
var TYPE_IMAGE = 1;
var images_waiting = 0;
var image_cache = {};

var animations = [default_animation()];
set_animation_globals();

initEditor();
initTabs();

switch_ui_to_path_mode();

function cache_image(url,disableCrossOrigin){
    if(image_cache[url] == undefined){
        image_cache[url] = new Image();
        // I am mad that this does not work with some images
        //image_cache[url].crossOrigin = 'use-credentials';
        image_cache[url].src = url;
        image_cache[url].onload = draw;
    }
}

/**
   Cache all images found in animation
*/
function fetch_images(){
    var frames = animations[current_animation].frames;
    for(var i = 0; i < frames.length; i++){
        var f = frames[i];
        for(var j = 0; j < f.objects.length; j++){
            if(f.objects[j].type == TYPE_IMAGE){
                cache_image(f.objects[j].inputs.image_url);
            }
        }
    }
}

initInputs(animations[current_animation].inputs, update_animation_inputs);

function update_animation_inputs(){
    updateCanvasSize();
}

function updateCanvasSize(){
    w = animations[current_animation]
        .inputs['animation_width'];
    h = animations[current_animation]
        .inputs['animation_height'];
    can.width = w;
    can.height = h;
    draw();
}

updateCanvasSize();
draw();

var object_inputs = animations[current_animation]
    .inputs;

initInputs(object_inputs, update_object_inputs);

function update_object_inputs(){
    var object = frames[current_frame]
        .objects[current_object];

    if(object.type == TYPE_IMAGE){
        update_image_inputs(object);
    }

    draw();
}

function update_image_inputs(object){
    var url = object.inputs.image_url;
    cache_image(url);
}

function update_object_options(){
    update_object_inputs();
    update_object_switches();
}

var actions = [
    ["animation_play","",action_animation_play],
    ["animation_clear","",action_animation_clear],
    ["animation_save","",action_animation_save],
    ["animation_restore","",action_animation_restore],
    ["animation_to_gif","",action_animation_to_gif],
    ["frame_clear","",action_frame_clear],
    ["frame_delete","",action_frame_delete],
    ["frame_copy","",action_frame_copy],
    ["frame_paste","",action_frame_paste],
    ["object_delete","",action_object_delete],
    ["object_bring_up","",action_object_bring_up],
    ["object_bring_down","",action_object_bring_down],
    ["object_break_path","B",action_break_path],
    ["object_path_new","",new_path_object],
    ["object_image_new","",new_image_object],
    ["object_copy","",action_object_copy],
    ["object_paste","",action_object_paste],
    ["point_convert_to_smooth","",action_point_convert_to_smooth],
    ["","D",action_toggle_point_mode],
    ["path_invert_direction","",path_invert_direction],
    ["frame_next",39,action_next_frame], // Right
    ["frame_prev",37,action_prev_frame], // Left
];

initActions(actions);

var switches = {
    'global-mode': 'add-move-points',
    'new-points-mode': "not-smooth",
};

initSwitches(switches,updateSwitches);

function updateSwitches(){
    switch(switches['global-mode']){
    case 'add-move-points':
        click_mode = ADD_MOVE_POINTS;
        break;
    case 'delete-points':
        click_mode = DEL_POINTS;
        break;
    case 'move-objects':
        click_mode = MOVE_OBJECTS;
        break
    default:
        break;
    }
}

var object_switches = animations[current_animation].switches;

initSwitches(object_switches, update_object_switches);

function update_object_switches(){
    draw();
}

function action_point_convert_to_smooth(){
    var points = frames[current_frame]
        .objects[current_object].points;

    var currp = selected_point;

    /*
      Requires a not smooth point with 2 not-smooth points around it
     */

    if( currp < 1 || currp >= points.length - 1 ){
        pop_error("Requires 2 not-smooth points before and after!");
        return;
    }

    if( points[currp-1][2] != POINT_GUIDE
        && points[currp][2] == POINT_NOT_SMOOTH
        && points[currp+1][2] != POINT_GUIDE ){

        points[currp-1][2] = POINT_POINT;
        points[currp][2] = POINT_GUIDE;
        points[currp+1][2] = POINT_POINT;
    } else if ( points[currp-1][2] == POINT_GUIDE
                && points[currp][2] == POINT_GUIDE
              ){
        add_guide_in_middle(currp-1,currp);
    } else if ( points[currp][2] != POINT_GUIDE
                && points[currp+1][2] != POINT_GUIDE
              ){
        add_guide_in_middle(currp,currp+1);
    } else {
        pop_error("Can't convert to smooth!");
        return;
    }

    function add_guide_in_middle(p1,p2){
        var x = points[p1][0];
        var y = points[p1][1];
        var dx = points[p2][0] - points[p1][0];
        var dy = points[p2][1] - points[p1][1];

        p1[2] = POINT_POINT;
        p2[2] = POINT_POINT;

        var pt = [x+dx/2, y+dy/2, POINT_GUIDE];
        points.splice(p1+1,0,pt);

    }

    draw();
}

function action_animation_to_gif(){
    var to_export = {};

    to_export.delay = 100;
    editing = false;
    to_export.data = [];

    for(var i = 0; i < frames.length; i++){
        draw();
        current_frame = i;
        to_export.data
            .push(can.toDataURL());
    }

    editing = true;
    window.localStorage.to_gif_export = JSON.stringify(to_export);
    draw();
    window.open("gif-export.html");
}

function pop_error(message){
    console.log(message);
}

function action_animation_save(){
    window.localStorage.saved_animations =
        JSON.stringify(deep_copy(animations));
}

function action_animation_restore(){
    animations =
        JSON.parse(window.localStorage.saved_animations);

    set_animation_globals();
    update_object_ui();
    fetch_images();
    draw();
    validate_and_write_frame();
}

var object_clipboard = default_path_object();

function action_object_copy(){
    object_clipboard = deep_copy(
        frames[current_frame].objects[current_object]
    );
}

function action_object_paste(){
    var new_object = deep_copy(object_clipboard);
    move_points(new_object.points,14,14);
    frames[current_frame]
        .objects
        .push(new_object);
    click_mode = MOVE_OBJECTS;
    update_object_ui();
    draw();
}

function action_object_bring_up(){
    if(swap_objects(
        current_object,current_object+1)
      ){
        current_object++;
    }
}

function action_object_bring_down(){
    if(swap_objects(
        current_object,parseInt(current_object)-1)
      ){
        current_object--;
    }
}

function swap_objects(lhs, rhs){
    var objects = frames[current_frame]
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
    var objs = frames[current_frame].objects;
    objs.splice(current_object,1);
    current_object = 0;
    if(objs.length == 0){
        objs.push(default_path_object());
    }
    update_object_options();
    draw();
}

function action_frame_clear(){
    frames[current_frame] = empty_frame();
    current_object = 0;
    draw();
}

function action_frame_delete(){
    frames.splice(current_frame,1);
    current_frame--;
    if(current_frame < 0){
        current_frame = 0;
    }
    if(frames.length == 0){
        frames.push(empty_frame());
    }
    validate_and_write_frame();
}

function action_next_frame(){
    current_frame++;
    validate_and_write_frame();
    update_object_ui();
};
function action_prev_frame(){
    current_frame--;
    validate_and_write_frame();
    update_object_ui();
};


var current_frame_clipboard = empty_frame();

function action_animation_clear(){
    frames = [];
    frames.push(empty_frame());
    current_frame = 0;
    current_object = 0;
    validate_and_write_frame();
    draw();
    click_mode = ADD_MOVE_POINTS;
}

function action_frame_copy(){
    current_frame_clipboard =
        deep_copy(frames[current_frame]);
}

function action_frame_paste(){
    frame_copy = deep_copy(
        current_frame_clipboard
    );
    frames.splice(current_frame + 1, 0, frame_copy);
    current_frame++;
    validate_and_write_frame();
    draw();
}

function action_toggle_point_mode(){
    if(click_mode == DEL_POINTS){
        click_mode = ADD_MOVE_POINTS;
        switches['global-mode'] = 'add-points';
    } else {
        click_mode = DEL_POINTS;
        switches['global-mode'] = 'delete-points';
    }
    initSwitches(switches,updateSwitches);
}


function deep_copy(obj){
    var new_object = {};
    if(obj instanceof Array){
        new_object = [];
    }
    if(obj == null){
        return null;
    }
    for(el in obj){
        if(typeof(obj[el]) == "object"){
            new_object[el] = deep_copy(obj[el]);
        } else {
            new_object[el] = obj[el];
        }
    }
    return new_object;
}

function action_animation_play(){
    if(frames.length > 1){
        current_frame = 0;
        editing = false;
        draw();
        for(var i = 0; i < frames.length-1; i++){
            setTimeout(function(){
                current_frame++;

                draw();
                validate_and_write_frame();
                if(current_frame == frames.length-1){
                    editing = true;
                    draw();
                }
            },(i+1)*130);
        }
    }
}

var curr_frame = QSA(".actions .frame")[0]
var num_frame = QSA(".actions .frames-num")[0]

function validate_and_write_frame(){
    if(current_frame < 0){
        current_frame = 0;
    } else if (current_frame >= frames.length){
        newFrame();
        current_frame = frames.length - 1;
        copy_last_frame_into_new();
    }
    curr_frame.innerHTML = current_frame + 1;
    num_frame.innerHTML = frames.length;
    if(click_mode == DEL_POINTS){
        click_mode = ADD_MOVE_POINTS;
    }
    draw();
}

function copy_last_frame_into_new(){
    frames[frames.length-1] =
        deep_copy(frames[frames.length-2]);
}

function new_path_object(){
    frames[current_frame]
        .objects.push(default_path_object());
    current_object = frames[current_frame].objects.length - 1;
    switch_ui_to_path_mode();
}

function new_image_object(){
    frames[current_frame]
        .objects.push(default_image_object());
    current_object = frames[current_frame].objects.length - 1;
    switch_ui_to_image_mode();
}

function switch_body_mode_class(new_class){
    if(window.mode_classes == undefined){
        window.mode_classes = [];
    }
    for(var i = 0; i < mode_classes.length; i++){
        document.body.classList.remove(mode_classes[i]);
    }
    mode_classes.push(new_class);
    document.body.classList.add(new_class);
}

function switch_ui_to_image_mode(){
    switch_body_mode_class("image-object-mode");
    QSA("tabtitle[data-name='main-image-tab']")[0].switch_to_this();
    click_mode = IMAGE_MODE;
    update_object_ui();
    draw();
}

function switch_ui_to_path_mode(){
    switch_body_mode_class("path-object-mode");
    QSA("tabtitle[data-name='main-path-tab']")[0].switch_to_this();
    click_mode = ADD_MOVE_POINTS;
    update_object_ui();
    draw();
}

function action_break_path(){
    var pts = frames[current_frame]
        .objects[current_object].points;

    pts.push("break");
    add_after++;
    click_mode = ADD_MOVE_POINTS;
    update_object_ui();
}

function default_animation(){
    return {
        name: "",
        frames: [empty_frame()],
        images: [default_image_inputs()],
        current_frame: 0,
        current_object: 0,
        selected_point: 0,
        inputs: default_animation_inputs(),
    }
}

function default_image(){
    return {
        inputs: default_image_inputs(),
    }
}

function default_image_inputs(){
    return {
        "image_url": ""
    }
}

function default_animation_inputs(){
    return {
        'animation_width':'500',
        'animation_height':'500'
    };
}

function set_animation_globals(){
    frames = animations[current_animation].frames;
    current_frame = parseInt(animations[current_animation].current_frame);
    selected_point = parseInt(animations[current_animation].selected_point);
    current_object = parseInt(animations[current_animation].current_object);
}

function default_path_object(){
    return {
        name:"Object",
        points:[],
        type: TYPE_PATH,
        switches: default_path_object_switches(),
        inputs: default_path_object_inputs()
    }
}

function default_image_object(){
    return {
        name:"Object",
        points:[[10,10],[50,50]],
        type: TYPE_IMAGE,
        switches: default_image_object_switches(),
        inputs: default_image_object_inputs(),
    }
}

function default_image_object_inputs(){
    return {
        "image_url": ""
    };
}

function default_image_object_switches(){
    return {};
}

function default_path_object_inputs(){
    return {
        'object_color': '#000000',
        'object_opacity': 1,
        'object_line_width': 1
    };
}

function default_path_object_switches(){
    return {
        'object-fill': "no-fill",
        'object-close-path': "no-close"
    };
}

function newFrame(){
    frames.push(empty_frame());
}

function empty_frame(){
    return {
        objects: [default_path_object()]
    };
}

function update_object_ui(){
    var switches = frames[current_frame]
        .objects[current_object].switches;

    initSwitches(switches, update_object_switches);

    var inputs = frames[current_frame]
        .objects[current_object].inputs;

    initInputs(inputs, update_object_inputs);
}

function path_invert_direction(){
    var points = frames[current_frame]
        .objects[current_object].points;

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
    function getPos(e){
        x = e.clientX - can.offsetLeft + window.scrollX;
        y = e.clientY - can.offsetTop + window.scrollY;
        return [x,y];
    }

    var mouse_down = false;
    can.onmousedown = function(e){
        e.preventDefault();
        down(e);
    };
    
    can.oncontextmenu = function(e){
        e.preventDefault();
    };
        
    can.onmousewheel = function(e){
        e.preventDefault();
    };
    
    can.onwheel = function(e){
        e.preventDefault()
    };
    
    can.onclick = function(e){
        e.preventDefault();
    };

    can.onmouseup = function(e){
        e.preventDefault();
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
            if(mouse_down && selected_point != -1){
                var new_points = deep_copy(
                    obj_move.initialPoints
                );
                var dx = x - obj_move.initialX;
                var dy = y - obj_move.initialY;
                move_points(new_points,dx,dy);
                frames[current_frame]
                    .objects[current_object]
                    .points = new_points;
                draw_delayed();
            }
            break;
        default:
            if(mouse_down){
                var points = frames[current_frame].objects[current_object].points;
                if(dragging != -1){
                    points[dragging][0] = x;
                    points[dragging][1] = y;
                    draw_delayed();
                }
            }
            break;
        }
    }

    var timeout = -1;
    function draw_delayed(){
        var delay = 33;
        var diff = Date.now() - lastDraw;
        if(diff < delay){
            if(timeout == -1){
                setTimeout(draw_delayed,diff+1);
            }
        } else {
            draw();
            clearTimeout(timeout);
            timeout = -1;
        }
    }

    /* Mouse click handling  */
    function down(e){
        var pos = getPos(e);
        mouse_down = true;
        x = pos[0];
        y = pos[1];
        
        var previous_object_id = current_object;
        var selected = clicked_point(x,y,14);               
        
        if(selected != -1){
            var object = frames[current_frame]
                .objects[current_object];
            var previous_object = frames[current_frame]
                .objects[previous_object_id];
            
            if(object.type != previous_object.type){
                switch(object.type){
                case TYPE_IMAGE:
                    switch_ui_to_image_mode();
                    break;
                default:
                    switch_ui_to_path_mode();
                    break;
                }
            }
        }
        
        switch(e.button){
        case 0:
            switch(click_mode){
            case DEL_POINTS: /* Todo: separate this  */
                if(selected != -1){
                    points = frames[current_frame]
                        .objects[current_object].points;
                    
                    if( selected > 0
                        && points[selected-1][2] == POINT_GUIDE){
                        points[selected-1][2] = POINT_POINT;
                    }
                    if( selected < points.length - 1
                        && points[selected+1][2] == POINT_GUIDE ){
                        points[selected+1][2] = POINT_POINT;
                    }
                    points.splice(selected,1);
                    draw();
                }
                break;
            case MOVE_OBJECTS:
                if(selected != -1){
                    obj_move.initialX = x;
                    obj_move.initialY = y;
                    obj_move.initialPoints = deep_copy(
                        frames[current_frame]
                            .objects[current_object]
                            .points
                    );
                }
                break;
            case IMAGE_MODE:
            case ADD_MOVE_POINTS:
                if(selected != -1){
                    dragging = selected;
                    update_object_ui();
                    draw();
                    break;
                }
                if(click_mode == IMAGE_MODE){
                    break;
                }
                var points = frames[current_frame]
                    .objects[current_object].points;
                
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
                }
                selected_point = points.length-1;
                add_after = points.length
                update_object_ui();
                draw();
                break;
            default:
                break;
            }
            
            break;
        case 1:
            break;
        default:
            break;
        }
    }

    function clicked_point(x,y,treshold){
        var selected = -1;
        var closest = -1;
        var closest_distance = treshold;
        for(var obj in frames[current_frame].objects){
            var points = frames[current_frame]
                .objects[obj].points;
            for(var i in points){
                var point = points[i];
                var d = distance(point[0],point[1],x,y);
                if(!point_viewable(obj,i)){
                    continue;
                }

                if(d < treshold && d < closest_distance){
                    current_object = parseInt(obj);
                    closest_distance = d;
                    selected = i;
                }
            }
        }
        /* keep this global  */
        selected_point = parseInt(selected);
        return selected_point;
    }

    function up(x,y){
        var points = frames[current_frame].objects[current_object].points;
        if(dragging != -1){
            points[dragging][0] = x;
            points[dragging][1] = y;
            dragging = -1;
            draw();
        }
     }
}

function point_viewable(obj,i){
    var points = frames[current_frame]
        .objects[obj].points;

    if(switches['global-mode'] == 'delete-points'){
        return true;
    }
    if( obj != current_object
        && points[i][2] == POINT_GUIDE){
        return false;
    }
    if( points[i][2] != POINT_GUIDE){
        return true;
    }
    if( click_mode != ADD_MOVE_POINTS){
        return false;
    }
    if( Math.abs(i - selected_point) < 3){
        return true;
    }
    return false;
}

function distance(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(y2 - y1,2) + Math.pow(x2 - x1,2));
}

function draw(){
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 1;
    ctx.fillRect(0,0,w,h);

    var frame = frames[current_frame];

    var images = animations[current_animation].images;
    for(var i = 0; i < images.length; i++){
        var img = image_cache[images[i].image_url];
        if(img != undefined){
            ctx.drawImage(img,0,0,50,50);
        }
    }

    for(var obj = 0; obj < frame.objects.length; obj++){
        draw_object(obj,frame)
    }

    lastDraw = Date.now();
}

function draw_object(obj,frame){
    var points = frame.objects[obj].points;
    var type = frame.objects[obj].type;
    var switches = frame.objects[obj].switches;
    var inputs = frame.objects[obj].inputs;

    ctx.globalAlpha = 1;

    if( type == TYPE_PATH ){
        draw_path(obj,frame);
    } else if ( type == TYPE_IMAGE ){
        draw_image(obj,frame);
    }

    if( editing ){
        draw_editing_stuff(obj,frame);
    }
}


function draw_image(obj,frame){
    var points = frame.objects[obj].points;
    var type = frame.objects[obj].type;
    var switches = frame.objects[obj].switches;
    var inputs = frame.objects[obj].inputs;

    var image = image_cache[inputs.image_url];

    if(image != undefined){
        var ratio = image.height / image.width;
        var x = points[0][0];
        var y = points[0][1];
        var a = points[1][0];
        var b = points[1][1];

        var d = distance(x,y,a,b);

        var angle = 0;

        // #geometry
        if(x < a){
            angle = Math.atan((b-y)/(x-a));
        } else {
            angle = Math.PI - Math.atan(-(b-y)/(x-a));
        }

        ctx.save();
        ctx.translate(x,y);
        ctx.rotate(-angle);
        ctx.drawImage(image,0,0,d,d*ratio);
        ctx.restore();
    }
}

function draw_path(obj,frame){
    var points = frame.objects[obj].points;
    var type = frame.objects[obj].type;
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

    var fill = true;
    var close = false;

    if(switches['object-fill'] == "no-fill"){
        fill = false;
    }
    if(switches['object-close-path'] == "close"){
        close = true;
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

        if( (i < points.length -1 || (i == points.length -1 && close)) &&
            p[2] == POINT_GUIDE ){
            if( close && i == points.length - 1){
                np = points[0];
            }

            // lastpoint
            // calculate resolution
            var res = distance(p[0],p[1],lp[0],lp[1])
                + distance(p[0],p[1],np[0],np[1]);
            res /= 20;

            if(!fill){
                ctx.moveTo(lp[0],lp[1]);
            }
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
        } else {
            ctx.lineTo(p[0],p[1]);
        }
    }
    if( close ){
        ctx.lineTo(points[0][0],points[0][1]);
    }
    if(points.length > 1){
        if(fill){
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1;
}


function draw_editing_stuff(obj_id,frame){
    var obj = frame.objects[obj_id];
    var points = obj.points;

    for(var i = 0; i < points.length; i++){
        ctx.setLineDash([5,5]);
        ctx.strokeStyle = "#aaa";

        if( points[i][2] == POINT_GUIDE
            && point_viewable(obj_id,i) ){
            ctx.beginPath();
            if( i > 0 ){
                ctx.moveTo(points[i-1][0],
                           points[i-1][1]);
                ctx.lineTo(points[i][0],
                           points[i][1]);

            }
            if( i < points.length - 1 ){
                ctx.moveTo(points[i][0],
                           points[i][1]);
                ctx.lineTo(points[i+1][0],
                           points[i+1][1]);

            } else if ( i == points.length - 1
                      && obj.switches["object-close-path"] == "close"){
                ctx.moveTo(points[i][0],
                           points[i][1]);
                ctx.lineTo(points[0][0],
                           points[0][1]);
            }

            ctx.stroke();
            ctx.closePath();
        }

        ctx.setLineDash([5,0]);
        ctx.lineWidth = 1;
        var size = 3;
        if( obj_id == current_object &&
            dragging != -1 &&
            dragging == i ){
            ctx.fillStyle = "rgba(255,0,0,0.9)";
        } else if ( obj_id == current_object){
            ctx.fillStyle = "rgba(255,100,0,0.9)";
            if(selected_point == i){
                ctx.fillStyle = "#3af";
            }
        } else {
            ctx.fillStyle = "rgba(0,0,0,0.9)";
        }
        if(!point_viewable(obj_id,i)){
            continue;
        }

        ctx.fillRect(points[i][0]-size, points[i][1]-size, 2*size,2*size);
    }
}