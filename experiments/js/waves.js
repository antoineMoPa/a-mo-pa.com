
initWaves()

function initWaves(){
    var canvas = document.querySelectorAll("canvas[name=waves]")[0];
    var playBtn = document.querySelectorAll("a.play")[0];
    var previousBtn = document.querySelectorAll("a.previous")[0];
    var nextBtn = document.querySelectorAll("a.next")[0];
    var toggleColorsBtn = document.querySelectorAll("a.toggle-colors")[0];
    var ctx = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 500;
    
    var w = canvas.width;
    var h = canvas.height;
    
    playBtn.onclick = play;
    previousBtn.onclick = previous;
    nextBtn.onclick = next;
    
    var experiments = [];
    
    experiments.push({
        name: "Young double slit",
        oscillators: function(){
            oscillators = [];
            oscillators.push({i:250,j:100,radius:80,amplitude:2, periodic: true, omega: 3});    
            return oscillators;
        },
        damping: 1, // 1 = no damping 0.1 = lot of damping
        factor: function(factor,i,j){
            if(j > h/2 && j < h/2+5 && !(i > 230 && i < 235|| i > 265 && i < 270)){
                factor *= 0;
            }
            return factor;
        }
    });
    
    experiments.push({
        name: "Interference of 2 punctual sources",
        oscillators: function(){
            oscillators = [];
            oscillators.push({i:245,j:100,radius:2,amplitude:2, periodic: true, omega: 5});
            oscillators.push({i:255,j:100,radius:2,amplitude:2, periodic: true, omega: 5});
            return oscillators;
        },
        damping: 0.99,
        factor: function(factor,i,j){
            return factor;
        }
    });    

    
    experiments.push({
        name: "Circular wall",
        oscillators: function(){
            oscillators = [];
            oscillators.push({i:w/2,j:h/2,radius:10,amplitude:2, periodic: true, omega: 3});
            return oscillators;
        },
        damping: 0.99,
        factor: function(factor,i,j){
            if(d(i,j,w/2,h/2) > 80){
                factor = 0;
            }
            return factor;
        }
    });
    
    experiments.push({
        name: "Diffraction network",
        oscillators: function(){
            oscillators = [];
            oscillators.push({i:250,j:100,radius:80,amplitude:2, periodic: true, omega: 3});    
            return oscillators;
        },
        damping: 0.99,
        factor: function(factor,i,j){
            if(j > 180 && j < 185 && !(i%20 < 10)){
                factor = 0;
            }            
            return factor;
        }
    });    

    experiments.push({
        name: "Source moving in a circle",
        oscillators: function(){
            oscillators = [];
            var xMoving = function(time){return 250+Math.cos(time)*100;};
            var yMoving = function(time){return 250+Math.sin(time)*100;};
            oscillators.push({i:xMoving,j:yMoving,radius:3,amplitude:4, periodic: true, omega: 5});            
            return oscillators;
        },
        damping: 0.99,
        factor: function(factor,i,j){
            return factor;
        }
    });    

    experiments.push({
        name: "Source moving linearly",
        oscillators: function(){
            oscillators = [];
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
            return oscillators;
        },
        damping: 0.99,
        factor: function(factor,i,j){
            return factor;
        }
    });    

    experiments.push({
        name: "Rain",
        oscillators: function(){
            oscillators = [];
            var radius = 4;
            var xRain = function(time){return Math.random()*(w - 2 * radius) + radius;}
            var yRain = function(time){return Math.random()*(h - 2 * radius) + radius;}
            oscillators.push({i:xRain,j:yRain,radius:3,amplitude:4, periodic: false});
                return oscillators;
        },
        damping: 0.8,
        factor: function(factor,i,j){            
            return factor;
        }
    });    
    
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
    
    var currentExperiment = 0;
    
    function previous(){
        currentExperiment--;
        if(currentExperiment < 0){
            currentExperiment = experiments.length;
        }
        goToExperiment(currentExperiment);
    };
    
    function next(){
        currentExperiment++;
        if(currentExperiment >= experiments.length){
            currentExperiment = 0;
        }
        goToExperiment(currentExperiment);
    };
    
    var heights;
    var speeds;
    var interval;
    var time;
    var damping;    
    var oscillators;
    var experiment;
    
    var HEIGHT = -1;
    var SPEED = -2;
    var colorsSetting;
    var colorsMultipliers;
    
    var colorsSettings = [];
    var currentColorsSettings = 0;
    
    colorsSettings.push({
        colors: [HEIGHT,HEIGHT,HEIGHT,255],
        multipliers: [1,1,1,1],
        info: "black = height of 0<br> white = height of 1"
    });
    
    colorsSettings.push({
        colors: [HEIGHT,SPEED,HEIGHT,255],
        multipliers: [10,10,10,1],
        info: "red,blue = height * 10<br> green = speed * 10"
    });
    
    colorsSettings.push({
        colors: [SPEED,SPEED,HEIGHT,255],
        multipliers: [1,1,1,1],
        info: "red = speed<br>green = speed<br>blue = height"
    });    
    
    toggleColorsBtn.onclick = function(){
        currentColorsSettings++;
        if(currentColorsSettings >= colorsSettings.length){
            currentColorsSettings = 0;
        }
        updateColorsInfo();
	draw();
    }
    
    function updateColorsInfo(){
        document.querySelectorAll("p.colors-info")[0].innerHTML 
            = colorsSettings[currentColorsSettings].info;
    }
    
    goToExperiment(0);
    updateColorsInfo();
    
    function goToExperiment(num){
        experiment = experiments[num];
        heights = bidimentionnalArray(w, h, 0.5);
        speeds = bidimentionnalArray(w, h, 0);
        interval = 0.2;
        time = 0;
        damping = experiment.damping;
        oscillators = experiment.oscillators()
        oscillate(0);
        document.querySelectorAll(".experiment-title h1")[0].innerHTML = experiment.name;
        draw();        
    }
    
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
                typeof(oscillators[i].i) == 'function'? 
                    oscillators[i].i(time): 
                    oscillators[i].i,
                typeof(oscillators[i].j) == 'function'?
                    oscillators[i].j(time):
                    oscillators[i].j,
                typeof(oscillators[i].radius) == 'function'? 
                    oscillators[i].radius(time): 
                    oscillators[i].radius,
                oscillators[i].periodic == false? 
                    oscillators[i].amplitude: 
                    Math.sin(oscillators[i].omega * time) * oscillators[i].amplitude
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
            var factor = experiment.factor(factor,i,j);
            speeds[i][j] -= factor * deltaH;            
            speeds[k][l] += factor * deltaH;
        }        
    }
    
    
    
    function draw(){
        ctx.clearRect(0,0,w,h);
        var data = ctx.createImageData(w,h);
        var colSet = colorsSettings[currentColorsSettings].colors;
        var colorsMultipliers = colorsSettings[currentColorsSettings].multipliers;

        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var index = 4 * (j * w + i);
                // Set color
                var height =
                    parseInt((heights[i][j]) * 255);
                var speed = 
                    parseInt(20*speeds[i][j] * 255);
                
                for(var k = 0; k < 4; k++){
                    if(colSet[k] == HEIGHT){
                        data.data[index + k] = height;
                    } else if(colSet[k] == SPEED){
                        data.data[index + k] = speed;
                    } else {
                        data.data[index + k] = colSet[k];
                    }                    
                    data.data[index + k] *= colorsMultipliers[k];
                }
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
