
initWaves()


function initWaves(){
    var canvas = document.querySelectorAll("canvas[name=waves]")[0];
    var btn = document.querySelectorAll("a.iterate")[0];
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    
    var potentials = bidimentionnalArray(w, h, 0.5);
    var momentums = bidimentionnalArray(w, h, 0);
    
    initValue(250,250,100);
    
    function initValue(i,j,value){
        potentials[i][j] = value;
    }
    
    btn.onclick = function(){
        for(var i = 0; i < 30; i++){        
            iterate();        
        }
        draw();        
    };    
    
    draw();

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
                equilibrate(i,j, i-1 , j-1, factor);
                equilibrate(i,j, i   , j-1, factor);
                equilibrate(i,j, i+1 , j-1, factor);
                equilibrate(i,j, i+1 , j  , factor);
                                            
                equilibrate(i,j, i+1 , j+1, factor);
                equilibrate(i,j, i   , j+1, factor);
                equilibrate(i,j, i-1 , j+1, factor);
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
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                // Set color
                var red = Math.abs(parseInt(momentums[i][j] * 255)) % 255;
                var blue = Math.abs(parseInt(potentials[i][j] * 255)) % 255;
                
                ctx.fillStyle = "rgba("+red+",0,"+blue+",1)";
                ctx.fillRect(i,j,1,1);
            }
        }
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