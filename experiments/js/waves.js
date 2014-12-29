
initWaves()


function initWaves(){
    var canvas = document.querySelectorAll("canvas[name=waves]")[0];
    var animateBtn = document.querySelectorAll("a.animate")[0];
    var pauseBtn = document.querySelectorAll("a.pause")[0];
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    
    var potentials = bidimentionnalArray(w, h, 0);
    var momentums = bidimentionnalArray(w, h, 0);
    
    var animationImages = [];
    
    initValue(150,100,40);
    initValue(250,100,40);
    draw();
    
    function initValue(i,j,value){
        potentials[i][j] = value;
    }
        
    animateBtn.onclick = animate;
    pauseBtn.onclick = pause;
    
    var animationInterval = null;
    
    function animate(){        
        animationInterval = setInterval(function(){
            iterate();
            draw();
        },100);        
    }
    
    function pause(){
        if(animationInterval != null){
            clearInterval(animationInterval);
            animationInterval = null;
            this.innerHTML = "Play";
        } else {            
            this.innerHTML = "Pause";
            animate();
        }
    }
    
    /*
      
      2 things are happening here:
      
      1- potential is being shared with neighboors
      2- each particle has its momentum
      
     */
    
    function iterate(){
        var factor = 0.1;
                
        // equilibrate potentials
        for(var i = 1; i < w - 1; i++){
            for(var j = 1; j < h - 1; j++){                
                // take potentials into account
                //equilibrate(i,j, i-1 , j-1, factor);
                equilibrate(i,j, i   , j-1, factor);
                //equilibrate(i,j, i+1 , j-1, factor);
                equilibrate(i,j, i+1 , j  , factor);
                                            
                //equilibrate(i,j, i+1 , j+1, factor);
                equilibrate(i,j, i   , j+1, factor);
                //equilibrate(i,j, i-1 , j+1, factor);
                equilibrate(i,j, i-1 , j  , factor);                
            }            
        }
        
        for(var i = 1; i < w - 1; i++){
            for(var j = 1; j < h - 1; j++){                
                potentials[i][j] += momentums[i][j];
            }
        }
        
        function equilibrate(i, j, k, l, factor){
            var new1 = 
                (1 - factor) * potentials[i][j] + 
                factor * potentials[k][l];
            var new2 = 
                (1 - factor) * potentials[k][l] + 
                factor * potentials[i][j];
            
            momentums[i][j] += new1 - potentials[i][j];
            momentums[k][l] += new2 - potentials[k][l];
        }        
    }
    
    function draw(){
        ctx.clearRect(0,0,w,h);
        var data = ctx.createImageData(w,h);
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){                
                var index = 4 * (j * w + i);
                // Set color
                var red = green = blue = Math.abs(
                    parseInt(
                        1-(Math.pow(1-(potentials[i][j] / 10),40))
                            * 255)
                );                
                
                data.data[index] = red;                
                data.data[index + 1] = red;
                data.data[index + 2] = red;
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