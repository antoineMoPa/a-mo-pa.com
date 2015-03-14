init();


function init(){

    function QSA(sel){
        return document.querySelectorAll(sel);
    }

    var canvas = QSA("canvas[name='potato']")[0];
    var textarea = QSA("textarea[name='code']")[0];
    var button = QSA("button[name='go']")[0];
    
    textarea.value = localStorage.canvas2gifcode || 
        ['// tutorial',
         '',
         'window.delay = 100;',
         '',
         '// fill everything',
         'ctx.fillStyle = "#000";',
         'ctx.fillRect(0,0,300,300);',
         '',
         '// draw square',
         'ctx.fillStyle = "#fff";',
         'ctx.fillRect(5,5,10,10);',
         '',
         '// this goes to the gif',
         'addFrame();',
         '',
         'ctx.fillStyle = "#000";',
         'ctx.fillRect(0,0,300,300)',
         '',
         '',
         'ctx.fillStyle = "#fff";',
         'ctx.fillRect(10,10,10,10);',
         'addFrame();',
         '',
         '// this renders the gif',
         '// if it does not work, reload and try again!',
         'render();'].join("\n");
    
    adjust();
    window.onresize = adjust;
    
    function adjust(){
        textarea.style.height = window.innerHeight - 230 + "px";
    }
    
    var gif;

    init_gif();
    
    function init_gif(){
        gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript: "../lib/gifjs/gif.worker.js"
        });
    }
    
    function render(){
        gif.render();
    }
    
    gif.on('finished',function(blob){
        var img = document.getElementById("result-img");
        img.src = URL.createObjectURL(blob);
    })

    window.addFrame = addFrame;
    window.render = render;
    window.ctx = canvas.getContext("2d");
    window.can = canvas;
    window.delay = 33;
    
    function addFrame(){
        gif.addFrame(window.can,{copy:true,delay: window.delay});
    }
    
    function go(){
        eval(textarea.value);
    }

    textarea.onkeydown = function(e){
        localStorage.canvas2gifcode = textarea.value;
        if(e.keyCode == 13){
            if(e.shiftKey){
                e.preventDefault();
                go();
            }
        }
    }
    
    button.onclick = go;
}
