$ = function(selector){
    return document.querySelectorAll(selector);
}

initSlides();

function initSlides(){
    var slides = $("slide");
    var currentSlide;
    var height;
    var hiddenNodes = [];
    
    function resize(){
        currentSlide = 0;
        height = window.innerHeight;
        changeSlide();
        for(var i = 0; i < slides.length;i++){
            slides[i].style.height = height+"px";
        }
        
    };
    
    resize();
    window.onresize = resize;
    
    for(var i = 0; i < slides.length;i++){
            slides[i].onkeydown = next;
    }
    
    document.onkeydown = function(e){
        if(e.keyCode == 38){
            e.preventDefault();
            previous();
        }
        else if (e.keyCode == 40){
            e.preventDefault();
            next();
        }
        else if (e.keyCode == 39){
            unHide();
        }
        else if (e.keyCode == 37){
        }
        
    }
    
    document.onclick = unHide;
    
    function next(){
        currentSlide++;
        currentSlide = Math.abs(currentSlide % slides.length);
        changeSlide();
    }
    function previous(){
        currentSlide--;
        if(currentSlide == -1){
            currentSlide = slides.length -1;
        }
        currentSlide = Math.abs(currentSlide % slides.length);
        changeSlide(true);
    }
    function unHide(){
        if(hiddenNodes.length > 0){
            hiddenNodes[0].style.opacity = 1;
            hiddenNodes.splice(0,1);
        }
        else{
            next();
        }
    }
    function changeSlide(nohide){
        var nohide = nohide || false

        for(var i in hiddenNodes){
            hiddenNodes[i].style.opacity = 1;
        }
        hiddenNodes = [];
        smoothScroll(slides[currentSlide].offsetTop);
        if(!nohide){
            recursiveHide(slides[currentSlide]);
        }
    }
    
    function recursiveHide(element){
        for(var i in element.childNodes){
            var node = element.childNodes[i];
            if(/hide/.test(node.className)){
                hiddenNodes.push(node);
                node.style.opacity = 0;
            }
            recursiveHide(node);
        }
    }
    
    function smoothScroll(pos){
        var completion = 0;
        var steps = 20;
        var timeInterval = 15;
        var initialY = window.scrollY;
        var interval = setInterval(function(){
            completion++;
            if(completion == steps){
                window.scrollTo(0,pos);
                clearInterval(interval);
            } else {
                window.scrollTo(
                    0,
                    initialY+
                        completion/steps * (pos - initialY)
                );
            }
        },timeInterval);
    }
}

