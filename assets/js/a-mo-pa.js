$.ready(function(){
    happySquares(".a-mo-pa-canvas");
    happySquares2(".a-mo-pa-canvas-2");
    happySquares3(".a-mo-pa-canvas-3");
    frequencies();
    spirals();
});



function happySquares(element){
    var canvasSelector = element;
    var canvas = $(canvasSelector).elements[0];
    var context = canvas.getContext("2d");
    
    var width;
    var height;

    function adaptSize(){
        width = $("body").width();
        height = window.innerHeight;
        
        canvas.width = width;
        canvas.height = height;
    }
    
    adaptSize();
    $(window).on("resize",adaptSize);
    
    var mouseX = 0;
    var mouseY = 0;
    var clicking = false;

    canvas.onmousemove = function(e){
        e.preventDefault();
        mouseX = e.clientX
        mouseY = e.clientY + window.scrollY - canvas.offsetTop;
        clicking = (e.buttons == 1);
        draw({size:100},context,width,height,mouseX,mouseY,clicking);
        draw({size:50},context,width,height,mouseX,mouseY,clicking);
        draw({size:30},context,width,height,mouseX,mouseY,clicking);
    }  
    
    setInterval(function(){
        context.fillStyle = 
            "rgba(100,100,100,"+(clicking?"0.1":"0.06")+")";
        context.fillRect(0,0,width,height);
    },100);

    
    function draw(settings,context,width,height,mouseX,mouseY,clicking){
        var size = parseInt(Math.random()*2)+settings.size;
        var currentMax = 0;
        var i = 0;
        var j = 0;
        var step = 0;
        var dist;
        var limit;
        var sizeMultiplier;
        
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
    }
}

function happySquares2(element){
    var canvasSelector = element;
    var canvas = $(canvasSelector).elements[0];
    var context = canvas.getContext("2d");
    
    var width;
    var height;

    function adaptSize(){
        width = $("body").width();
        height = window.innerHeight;
        
        canvas.width = width;
        canvas.height = height;
    }
    
    adaptSize();
    $(window).on("resize",adaptSize);
    
    var mouseX = 0;
    var mouseY = 0;
    var clicking = false;

    canvas.onmousemove = function(e){
        e.preventDefault();
        mouseX = e.clientX
        mouseY = e.clientY + window.scrollY - canvas.offsetTop;
        clicking = (e.buttons == 1);
        draw({size:40},context,width,height,mouseX,mouseY,clicking);
    }  
    
    function draw(settings,context,width,height,mouseX,mouseY,clicking){
        var size = parseInt(Math.random()*2)+settings.size;
        var currentMax = 0;
        var i = 0;
        var j = 0;
        var step = 0;
        var dist;
        var limit;
        var sizeMultiplier;
        
        context.fillStyle = "rgba(255,255,255,0.03)";
        context.fillRect(0,0,width,height);
        
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
    }
}

function happySquares3(element){
    var canvasSelector = element;
    var canvas = $(canvasSelector).elements[0];
    var context = canvas.getContext("2d");
    
    var width;
    var height;

    function adaptSize(){
        width = $("body").width();
        height = window.innerHeight
        
        canvas.width = width;
        canvas.height = height;
    }
    
    adaptSize();
    $(window).on("resize",adaptSize);
    
    var mouseX = 0;
    var mouseY = 0;
    var clicking = false;

    canvas.onmousemove = function(e){
        e.preventDefault();
        mouseX = e.clientX
        mouseY = e.clientY + window.scrollY - canvas.offsetTop;
        clicking = (e.buttons == 1);
        draw({size:10},context,width,height,mouseX,mouseY,clicking);
        draw({size:30},context,width,height,mouseX,mouseY,clicking);
        draw({size:50},context,width,height,mouseX,mouseY,clicking);
    }  
    
    function draw(settings,context,width,height,mouseX,mouseY,clicking){
        var size = settings.size;
        var currentMax = 0;
        var i = 0;
        var j = 0;
        var step = 0;
        var dist;
        var limit;
        var sizeMultiplier;
        
        while(currentMax < width*2 || currentMax < height*2){
            var paint,r,g,b;
            
            sizeMultiplier = 2;
            limit = 
                size*sizeMultiplier*Math.random();
            
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
    }
}



function distance(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
}

function adaptSize(canvas){
    width = $("body").width();
    height = window.innerHeight
    
    canvas.width = width;
    canvas.height = height;
}

function frequencies(){
    var c = document.querySelectorAll(".frequencies-canvas")[0];
    var ctx = c.getContext("2d");
    
    c.width = document.body.clientWidth;
    c.height = 400;
    
    adaptSize(c);
    $(window).on("resize",function(){
        adaptSize(c);
    });
    
    
    var j = 0;
    var demiheight = c.height/2;
    var amplitude = 8;
    
    var coolAmps = [
        {amp:2,speed:30},
        {amp:2190,speed:6},
        {amp:2755,speed:1},
        {amp:3020,speed:10},
        {amp:1814,speed:2}]
    
    var colors = ["rgba(255,0,60,0.9)","rgba(200,50,0,0.9)","rgba(150,100,0,0.9)","rgba(100,75,50,0.9)"]
    var coolAmpsInt = null;
    var currentCoolAmp = 0;
        
    c.onclick = function(){
        amplitude = coolAmps[currentCoolAmp].amp;
            
        currentCoolAmp++;
        if(currentCoolAmp >= coolAmps.length){
            currentCoolAmp = 0;
            colors.reverse();
        }
    }
    interval = setInterval(function(){
        j++;
        if(amplitude > 100000){
            amplitude = 1;
        }
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0,0,c.width,c.height);
        for(var i = 0; i < c.width; i++){
            var h = 
                0.5 * c.height / 
                2 * Math.sin(
                    0.2 * Math.PI +
                        amplitude * Math.PI * i 
                        / c.width -
                        j * coolAmps[currentCoolAmp].speed * 20 
                        / 180);
            
            ctx.fillStyle = colors[j % colors.length]            
            ctx.fillRect(i,demiheight+h,1,h);
        }
    },100);
}

function spirals(c,ctx){
    var c = document.querySelectorAll(".spirals-canvas")[0];
    var ctx = c.getContext("2d");
    
    c.width = document.body.clientWidth;
    c.height = 400;
    
    adaptSize(c);
    $(window).on("resize",function(){
        adaptSize(c);
    });

    
    map = new Map(c,ctx);
        
    map.drawLines();
    
    var lastUpdate = new Date().getTime();
    
    var addInterval = null;
    var eraseInterval = null;
    
    //c.onmouseenter = startSpirals;
    
    function startSpirals(){
        addInterval = setInterval(addLines,1000);
        eraseInterval = setInterval(clearSpirals,30);
    }
    
    startSpirals();
    
    c.onmouseleave = function(){
        //clearInterval(addInterval);
        //clearInterval(eraseInterval);
    }
    
    function addLines(){
        map.points = [];
        x = Math.floor(Math.random()*c.width);
        y = Math.floor(Math.random()*c.height);
        
        var iterations = Math.floor(Math.random()*50)+50;
        
        for(var i = 0; i < iterations; i++){
            map.points.push(x+Math.floor(i*Math.sin(i)*3));
            map.points.push(y+Math.floor(i*Math.cos(i)*3));
        }
        
        map.drawLines();
    }

    function clearSpirals(){
        //this.ctx.clearRect(0,0,this.c.width,this.c.height);
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.fillRect(0,0,c.width,c.height);

    }
}

function Map(c,ctx){
    this.c = c;
    this.ctx = ctx;
    this.lines = [];
    this.points = [];
}

Map.prototype.drawLines = function(){    
    // For loop transformed into an interval
    var that = this;
    var i = 0;
    var interval = setInterval(function(){
        that.ctx.strokeStyle = "rgba(255,255,50,0.1)";
        that.ctx.lineWidth = 40;
        map.stroke(that.points[i-2],that.points[i-1],that.points[i],that.points[i+1]);
        
        that.ctx.strokeStyle = "rgba(200,100,50,0.4)";
        that.ctx.lineWidth = 20;
        map.stroke(that.points[i-2],that.points[i-1],that.points[i],that.points[i+1]);
        that.ctx.strokeStyle = "rgba(255,200,50,0.6)";
        that.ctx.lineWidth = 14;
        map.stroke(that.points[i-2],that.points[i-1],that.points[i],that.points[i+1]);
        that.ctx.strokeStyle = "rgba(255,255,50,0.6)";
        that.ctx.lineWidth = 2;
        map.stroke(that.points[i-2],that.points[i-1],that.points[i],that.points[i+1]);

        
        i += 2;
        if(i > that.points.length){
            clearInterval(interval);
        }
    },50);
}

Map.prototype.stroke = function(x,y,x2,y2){
    var ctx = this.ctx;

    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}