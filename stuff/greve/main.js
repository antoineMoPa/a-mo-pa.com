function qsa(sel){
    return document.querySelectorAll(sel);
}

var buttons = qsa("button");
var can = qsa("canvas")[0];
var ctx = can.getContext("2d");
var wat = false;

for(var i = 0; i < buttons.length; i++){
    var btn = buttons[i];
    activate_btn(btn);
}

function activate_btn(btn){
    btn.onmouseenter =
        btn.onclick = wtf;
}

function wtf(){
    if(wat){
        return;
    }
    wat = true;
    
    w = can.width = window.innerWidth;
    h = can.height = window.innerHeight;
    can.style.position = "absolute";
    can.style.top = 0;
    can.style.left = 0;
    can.style.zIndex = -1;
    ctx.fillStyle = "#eee";
    ctx.fillRect(0,0,w,h);

    buttons[0].style.position = "relative";
    buttons[1].style.position = "relative";

    setInterval(function(){
        for(var i = 0; i < 100; i++){
            ctx.fillStyle = randCol();
            ctx.fillRect(Math.floor(Math.random()*w/10)*10,Math.random()*h,10,Math.random()*40);
        }
    },30);
    
    function randCol(){
        var r = Math.floor(Math.random()*255);
        var g = Math.floor(Math.random()*255);
        var b = Math.floor(Math.random()*255);
        return "rgba("+r+","+g+","+b+",1)";
    }
    
    
    var elems = qsa("h1,h2,button");
    var letters = "abcdefghIJKlmnopqrsTUVWxYZ083M,¤¬|#".split("");
    setInterval(function(){
        for(var i = 0; i < elems.length; i++){
            var str = Array(elems[i].innerHTML.length);
            for(var j = 0; j < str.length; j++){
                str[j] = letters[Math.floor(Math.random()*letters.length)];
            }
            elems[i].innerHTML = str.join("");
        }
    },30)
}
                
