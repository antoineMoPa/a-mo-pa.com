
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
    
    var heights = bidimentionnalArray(w, h, 0);
    var speeds = bidimentionnalArray(w, h, 0);
    var springConstant = 10000;
    var mass = 1;
    var interval = 0.2;
    
    initValue(150,100,100,1);
    
    draw();
    
    function initValue(i,j,radius,value){
        for(var k = i - radius; k < i + radius; k++){
            for(var l = j - radius; l < j + radius; l++){
                var dist = d(i,j,k,l);
                if(dist < radius){
                    heights[k][l] = value * (1 - dist / radius);
                }                
            }
        }
        function d(x1,y1,x2,y2){
            return Math.sqrt(Math.pow(y2-y1,2)+Math.pow(x2-x1,2));
        }
    }
    
    function iterate(){        
        var factor = 1/4;
        
        // equilibrate heights
        for(var i = 1; i < w - 1; i++){
            for(var j = 1; j < h - 1; j++){            
                equilibrate(i,j, i   , j-1, factor);
                equilibrate(i,j, i+1 , j  , factor);
                equilibrate(i,j, i   , j+1, factor);
                equilibrate(i,j, i-1 , j  , factor);
                // Corners
                /*equilibrate(i,j, i-1 , j-1, 0.01 * factor);
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
                var red =
                    Math.abs(
                        parseInt(heights[i][j] * 255)
                    );
                var green = 
                    Math.abs(
                        parseInt(30*speeds[i][j] * 255)
                    );
                data.data[index + 0] = red;
                data.data[index + 1] = green;
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