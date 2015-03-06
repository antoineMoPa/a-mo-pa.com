var info = document
    .querySelectorAll(".rendering-info")[0];

chain = [
    ["mandelbrot",0,0],
    ["julia",0.001,0.8],
    ["julia",-0.1,0.8],
    ["julia",0.3,-0.0001],
    ["julia",0.4,-0.0001],
    ["julia",0.5,-0.0001],
    ["julia",0.3,-0.03],
    ["julia",0.5,0.3]
];

//fractal(300,"julia",0.5,0.3);

var chainI = 0;
runChain();
function runChain(){
    if(chainI >= chain.length){
        chainI = 0;
    }
    el = chain[chainI];
    smoothFractalAppear(el[0],runChain,el[1],el[2]);
    chainI++;
}


function smoothFractalAppear(fractalName,callback,cR,cI){
    info.innerHTML = "Rendering "+fractalName+" ...";
    fractal(10,fractalName,cR,cI);
    setTimeout(function(){
        fractal(40,fractalName,cR,cI);
        info.innerHTML = "Rendering "+fractalName+" ......";
        setTimeout(function(){
            fractal(60,fractalName,cR,cI);
            setTimeout(function(){            
                fractal(100,fractalName,cR,cI);
                info.innerHTML = "Rendering "+fractalName+" ...........";
                setTimeout(function(){
                    info.innerHTML = "Done";
                    fractal(600,fractalName,cR,cI);
                    setTimeout(function(){
                        callback();
                    },4000)
                },300)
            },300)        
        },500)
    },500)
}

function fractal(size,fractalName,cR,cI){
    var can = document
        .querySelectorAll("canvas[name=potato]")[0];
    ctx = can.getContext("2d");

    w = can.width = size;
    h = can.height = size;

    can.style.width = "100%";
    can.style.height = "100%";
    
    var cReal = [];
    var cIm = [];
    
    var zReal = [];
    var zIm = [];
    var set = [];
    
    function clear(){
        for(var i = 0; i < w; i++){
            cReal[i] = new Array(h);
            cIm[i] = new Array(h);
            zReal[i] = new Array(h);
            zIm[i] = new Array(h);
            set[i] = new Array(h);
        }
        if(fractalName == "mandelbrot"){
            for(var i = 0; i < w; i++){
                for(var j = 0; j < h; j++){
                    zReal[i][j] = 0;
                    zIm[i][j] = 0;
                    set[i][j] = 0;
                    cReal[i][j] = 2 * (i/w - 0.7) - 0.2
                    cIm[i][j] = 2 * (j/w - 0.5)
                }
            }
        } else if(fractalName == "julia"){
            for(var i = 0; i < w; i++){
                for(var j = 0; j < h; j++){
                    zReal[i][j] = 4 * (i/w - 0.5);
                    zIm[i][j] = 4 * (j/w - 0.5);
                    set[i][j] = 0;
                    cReal[i][j] = cR;
                    cIm[i][j] = cI;
                }
            }
        }
    }
    
    var iterations = 20;
    
    iterate();
    draw();
    
    
    function iterate(){
        var limit = 10;
        clear();
        for(var step = 0; step < iterations; step++){
            for(var i = 0; i < w; i++){
                for(var j = 0; j < h; j++){
                    // prevent overflow
                    if(zReal[i][j] > limit * 2 || zIm[i][j] > limit * 2){
                        zReal[i][j] = 0;
                        zIm[i][j] = 0;
                    }

                    // z = z**2 + c
                    var a = zReal[i][j]
                    var b = zIm[i][j]
                    // square complex number
                    var aTemp = (Math.pow(a,2) - Math.pow(b,2))
                        b = 2 * b * a
                    a = aTemp
                        //addition
                    zReal[i][j] = a + cReal[i][j]
                    zIm[i][j] = b + cIm[i][j]                
                    modulus = Math.sqrt(
                        Math.pow(zReal[i][j],2) +
                            Math.pow(zIm[i][j],2)
                    )                    
                    if(set[i][j] == 0 && modulus > limit){
                        set[i][j] = step;
                    }
                }
            }
        }
    }
    
    function draw(){
        ctx.clearRect(0,0,w,h);
        var data = ctx.createImageData(w,h);
        for(var i = 0; i < w; i++){
            for(var j = 0; j < h; j++){
                var index = 4 * (j * w + i);
                if(set[i][j] == 0){
                    val = 255;
                } else {
                    val = parseInt(set[i][j]/iterations * 255);
                }            
                data.data[index + 0] = 0;
                data.data[index + 1] = 0;
                data.data[index + 2] = val;
                data.data[index + 3] = 255
            }
        }
        ctx.putImageData(data,0,0);
    }
}
