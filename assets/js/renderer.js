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
    
    replaceTris();
    
    container.onclick = function(){
        container.querySelectorAll("h1")[0].style.opacity = 0;
    }
    container.onmouseenter = start;
    container.onmouseleave = function(){
        clearInterval(interval);
    }
        
    function replaceTris(){
        var date = new Date().getTime();
        
        var sizeX = 50 + parseInt(Math.cos(date/5000) * 50);
        var sizeZ = 20 + parseInt(Math.cos(date/2000) * 20);

        
        renderer.tris = [];
        for(var i = 0; i < sizeX; i++){
            for(var j = 0; j < sizeZ; j++){
                var yOffset = 
                    1 *
                    Math.sin( 
                        x / c.width * sizeX + 3 * i  * 180 + date/20000
                    )
                    + (6 - 10 * y / c.height);
                var zYOffset = Math.cos( 3 * j + date / 2000);
                
                renderer.tris.push(
                        -sizeX/3 - Math.sin(date/8000)/3 + i + j / 3, -0.4 + yOffset + zYOffset, 4 + 0.3*Math.pow(j,1.8)+10,
                        -sizeX/3 + Math.sin(date/8000)*3 + i + j / 3, 0 + yOffset, 5 + zYOffset + 0.3*Math.pow(j,1.8)+10,
                        -sizeX/3 + Math.sin(date/8000)/3 + i + j / 3, -1 + yOffset + zYOffset, 4 + 0.3*Math.pow(j,1.8)+10
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
    this.ctx.fillStyle = "rgba(255,255,255,0.2)";
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

    for(var i = 0; i < this.tris.length; i+=9){
        this.ctx.beginPath();
        
        var date = new Date().getTime();
        var red = parseInt((Math.abs(Math.sin(date/3405))*255));
        var green = parseInt((Math.abs(Math.sin(date/2230))*255));
        var blue = parseInt((Math.abs(Math.sin(date/900))*255));

        //this.ctx.fillStyle = this.materials[this.tris[i+9]];
        this.ctx.fillStyle = "rgba("+red+","+green+","+blue+",0.2)";
        this.ctx.moveTo.apply(this.ctx,this.pointToCamera(this.tris.slice(i,i+3)));
        this.ctx.lineTo.apply(this.ctx,this.pointToCamera(this.tris.slice(i+3,i+6)));
        this.ctx.lineTo.apply(this.ctx,this.pointToCamera(this.tris.slice(i+6,i+9)));
        
        this.ctx.closePath();
        this.ctx.fill();
    }
};