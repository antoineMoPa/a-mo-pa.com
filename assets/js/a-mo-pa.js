$.ready(function(){
    var canvas = $(".a-mo-pa-canvas").elements[0];
    var context = canvas.getContext("2d");
    
    var width = $("body").width();
    var height = $("body").height();
    
    canvas.width = width;
    canvas.height = height;
    
    var mouseX = 0;
    var mouseY = 0;
    var clicking = false;

    $(window).on("mousemove",function(e){
        e.preventDefault();
        mouseX = e.clientX;
        mouseY = e.clientY;
        clicking = (e.buttons == 1);
        draw({size:100});
        draw({size:50});
        draw({size:30});
    });
    
    function draw(settings){
        var size = parseInt(Math.random()*2)+settings.size;
        var currentMax = 0;
        var i = 0;
        var j = 0;
        var step = 0;
        var dist;
        var limit;
        var sizeMultiplier;

        //context.fillStyle = "rgba(255,255,255,0.03)";
        //context.fillRect(0,0,width,height);
        
        while(currentMax < width*2 || currentMax < height*2){
            var paint,r,g,b;
            
            sizeMultiplier = parseInt(Math.random()*4)%16;
            limit = 
                size*sizeMultiplier + 
                Math.random()*sizeMultiplier;
            
            dist = distance(i,j,mouseX,mouseY);
            
            if(dist < limit){
                if(step % 2 == 0){
                    paint = parseInt(currentMax/width*255*Math.random());
                    r = (200-parseInt(paint/5));
                    g = paint;
                    b = parseInt(100*Math.random());
                }
                else{
                    paint = parseInt(currentMax/width*255);
                    r = parseInt(i/width*255);
                    g = parseInt(i/width*255*Math.random());
                    b = 40+parseInt(Math.random())*155-parseInt(i/width*40);
                }
                if(clicking){
                    context.fillStyle = 
                        "rgba("+r+","+g+","+b+",0.4)";
                }
                else{
                    context.fillStyle = 
                        "rgba("+r+","+g+","+b+",0.1)";
                }
                context.fillRect(i,j,size,size);
            }

            j += size;
            i -= size;
            
            // line change
            if(j > currentMax){
                j = 0;
                i = currentMax += size;
                step++;
            }
        }
        
        function distance(x1,y1,x2,y2){
            return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
        }
        
    } 
});