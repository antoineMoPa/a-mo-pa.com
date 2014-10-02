$.ready(function(){
    var sound = new Sound();
    
    sound.initEditor();
    
    $("a.play-sound-button").on('click',function(){
        sound.playSound();
    });
    
    $(".clear-log").on("click",function(){
        $(".log").html("");
    });
    
    $(".use-sample-code").on("click",function(){
        sound.editor.setValue(
            $(".sample-code").text()
        );
    })
    
    initArrayDrawer();
});

function Sound(){
    this.log = $(".log");
    this.code = $("#sound-code");
    
    var sound = this;
    this.editor = CodeMirror.fromTextArea(this.code.elements[0],{
        mode: "text/javascript",
        lineWrapping: "true",
        lineNumbers: "true",
        extraKeys: {
            "Shift-Enter": function(){
                sound.playSound();
            }
        }
    });
    $(".run-code").on("click",function(){
        sound.playSound();
    });
}

Sound.prototype.initEditor = function(){    

}

Sound.prototype.playSound = function(){
    try{
        this.print(
            eval(
                this.editor.getValue()
            )
        );
    } catch (e){
        this.print(e.message + "\n");
    }
}

Sound.prototype.print = function(message){
    this.log.append(
        message
    );
    this.log.elements[0].scrollTop = 
        this.log.elements[0].scrollHeight;
}

function initArrayDrawer(){
    var canvas = document
        .querySelectorAll("canvas.array-drawer")[0];
    
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    
    var array = [];
    
    resetSin();
    
    redraw();
    
    canvas.onmousemove = eventHandler;
    canvas.onmousedown = startDrag;
    canvas.onmouseup = stopDrag;
    
    var dragging = false;
    
    function startDrag(e){
        dragging = true;
        eventHandler(e)
    }
    function stopDrag(){
        dragging = false;
    }
    
    var timeout = null;
    var minTimeBetweenFrames = 33;
    
    var smoothness = 30;
    
    function eventHandler(e){
        var x = (e.pageX - canvas.offsetLeft) / canvas.width;
        var y = 1 - 2 * 
            (e.pageY - canvas.offsetTop) / 
            canvas.height;
        if(dragging){
            var index = parseInt(x*array.length);
            
            var i = index - smoothness;
            var diff;
            
            
            
            for(; i <= index + smoothness; i++){
                if(i < 0 || i > array.length){
                    continue;
                }
                diff = Math.abs(index - i);
                array[i] = ((smoothness-diff) * y +
                            (smoothness+diff) * array[i]) 
                    / (2 * smoothness);
            }
            
        }
        var time = new Date().getTime();
        
        if(timeout != null && time < minTimeBetweenFrames){
            clearTimeout(timeout);
        }
        timeout = setTimeout(function(){
            redraw();
            timeout = null;
            lastDraw = new Date().getTime();;
        },minTimeBetweenFrames);
        
    }
    
    
    function redraw(){
        ctx.fillStyle = "#fff";
        ctx.fillRect(0,0,width,height);
        for(var i = 0; i < array.length; i++){
            ctx.fillStyle = "#000";
            var yPos = height/2 - (height/2) * array[i];
            ctx.fillRect(i,yPos,1,height - yPos);
        }
        document
            .querySelectorAll(".array-drawer-content")[0]
            .innerHTML = array;
    }
    
    document.querySelectorAll(".reset-to-sin")[0]
        .onclick = function(){
            resetSin();
        }
    
    document.querySelectorAll(".reset-to-cos")[0]
        .onclick = function(){
            resetCos();
        }

    document.querySelectorAll(".reset-to-flat")[0]
        .onclick = function(){
            resetFlat();
        }
    
    function resetCos(){
        for(var i = 0; i < width; i++){
            array[i] = Math.cos(2*Math.PI*i/width);
        }
        redraw();
    }

    function resetSin(){
        for(var i = 0; i < width; i++){
            array[i] = Math.sin(2*Math.PI*i/width);
        }
        redraw();
    }
    
    function resetFlat(){
        for(var i = 0; i < width; i++){
            array[i] = 0;
        }
        redraw();
    }
}