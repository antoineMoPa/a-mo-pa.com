function bwmpc_init_draw(g){

    var can = g.can;
    var ctx = g.ctx;
    
    window.draw = draw;
    
    function draw(){
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 1;
        var frames = g.frames;
        var current_frame = g.current_frame;
        var w = g.w;
        var h = g.h;
        ctx.fillRect(0,0,w,h);
        
        var frame = frames[current_frame];
                
        for( var obj = 0;
             obj < frame.objects.length;
             obj++ ){
            draw_object(obj,frame)
        }

        if( g.editing ){
            draw_rig();
        }
        
        lastDraw = Date.now();
    }
    
    function draw_rig(){
        var rig = g.frames[g.current_frame].rig;
        var size = 3;
        for(var i = 0; i < rig.length; i++){
            ctx.fillStyle = "#3AF";
            ctx.fillRect(
                rig[i][0]-size,
                rig[i][1]-size,
                2*size,
                2*size
            );
        }
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
        
        if( g.editing ){
            draw_editing_stuff(obj,frame);
        }
    }

    function draw_image(obj,frame){
        var points = frame.objects[obj].points;
        var type = frame.objects[obj].type;
        var switches = frame.objects[obj].switches;
        var inputs = frame.objects[obj].inputs;
        
        var image = image_cache[inputs.image_file_id];
        
        if(image != undefined){
            var ratio = image.height / image.width;
            
            var info = points_angle_info(
                points[0][0],
                points[0][1],
                points[1][0],
                points[1][1]
            );
            
            var angle = info[0] + 1/2*Math.PI;
            var d = info[1];
            var x = points[0][0];
            var y = points[0][1];
            
            
            ctx.save();
            ctx.translate(x,y);
            ctx.rotate(-angle);
            ctx.translate(-d/(2*ratio),0);
            ctx.drawImage(image,0,0,d/ratio,d);
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
            if( points[i][2] == POINT_BREAK ){
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
            
            if( (i < points.length -1 ||
                 (i == points.length -1 && close) ) &&
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
                && g.point_viewable(obj_id,i) ){
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
                            && obj
                            .switches["object-close-path"]
                            == "close" ){
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
            if( obj_id == g.current_object &&
                g.dragging != -1 &&
                g.dragging == i ){
                ctx.fillStyle = "rgba(255,0,0,0.9)";
            } else if ( obj_id == g.current_object){
                ctx.fillStyle = "rgba(255,100,0,0.9)";
                if(g.selected_point == i){
                    ctx.fillStyle = "#3af";
                }
            } else {
                ctx.fillStyle = "rgba(0,0,0,0.9)";
            }
            if(!g.point_viewable(obj_id,i)){
                continue;
            }
            
            ctx.fillRect(
                points[i][0]-size,
                points[i][1]-size,
                2*size,
                2*size
            );
        }
    }
}
