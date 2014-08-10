$.ready(function(){
    var c = document.querySelectorAll(".renderer-canvas")[0];
    var renderer = new Renderer(c);
    
    c.width = document.body.clientWidth;
    c.height = 400;
    
    adaptSize(c);
    $(window).on("resize",function(){
        adaptSize(c);
    });
    
    function adaptSize(canvas){
        width = $("body").width();
        height = window.innerHeight;
        
        canvas.width = width;
        canvas.height = height;
    }
        
    
    //x,y,z,materialid
    renderer.objects = {};
    
    renderer.materials = [
        "rgba(55,10,50,0.9)",
        "rgba(0,55,50,0.9)"
    ];
   
    var lastRender = new Date().getTime();
    var x = c.width / 2;
    var y = c.height;
    
    
    var container = document.querySelectorAll(".title-canvas-container")[0];
    container.onmousemove = c.onmousemove = function(e){
        x = 0.7 * e.clientX;
        y = e.clientY;
    }
    
    var interval;
    
    function start(){
        interval = setInterval(replaceTris,80);
    }
    
    container.onclick = function(){
        container.querySelectorAll("h1")[0].style.opacity = 0;
    }
    container.onmouseenter = start;
    container.onmouseleave = function(){
        clearInterval(interval);
    }
    
    var sizeX = 30;
    var sizeZ = 30;
    
    function replaceTris(){
        var date = new Date().getTime();
        renderer.tris = [];
        for(var i = 0; i < sizeX; i++){
            for(var j = 0; j < sizeZ; j++){
                var yOffset = 
                    1 *
                    Math.sin( 
                        x / c.width * sizeX + 3 * i  * 180
                    )
                    + (6 - 10 * y / c.height);
                var zYOffset = Math.cos( 3 * j + date % 20000 / 500);
                
                renderer.tris.push(
                        -sizeX/3 + i + j / 3, -0.4 + yOffset + zYOffset, 4 + j * 1.2,
                        -sizeX/3 + i + j / 3, 0 + yOffset, 5 + zYOffset + j * 1.3,
                        -sizeX/3 + i + j / 3, -1 + yOffset + zYOffset, 4 + j * 1.3
                );
            }   
        }
        renderer.renderFrame();
    }
    for(var i = 0; i < 10; i++){
        replaceTris();
    }
});

function Object3D(vertexes,materials){
    
}

function Renderer(canvas){
    // Quantity that represents 1 height of the camera CCD
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.tris = [];
}

Renderer.prototype.addQuad = function(point1,point2,point3,point4){
    this.tris.push.apply(
        this.tris,
        point1.concat(point2).concat(point4)
    );
    this.tris.push.apply(
        this.tris,
        point2.concat(point3).concat(point4)
    );

}

Renderer.prototype.pointToCamera = function(points){
    // To do: ensure ints stay int
    // Invert Y axis, scale X and Y axis
    
    var scale = 1 / (0.7 * points[2]);
    
    var offsetX = (this.canvas.height - scale * this.canvas.height) / 2;
    var offsetY = (this.canvas.height - scale * this.canvas.height) / 2;

    return [
        points[0] * scale * this.canvas.height + offsetX,
        (1 - points[1]) * scale * this.canvas.height + offsetY
    ]
};

Renderer.prototype.renderFrame = function(){
    this.ctx.fillStyle = "rgba(255,255,255,0.3)";
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

    for(var i = 0; i < this.tris.length; i+=9){
        this.ctx.beginPath();
        
        //this.ctx.fillStyle = this.materials[this.tris[i+9]];
        this.ctx.fillStyle = "rgba(150,0,0,0.3)";
        this.ctx.moveTo.apply(this.ctx,this.pointToCamera(this.tris.slice(i,i+3)));
        this.ctx.lineTo.apply(this.ctx,this.pointToCamera(this.tris.slice(i+3,i+6)));
        this.ctx.lineTo.apply(this.ctx,this.pointToCamera(this.tris.slice(i+6,i+9)));
        
        this.ctx.closePath();
        this.ctx.fill();
    }
};