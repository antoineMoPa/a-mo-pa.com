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