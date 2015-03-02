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


var POINT_POINT = 0;
var POINT_GUIDE = 1;
var POINT_NOT_SMOOTH = 2;
var TYPE_PATH = 0;
var TYPE_IMAGE = 1;

bwmpc();

/**
   Black & White Motion Picture Co.
*/
function bwmpc(){
    var g = {};

    /* Make some functions accessible from g */
    g.point_viewable = point_viewable;
    
    g.can = QSA("canvas[name=tomato]")[0];
    g.ctx = g.can.getContext("2d");
    
    g.w = 500;
    g.h = 500;
    
    g.current_animation = 0;
    g.frames;
    g.current_frame;
    
    g.selected_point;
    g.current_object;
    var lastDraw = 0;
    var add_after = 0;
    g.editing = true;
    g.dragging = -1;
    g.rotating = -1;
    g.grabbing = -1;
    g.scaling = -1;

    g.animations = [default_animation()];

    bwmpc_init_draw(g);
    
    set_animation_globals();
    initEditor();
    initTabs();
    switch_ui_to_path_mode();
    
    initInputs(
        g.animations[g.current_animation].inputs,
        update_animation_inputs
    );
    
    function update_animation_inputs(){
        updateCanvasSize();
    }
    
    function updateCanvasSize(){    
        g.w = g.animations[g.current_animation]
            .inputs['animation_width'];
        g.h = g.animations[g.current_animation]
            .inputs['animation_height'];
        g.can.width = g.w;
        g.can.height = g.h;
        draw();
    }
    
    updateCanvasSize();
    draw();
    
    var object_inputs = g.animations[g.current_animation]
        .frames[g.current_frame]
        .objects[g.current_object]
        .inputs;
    
    initInputs(object_inputs, update_object_inputs);
    
    function update_object_inputs(){
        var object = g.frames[g.current_frame]
            .objects[g.current_object];
        
        if(object.type == TYPE_IMAGE){
            update_image_inputs(object);
        }
        
        draw();
    }
    
    function update_image_inputs(object){
        draw();
    }
    
    function update_object_options(){
        update_object_inputs();
        update_object_switches();
    }
    
    listen_key('R');  // Rotate
    listen_key('G');  // Grab
    listen_key('S');  // Scale
    listen_key('D');  // Delete
    
    var actions = [
        ["animation_play","P",action_animation_play],
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
        ["object_path_new","N",new_path_object],
        ["object_image_new","",new_image_object],
        ["object_copy","",action_object_copy],
        ["object_paste","",action_object_paste],
        ["object_copy_to_following_frames","",action_object_copy_to_following_frames],
        ["point_convert_to_smooth","",action_point_convert_to_smooth],
        ["path_invert_direction","",path_invert_direction],
        ["frame_next",39,action_next_frame], // Right
        ["frame_prev",37,action_prev_frame], // Left
    ];
    
    initActions(actions);
    
    var switches = {
        'new-points-mode': "not-smooth",
    };
    
    initSwitches(switches);
    
    var object_switches = g.animations[g.current_animation]
        .switches;
    
    initSwitches(object_switches, update_object_switches);
    
    function update_object_switches(){
        draw();
    }
    
    function action_object_copy_to_following_frames(){
        var object = deep_copy(
            g.frames[g.current_frame]
                .objects[g.current_object]
        );
        
        for( var i = g.current_frame+1;
             i < g.frames.length; i++ ){
            var pos = g.current_object;
            if(pos > g.frames[i].objects.length){
                pos = g.frames[i].objects.length - 1;
            }
            g.frames[i].objects.splice(
                pos,
                0,
                object
            )
        }
    }
    
    function action_point_convert_to_smooth(){
        var points = g.frames[g.current_frame]
            .objects[g.current_object].points;
        
        var currp = g.selected_point;
        
        /*
          Requires a not smooth point with 2
          not-smooth points around it
        */
        
        if(points.length < 2){
            pop_error(
                "requires at least 2 points"
            );
        }
        
        if(!(currp < 1 || currp >= points.length - 1)){
            if( points[currp-1][2] != POINT_GUIDE
                && points[currp][2] == POINT_NOT_SMOOTH
                && points[currp+1][2] != POINT_GUIDE ){
                
                points[currp-1][2] = POINT_POINT;
                points[currp][2] = POINT_GUIDE;
                points[currp+1][2] = POINT_POINT;
                
                draw();
                return;
            }
        }
        
        if ( points[currp-1] != undefined
             && points[currp-1][2] != POINT_GUIDE
             && points[currp][2] != POINT_GUIDE ){
            add_guide_in_middle(currp-1,currp);
        } else if ( points[currp+1] != undefined
                    && points[currp][2] != POINT_GUIDE
                    && points[currp+1][2] != POINT_GUIDE ){
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
        g.editing = false;
        to_export.data = [];
        
        for(var i = 0; i < g.frames.length; i++){
            draw();
            g.current_frame = i;
            to_export.data
                .push(g.can.toDataURL());
        }
        
        g.editing = true;
        window.localStorage.to_gif_export =
            JSON.stringify(to_export);
        draw();
        window.open("gif-export.html");
    }
    
    function pop_error(message){
        console.log(message);
    }
    
    function action_animation_save(){
        window.localStorage.saved_g.animations =
            JSON.stringify(deep_copy(g.animations));
    }
    
    function action_animation_restore(){
        g.animations =
            JSON.parse(
                window.localStorage.saved_g.animations
            );
        
        g.current_animation = 0;
        
        set_animation_globals();
        update_object_ui();
        fetch_images(draw);
        draw();
        validate_and_write_frame();
    }

    var object_clipboard = default_path_object();
    
    function action_object_copy(){
        object_clipboard = deep_copy(
            g.frames[g.current_frame]
                .objects[g.current_object]
        );
    }
    
    function action_object_paste(){
        var new_object = deep_copy(object_clipboard);
        move_points(new_object.points,14,14);
        g.frames[g.current_frame]
            .objects
            .push(new_object);
        update_object_ui();
        draw();
    }
    
    function action_object_bring_up(){
        if(swap_objects(
            g.current_object,g.current_object+1)
          ){
            g.current_object++;
        }
    }
    
    function action_object_bring_down(){
        if(swap_objects(
            g.current_object,parseInt(g.current_object)-1)
          ){
            g.current_object--;
        }
    }
    
    function swap_objects(lhs, rhs){
        var objects = g.frames[g.current_frame]
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
        var objs = g.frames[g.current_frame].objects;
        objs.splice(g.current_object,1);
        g.current_object = 0;
        if(objs.length == 0){
            objs.push(default_path_object());
        }
        update_object_options();
        draw();
    }
    
    function action_frame_clear(){
        g.frames[g.current_frame] = empty_frame();
        g.current_object = 0;
        draw();
    }
    
    function action_frame_delete(){
        g.frames.splice(g.current_frame,1);
        g.current_frame--;
        if(g.current_frame < 0){
            g.current_frame = 0;
        }
        if(g.frames.length == 0){
            g.frames.push(empty_frame());
        }
        validate_and_write_frame();
    }
    
    function action_next_frame(){
        g.current_frame++;
        validate_and_write_frame();
        update_object_ui();
    };
    function action_prev_frame(){
        g.current_frame--;
        validate_and_write_frame();
        update_object_ui();
    };
    
    var current_frame_clipboard = empty_frame();
    
    function action_animation_clear(){
        g.frames = [];
        g.frames.push(empty_frame());
        g.current_frame = 0;
        g.current_object = 0;
        validate_and_write_frame();
        draw();
    }
    
    function action_frame_copy(){
        current_frame_clipboard =
            deep_copy(g.frames[g.current_frame]);
    }
    
    function action_frame_paste(){
        frame_copy = deep_copy(
            current_frame_clipboard
        );
        g.frames.splice(g.current_frame + 1, 0, frame_copy);
        g.current_frame++;
        validate_and_write_frame();
        draw();
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
        if(g.frames.length > 1){
            g.current_frame = 0;
            g.editing = false;
            draw();
            for(var i = 0; i < g.frames.length-1; i++){
                setTimeout(function(){
                    g.current_frame++;
                    
                    draw();
                    validate_and_write_frame();
                    if(g.current_frame == g.frames.length-1){
                        g.editing = true;
                        draw();
                    }
                },(i+1)*130);
            }
        }
    }
    
    var curr_frame = QSA(".actions .frame")[0];
    var num_frame = QSA(".actions .frames-num")[0];
    validate_and_write_frame();
    
    function validate_and_write_frame(){
        if( g.current_frame < 0 ){
            g.current_frame = 0;
        } else if ( g.current_frame >= g.frames.length ){
            newFrame();
            g.current_frame = g.frames.length - 1;
            copy_last_frame_into_new();
        }
        if( g.current_object >=
            g.frames[g.current_frame].objects.length ){
            g.current_object =
                g.frames[g.current_frame].objects.length - 1;
        }
        
        add_after =
            g.frames[g.current_frame]
            .objects[g.current_object]
            .points.length -1;
        
        curr_frame.innerHTML = g.current_frame + 1;
        num_frame.innerHTML = g.frames.length;
        draw();
    }
    
    function copy_last_frame_into_new(){
        g.frames[g.frames.length-1] =
            deep_copy(g.frames[g.frames.length-2]);
    }
    
    function new_path_object(){
        g.frames[g.current_frame]
            .objects.push(default_path_object());
        g.current_object =
            g.frames[g.current_frame].objects.length - 1;
        switch_ui_to_path_mode();
    }
    
    function new_image_object(){
        g.frames[g.current_frame]
            .objects.push(default_image_object());
        g.current_object =
            g.frames[g.current_frame].objects.length - 1;
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
        QSA("tabtitle[data-name='main-image-tab']")[0]
            .switch_to_this();
        update_object_ui();
        draw();
    }
    
    function switch_ui_to_path_mode(){
        switch_body_mode_class("path-object-mode");
        QSA("tabtitle[data-name='main-path-tab']")[0]
            .switch_to_this();
        update_object_ui();
        draw();
    }
    
    function action_break_path(){
        var points = g.frames[g.current_frame]
            .objects[g.current_object].points;

        if(points[points.length-1] != "break"){
            points.push("break");
        }
        
        var last = points[points.length-2];
        points.push([
            last[0]+10,
            last[1]+10,
            POINT_NOT_SMOOTH
        ]);

        g.selected_point = points.length - 1;
        add_after = g.selected_point;
        draw();
        update_object_ui();
    }
    
    function default_animation(){
        return JSON.parse(DEFAULT_ANIMATION)[0];
    }
    
    function empty_animation(){
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
    
    function default_animation_inputs(){
        return {
            'animation_width':'500',
            'animation_height':'500'
        };
    }
    
    function set_animation_globals(){
        g.frames = g.animations[g.current_animation].frames;
        
        image_store = g.animations[g.current_animation]
            .image_store;
        
        g.current_frame =
            parseInt(g.animations[g.current_animation]
                     .current_frame);
        g.selected_point =
            parseInt(g.animations[g.current_animation]
                     .selected_point);
        g.current_object =
            parseInt(g.animations[g.current_animation]
                     .current_object);
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
            "image_file": null,
            "image_file_id": null
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
        g.frames.push(empty_frame());
    }
    
    function empty_frame(){
        return {
            objects: [default_path_object()]
        };
    }
    
    function update_object_ui(){
        var switches = g.frames[g.current_frame]
            .objects[g.current_object].switches;
        
        initSwitches(switches, update_object_switches);
        
        var inputs = g.frames[g.current_frame]
            .objects[g.current_object].inputs;
        
        initInputs(inputs, update_object_inputs);
    }
    
    function path_invert_direction(){
        var points = g.frames[g.current_frame]
            .objects[g.current_object].points;
        
        var start = g.selected_point;
        var end = g.selected_point;
        
        if(points[g.selected_point-1] != undefined){
            for(var i = g.selected_point-1; i >= 0; i--){
                start = i;
                if( points[i] == "break" ||
                    points[i] == undefined ){
                    start++;
                    break;
                }
            }
        }
        if(points[g.selected_point+1] != undefined){
            var num = points.length;
            for(var i = g.selected_point+1;i < num; i++){
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
            x = e.clientX -
                g.can.offsetLeft + window.scrollX;
            y = e.clientY -
                g.can.offsetTop + window.scrollY;
            return [x,y];
        }
        
        g.can.onkeydown = function(){
            
        }
        
        var mouse_down = false;
        g.can.onmousedown = function(e){
            e.preventDefault();
            down(e);
        };
        
        g.can.oncontextmenu = function(e){
            e.preventDefault();
        };
        
        g.can.onmousewheel = function(e){
            e.preventDefault();
        };
        
        g.can.onwheel = function(e){
            e.preventDefault()
        };
        
        g.can.onclick = function(e){
            e.preventDefault();
        };
        
        g.can.onmouseup = function(e){
            e.preventDefault();
            var pos = getPos(e);
            mouse_down = false;
            up(pos[0],pos[1]);
        };
        
        g.can.onmousemove = function(e){
            move(e);
        };
        
        var obj_move = {};
        var obj_rotate = {};
        var obj_scale = {};
        
        function move(e){
            var pos = getPos(e);
            x = pos[0];
            y = pos[1];
            
            if(mouse_down){
                var points = g.frames[g.current_frame]
                    .objects[g.current_object]
                    .points;
                if(g.dragging != -1){
                    points[g.dragging][0] = x;
                    points[g.dragging][1] = y;
                    draw_delayed();
                } else if (g.rotating != -1){
                    draw_delayed(function(){
                        var info = points_angle_info(
                            obj_rotate.middleX,
                            obj_rotate.middleY,
                            x,
                            y
                        );
                        
                        var theta = info[0];
                        var initial_theta = obj_rotate
                            .initial_angle_info[0];
                        var d = info[1];
                        
                        var treshold = 20;
                        
                        if(d < treshold){
                            theta = (d)/treshold * theta +
                                (treshold - d) /
                                treshold * initial_theta;
                        }
                        
                        var angle = theta - initial_theta;
                        
                        new_points = rotate_points(
                            obj_rotate.initialPoints,
                            angle,
                            obj_rotate.middleX,
                            obj_rotate.middleY
                        );
                        
                        g.frames[g.current_frame]
                            .objects[g.current_object]
                            .points = new_points;
                        
                    });
                    
                } else if (g.scaling != -1){
                    draw_delayed(function(){
                        var d = distance(
                            x,
                            y,
                            obj_scale.middleX,
                            obj_scale.middleY
                        );
                        
                        var factor = d /
                            obj_scale.initial_distance;
                        
                        new_points = scale_points(
                            obj_scale.initialPoints,
                            factor,
                            obj_scale.middleX,
                            obj_scale.middleY
                        );
                        
                        g.frames[g.current_frame]
                            .objects[g.current_object]
                            .points = new_points;
                        
                    });
                } else if (g.grabbing != -1) {
                    draw_delayed(function(){
                        var new_points = deep_copy(
                            obj_move.initialPoints
                        );
                        var dx = x - obj_move.initialX;
                        var dy = y - obj_move.initialY;
                        move_points(new_points,dx,dy);
                        g.frames[g.current_frame]
                            .objects[g.current_object]
                            .points = new_points;
                    });
                }
            }
        }
        
        var timeout = -1;
        function draw_delayed(before){
            var before = before || function(){};
            var delay = 5;
            var diff = Date.now() - lastDraw;
            
            if(diff < delay){
                if(timeout == -1){
                    setTimeout(draw_delayed,diff+1);
                }
            } else {
                before();
                draw();
                clearTimeout(timeout);
                timeout = -1;
            }
        }
        
        function clean_current_path_object(){
            var points = g.frames[g.current_frame]
                .objects[g.current_object]
                .points;
            
            /* Remove breaks at end of objects */
            
            if ( points[points.length-1] == "break" ){
                points.splice(points.length-1,1);
            }
            if ( points[0] == "break" ){
                points.splice(0,1);
            }
        }
        
        /* Mouse click handling  */
        function down(e){
            var pos = getPos(e);
            mouse_down = true;
            x = pos[0];
            y = pos[1];
            
            var previous_object_id = g.current_object;
            var selected = clicked_point(x,y,14);
            
            if(selected != -1){
                var object = g.frames[g.current_frame]
                    .objects[g.current_object];
                var previous_object = g.frames[g.current_frame]
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
            
            if(listened_keys.R){
                /* Object rotation */
                if(selected != -1){
                    var points = g.frames[g.current_frame]
                        .objects[g.current_object]
                        .points;
                    
                    g.rotating = selected;
                    
                    var box = points_box_info(points);
                    
                    obj_rotate.middleX =
                        ( box[0] + box[1] ) / 2;
                    obj_rotate.middleY =
                        ( box[2] + box[3] ) / 2;
                    
                    obj_rotate.initial_angle_info =
                        points_angle_info(
                            obj_rotate.middleX,
                            obj_rotate.middleY,
                            x,
                            y
                        );
                    
                    obj_rotate.initialX = x;
                    obj_rotate.initialY = y;
                    obj_rotate.initialPoints = deep_copy(
                        points
                    );
                }
            } else if (listened_keys.G) {
                /* grab whole object */
                var points = g.frames[g.current_frame]
                    .objects[g.current_object]
                    .points;
                
                
                if(selected != -1){
                    g.grabbing = selected;
                    obj_move.initialX = x;
                    obj_move.initialY = y;
                    obj_move.initialPoints = deep_copy(
                        points
                    );
                }
            } else if (listened_keys.S) {
                /* scale whole object */
                if(selected != -1){
                    g.scaling = selected;
                    var points = g.frames[g.current_frame]
                        .objects[g.current_object]
                        .points;
                    
                    var box = points_box_info(points);
                    obj_scale
                        .middleX
                        = ( box[0] + box[1] ) / 2;
                    obj_scale
                        .middleY
                        = ( box[2] + box[3] ) / 2;
                    
                    obj_scale.initial_distance = distance(
                        x,
                        y,
                        obj_scale.middleX,
                        obj_scale.middleY
                    );
                    
                    obj_scale.initialPoints = deep_copy(
                        g.frames[g.current_frame]
                            .objects[g.current_object]
                            .points
                    );
                }
            } else if (window.listened_keys.D) {
                /* Delete point */
                if(selected != -1){
                    points = g.frames[g.current_frame]
                        .objects[g.current_object].points;
                    
                    var has_prev = selected > 1;
                    var has_next =
                        selected < points.length - 1;
                    
                    if( selected > 0
                        && points[selected-1][2]
                        == POINT_GUIDE){
                        points[selected-1][2] = POINT_POINT;
                    }
                    if( has_next
                        && points[selected+1][2] ==
                        POINT_GUIDE ){
                        points[selected+1][2] =
                            POINT_NOT_SMOOTH;
                    }
                    if( has_prev
                        && points[selected-1][2] ==
                        POINT_GUIDE ){
                        points[selected-1][2] =
                            POINT_NOT_SMOOTH;
                    }
                    points.splice(selected,1);
                    draw();
                }
            } else if (e.button == 0){
                if(selected != -1){
                    g.dragging = selected;
                    update_object_ui();
                    draw();
                    return;
                }
                var object = g.frames[g.current_frame]
                    .objects[g.current_object];
                
                if(object.type == TYPE_IMAGE){
                    return;
                }
                
                var points = object.points;
                
                if(points.length == 0){
                    add_after = 0;
                }
                if(points.length > 2){
                    point_type = points[points.length-1][2];
                }
                if( add_after != points.length -1
                    || switches['new-points-mode'] ==
                    'not-smooth' ){
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
                g.selected_point = points.length-1;
                
                if(object.type == TYPE_PATH ){
                    clean_current_path_object();
                }
                
                update_object_ui();
                draw();
            }
        }
        
        function clicked_point(x,y,treshold){
            var selected = -1;
            var closest = -1;
            var closest_distance = treshold;
            
            for( var obj in
                 g.frames[g.current_frame].objects ){
                var points = g.frames[g.current_frame]
                    .objects[obj].points;
                for(var i in points){
                    var point = points[i];
                    var d = distance(point[0],point[1],x,y);
                    if(!point_viewable(obj,i)){
                        continue;
                    }
                    
                    if( d < treshold
                        && d < closest_distance ){
                        g.current_object = parseInt(obj);
                        closest_distance = d;
                        selected = i;
                    }
                }
            }
            
            if(selected != -1){
                console.log(get_point_type_str(
                    g.frames[g.current_frame]
                        .objects[g.current_object]
                        .points[selected][2]
                ));
            }
            
            /* keep this global  */
            g.selected_point = parseInt(selected);
            if(g.selected_point != -1){
                add_after = g.selected_point;
            }
            return g.selected_point;
        }
        
        function get_point_type_str(type){
            switch(type){
            case POINT_POINT:
                return "smooth point";
                break;
            case POINT_GUIDE:
                return "guide point"
                break;
            case POINT_NOT_SMOOTH:
                return "not smooth point";
                break;
            default:
                return "unknown"
                break;
            }
        }
        
        function up(x,y){
            var points = g.frames[g.current_frame]
                .objects[g.current_object].points;
            
            g.dragging = -1;
            g.rotating = -1;
            g.grabbing = -1;
            g.scaling = -1;
            draw_delayed();
        }
    }
    
    function point_viewable(obj,i){
        var points = g.frames[g.current_frame]
            .objects[obj].points;
        
        if( listened_keys.D == true ){
            return true;
        }
        if( obj != g.current_object
            && points[i][2] == POINT_GUIDE){
            return false;
        }
        if( points[i][2] != POINT_GUIDE){
            return true;
        }
        if( Math.abs(i - g.selected_point) < 3){
            return true;
        }
        return false;
    }
    
    function rotate_points(points, angle, x, y){
        var new_points = deep_copy(points);
        for(var i = 0; i < new_points.length; i++){
            var a = new_points[i][0];
            var b = new_points[i][1];
            var info = points_angle_info(x,y,a,b);
            var theta = info[0];
            var h = info[1];
            
            a = h * Math.cos(-angle - theta);
            b = h * Math.sin(-angle - theta);
            
            new_points[i][0] = (a + x);
            new_points[i][1] = (b + y);
        }
        return new_points;
    }
    
    function scale_points(points, factor, x, y){
        var new_points = deep_copy(points);
        for(var i = 0; i < new_points.length; i++){
            var a = new_points[i][0];
            var b = new_points[i][1];
            var dx = a - x;
            var dy = b - y;
            
            new_points[i][0] = (x + factor * dx);
            new_points[i][1] = (y + factor * dy);
        }
        return new_points;
    }
    
    
    
    function points_box_info(points){
        var minx = 0;
        var maxx = 0;
        var miny = 0;
        var maxy = 0;
        
        for(var i = 0; i < points.length; i++){
            if(points[i][0] < points[minx][0]){
                minx = i;
            }
            if(points[i][0] > points[maxx][0]){
                maxx = i;
            }
            if(points[i][1] < points[miny][1]){
                miny = i;
            }
            if(points[i][1] > points[maxy][1]){
                maxy = i;
            }
        }
        
        return [
            points[minx][0],
            points[maxx][0],
            points[miny][1],
            points[maxy][1]
        ];
    }
    
    /* returns [angle,distance] */
    function points_angle_info(x,y,a,b){
        var d = distance(x,y,a,b);
        var angle = 0;
        
        // #geometry
        if(x < a){
            angle = Math.atan((b-y)/(x-a));
        } else {
            angle = Math.PI - Math.atan(-(b-y)/(x-a));
        }
        
        return [angle,d];
    }
    
}
