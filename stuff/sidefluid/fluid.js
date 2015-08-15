var waves = initWaves();
waves.play();

function initWaves(){
    var exports = {};
    var canvas = document.querySelectorAll("canvas[name='my-damn-canvas']")[0];
    var ctx = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 500;

    var w = canvas.width;
    var h = canvas.height;

    var experiments = [];
    
    var animationInterval = null;

    function animate(){
        animationInterval = setInterval(function(){
            iterate();
            draw();
        },200);
    }

    exports.play = play;
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

    var pressures;
    var interval;
    var time;
    var damping;
    var oscillators;
    var experiment;

    var PRESSURE = -1;
    var SPEED = -2;
    var colorsSetting;
    var colorsMultipliers;

    var colorsSettings = [];
    var currentColorsSettings = 0;

    colorsSettings.push({
        colors: [PRESSURE,PRESSURE,PRESSURE,255],
        multipliers: [1,1,1,1],
        info: "black = pressure of 0<br> white = pressure of 1"
    });

    colorsSettings.push({
        colors: [PRESSURE,SPEED,PRESSURE,255],
        multipliers: [10,10,10,1],
        info: "red,blue = pressure * 10<br> green = speed * 10"
    });

    colorsSettings.push({
        colors: [SPEED,SPEED,PRESSURE,255],
        multipliers: [1,1,1,1],
        info: "red = speed<br>green = speed<br>blue = pressure"
    });

    goToExperiment(0);
    
    function goToExperiment(num){
        experiment = experiments[num];
        pressures = bidimentionnalArray(w, h, 0.5);
	fluxes = bidimentionnalArray(w, h, 0);
	spins = bidimentionnalArray(w, h, 0.5);
	spin_origins = bidimentionnalArray(
	    w,
	    h,
	    [0,0] // origin of canvas
	);

	for(var i = 0; i < w; i++){
	    for(var j = 0; j < h; j++){
		spin_origins[i][j][0] = i + 40;
		spin_origins[i][j][1] = j;
	    }
	}
	
        interval = 0.2;
        time = 0;
        draw();
    }

    point(250,250,10,0.5);
    //point(50,250,10,-0.5);
    
    function point(i,j,radius,value){
        var i = parseInt(i);
        var j = parseInt(j);
        for(var k = i - radius; k < i + radius; k++){
            for(var l = j - radius; l < j + radius; l++){
                var dist = d(i,j,k,l);
                if(dist < radius){
		    pressures[k][l] += value * (1-dist / radius);
		}
            }
        }
    }

    var last_mouse_x = canvas.width / 2;
    var last_mouse_y = canvas.height / 2;
    
    canvas.onmousemove = function(e){
	last_mouse_x = e.clientX;
	last_mouse_y = e.clientY;
    };
    
    canvas.onmousedown = function(e){
	console.log("Mouse: "+e.clientX+", "+e.clientY+" spin: ");
	console.log(spin_origins[e.clientX][e.clientY]);
	console.log("Pressure: "+pressures[e.clientX][e.clientY]);
    };
    
    function iterate(){
        var factor = 1/4;

        time += 0.04;

	for(var i = 1; i < h - 1; i++){
	    for(var j = 1; j < w - 1; j++){
		fluxes[i][j] = 0;
	    }
	}
	
	for(var i = 1; i < h - 1; i++){
	    for(var j = 1 + (i % 2); j < w - 1; j++){
		var dy = spin_origins[i][j][0] - i;
		var dx = spin_origins[i][j][1] - j;
		var theta = Math.atan(dy/dx) + Math.PI / 2;
		
		if(dx > 0 && dy < 0){
		    theta = 2*Math.PI - theta;
		}
		if(dx < 0 && dy > 0){
		    theta = Math.PI - theta;
		}
		if(dx < 0 && dy < 0){
		    theta = Math.PI + theta;
		}

		theta += Math.PI / 2;
		
		var f1, f2, f3, f4;

		f1 = - Math.sin(theta);
		f2 = Math.cos(theta);
		f3 = - f1;
		f4 = - f2;
		
		var k = 0.1;
		spin_origins[i][j][0] = (1-k) * spin_origins[i][j][0] +
		    k * 0.25 * (
			spin_origins[i-1][j][0] +
			    spin_origins[i+1][j][0] +
			    spin_origins[i][j-1][0] +
			    spin_origins[i][j+1][0]
		    );
		spin_origins[i][j][1] = (1-k) * spin_origins[i][j][1] +
		    k * 0.25 * (
			spin_origins[i-1][j][1] +
			    spin_origins[i+1][j][1] +
			    spin_origins[i][j-1][1] +
			    spin_origins[i][j+1][1]
		    );
		
		d1 = (1-f1) * pressures[i][j] + (f1) * pressures[i-1][j];
		d2 = (1-f2) * pressures[i][j] + (f2) * pressures[i][j+1];
		d3 = (1-f3) * pressures[i][j] + (f3) * pressures[i+1][j];
		d4 = (1-f4) * pressures[i][j] + (f4) * pressures[i][j-1];
		pressures[i-1][j] += 0.1 * d1;
		pressures[i][j+1] += 0.1 * d2;
		pressures[i+1][j] += 0.1 * d3;
		pressures[i][j-1] += 0.1 * d4;
		pressures[i][j] -= 0.1 * (d1 + d2 + d3 + d4);
	    }
	}
	
	for(var i = 1; i < h - 1; i++){
            for(var j = 1; j < w - 1; j++){
		pressures[i][j] += fluxes[i][j];
		if(isNaN(pressures[i][j])){
		    pressures[i][j] = 1;
		}
	    }
        }
    }
    
    function draw(){
        ctx.clearRect(0,0,w,h);
        var data = ctx.createImageData(w,h);
        var colSet = colorsSettings[currentColorsSettings]
	    .colors;
        var colorsMultipliers = colorsSettings[currentColorsSettings].multipliers;
	
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var index = 4 * (j * w + i);
                // Set color
                var pressure =
                    parseInt((pressures[i][j]) * 255);
                var spin =
                    parseInt(spins[i][j] * 255);

                for(var k = 0; k < 4; k++){
                    if(colSet[k] == PRESSURE){
                        data.data[index + k] = pressure;
                    } else if(colSet[k] == SPEED){
                        data.data[index + k] = spin;
                    } else {
                        data.data[index + k] = colSet[k];
                    }
                    data.data[index + k] *= colorsMultipliers[k];
                }
            }
        }
        ctx.putImageData(data,0,0);
    }
    return exports;
}

function bidimentionnalArray(w, h, value){
    var arr = new Array(w);
    for(var i = 0; i < w; i++){
        arr[i] = new Array(h);
        for(var j = 0; j < h; j++){
	    if(Array.isArray(value)){
		arr[i][j] = value.slice(0);
	    } else {
		arr[i][j] = value;
	    }
        }
    }
    return arr;
}

function d(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(y2-y1,2)+Math.pow(x2-x1,2));
}
