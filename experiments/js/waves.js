
initWaves()


function initWaves(){
    var canvas = document.querySelectorAll("canvas[name=waves]")[0];
    var playBtn = document.querySelectorAll("a.play")[0];
    var ctx = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 500;
    
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
    var damping = 1; // 1 = no damping 0.1 = lot of damping
    
    var oscillators = [];
    
    oscillators.push({i:w/2,j:h/2,radius:10,amplitude:2, periodic: true, omega: 3});
    
    // young double slit
    //oscillators.push({i:250,j:100,radius:80,amplitude:2, periodic: true, omega: 3});
    
    // young-like interference without wall
    //oscillators.push({i:245,j:100,radius:2,amplitude:2, periodic: true, omega: 5});
    //oscillators.push({i:255,j:100,radius:2,amplitude:2, periodic: true, omega: 5});
    
    // moving source
    //var xMoving = function(time){return 250+Math.cos(time)*100;}
    //var yMoving = function(time){return 250+Math.sin(time)*100;}
    //oscillators.push({i:xMoving,j:yMoving,radius:3,amplitude:4, periodic: true, omega: 5});
    
    // rain
    //var radius = 4;
    //var xRain = function(time){return Math.random()*(w - 2 * radius) + radius;}
    //var yRain = function(time){return Math.random()*(h - 2 * radius) + radius;}
    //oscillators.push({i:xRain,j:yRain,radius:3,amplitude:4, periodic: false});

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
        
        // damp speed of borders
        for(var i = 0; i < w; i++){
            speeds[i][0] *= damping;
            speeds[i][h-1] *= damping;
        }
        
        // damp speed of borders
        for(var j = 0; j < h; j++){
            speeds[0][j] *= damping;
            speeds[w-1][j] *= damping;
        }

        
        for(var i = 1; i < w - 1; i++){
            for(var j = 1; j < h - 1; j++){
                // damp speed
                speeds[i][j] *= damping;
                heights[i][j] += speeds[i][j];                
            }
        }
        
        function equilibrate(i, j, k, l, factor){
            var deltaH = heights[i][j] - heights[k][l];
            // young
            /*if(j > h/2 && j < h/2+5 && !(i > 230 && i < 235|| i > 265 && i < 270)){
                factor *= 0;
            }*/
            // Diffraction network
            /*if(j > 180 && j < 185 && !(i%20 < 10)){
                factor = 0;
            }*/
            //circular wall
            if(d(i,j,w/2,h/2) > 80){
                factor = 0;
            }
            
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
                    parseInt((heights[i][j]) * 255);
                var speed = 
                    parseInt(10*speeds[i][j] * 255);
                
                // red
                data.data[index + 0] = height;
                // green
                data.data[index + 1] = height;
                // blue
                data.data[index + 2] = height;
                // opacity
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

function d(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(y2-y1,2)+Math.pow(x2-x1,2));
}
