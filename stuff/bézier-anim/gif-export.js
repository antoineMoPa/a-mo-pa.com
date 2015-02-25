var button = document
    .getElementById("convert-button"); 



var gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: "lib/gifjs/gif.worker.js"
});

var imported = window.localStorage.to_gif_export;

imported = JSON.parse(imported);

data = imported.data;

var images = [];

for(var i = 0; i < data.length; i++){
    var image = new Image();
    image.src = data[i];
    image.onload = imageLoaded;
    images.push(image);
}

var number_loaded = 0;
function imageLoaded(){
    number_loaded++;
    if(number_loaded == data.length){
        convert();
    }
}

function convert(){
    for(var i = 0; i < images.length; i++){    
        gif.addFrame(images[i],{delay: imported.delay});
    }
    gif.render();
    
    gif.on('finished',function(blob){
        var img = document.getElementById("result-img");
        img.src = URL.createObjectURL(blob);
    })
}
