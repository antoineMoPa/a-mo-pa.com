
initWaves()


function initWaves(){
    var canvas = document.querySelectorAll("canvas[name=waves]")[0];
    var playBtn = document.querySelectorAll("a.play")[0];
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    
    playBtn.onclick = play;
    
    var animationInterval = null;
    
    function animate(){        
        animationInterval = setInterval(function(){
            iterate();
            draw();
        },100);        
    }
    
    function play(){
        if(animationInterval != null){
            clearInterval(animationInterval);
            animationInterval = null;
            this.innerHTML = "Play";
        } else {            
            this.innerHTML = "Pause";
            animate();
        }
    }
    
    var heights = bidimentionnalArray(w, h, 0.5);
    var speeds = bidimentionnalArray(w, h, 0);
    var mass = 1;
    var interval = 0.2;
    var time = 0;
    
    var oscillators = [];
    
    // young
    //oscillators.push({i:245,j:100,radius:2,amplitude:2, periodic: true, omega: 5});
    //oscillators.push({i:255,j:100,radius:2,amplitude:2, periodic: true, omega: 5});
    
    // moving source
    var xMoving = function(time){return 250+Math.cos(time)*100;}
    var yMoving = function(time){return 250+Math.sin(time)*100;}
    oscillators.push({i:xMoving,j:yMoving,radius:3,amplitude:4, periodic: true, omega: 5});
    

    /*
    // Moving object
    oscillators.push(
        {
            i: 250,
            j: function(time){return 10*time + 100},
            radius: 3,
            amplitude: 2,
            periodic: true,
            omega: 3
        }
    );
    */
    oscillate(0);
    draw();

    function point(i,j,radius,value){
        var i = parseInt(i);
        var j = parseInt(j);
        for(var k = i - radius; k < i + radius; k++){
            for(var l = j - radius; l < j + radius; l++){
                var dist = d(i,j,k,l);
                if(dist < radius){
                    heights[k][l] += value * (1-dist / radius);
                }                
            }
        }
        function d(x1,y1,x2,y2){
            return Math.sqrt(Math.pow(y2-y1,2)+Math.pow(x2-x1,2));
        }
    }
    
    
    // oscillate oscillators
    function oscillate(){
        for(var i = 0; i < oscillators.length; i++){
            /* position (i,j) and radius can be callbacks */
            /* Amplitude can be either periodic or not */            
            point(
                typeof(oscillators[i].i) == 'function'? oscillators[i].i(time): oscillators[i].i,
                typeof(oscillators[i].j) == 'function'? oscillators[i].j(time): oscillators[i].j,
                typeof(oscillators[i].radius) == 'function'? oscillators[i].radius(time): oscillators[i].radius,
                oscillators[i].periodic == false? oscillators[i].amplitude: Math.sin(oscillators[i].omega * time) * oscillators[i].amplitude
            )
        }
    }
    
    function iterate(){        
        var factor = 1/4;
        
        time += interval;
        oscillate();
        
        // equilibrate heights
        for(var i = 1; i < w - 1; i++){
            for(var j = 1; j < h - 1; j++){            
                equilibrate(i,j, i   , j-1, factor);
                equilibrate(i,j, i+1 , j  , factor);
                equilibrate(i,j, i   , j+1, factor);
                equilibrate(i,j, i-1 , j  , factor);
                // Corners
                /*
                  equilibrate(i,j, i-1 , j-1, 0.01 * factor);
                  equilibrate(i,j, i+1 , j-1, 0.01 * factor);
                  equilibrate(i,j, i+1 , j+1, 0.01 * factor);                
                  equilibrate(i,j, i-1 , j+1, 0.01 * factor);                
                */
            }     
        }
        
        for(var i = 1; i < w - 1; i++){
            for(var j = 1; j < h - 1; j++){
                // f = ma
                heights[i][j] += speeds[i][j];
            }
        }
        
        function equilibrate(i, j, k, l, factor){
            var deltaH = heights[i][j] - heights[k][l];
            
            speeds[i][j] -= factor * deltaH;
            speeds[k][l] += factor * deltaH;
        }        
    }
    
    function draw(){
        ctx.clearRect(0,0,w,h);
        var data = ctx.createImageData(w,h);
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var index = 4 * (j * w + i);
                // Set color
                var height =
                    parseInt((heights[i][j] - 0.5) * 255);
                var speed = 
                    parseInt(2*speeds[i][j] * 255);
                
                data.data[index + 0] = height;
                data.data[index + 1] = height < 0? -height:0;
                data.data[index + 2] = 0;
                data.data[index + 3] = 255;
            }
        }
        ctx.putImageData(data,0,0);
    }
}

function bidimentionnalArray(w, h, value){
    var arr = new Array(w);
    for(var i = 0; i < w; i++){
        arr[i] = new Array(h);
        for(var j = 0; j < h; j++){
            arr[i][j] = value;
        }
    }
    return arr;
}