function distance(x1,y1,x2,y2){
    return Math.sqrt(
        Math.pow(y2 - y1,2) + Math.pow(x2 - x1,2)
    );
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
