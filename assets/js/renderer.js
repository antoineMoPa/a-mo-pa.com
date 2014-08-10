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

    renderer.addQuad(
        [0,0,5],
        [0,1,5],
        [1,1,5],
        [1,0,6]
    );
    renderer.addQuad(
        [0,0,5],
        [0,0,2],
        [1,0,2],
        [1,0,6]
    );
    renderer.addQuad(
        [0,0,5],
        [0,0,2],
        [1,0,2],
        [1,0,6]
    );
    
    renderer.materials = [
        "rgba(55,10,50,0.9)",
        "rgba(0,55,50,0.9)"
    ];
    
    renderer.renderFrame();
});

function Object3D = function(vertexes,materials){
    
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
    
    var scale = 1 / (0.6 * points[2]);
    
    var offsetX = (this.canvas.height - scale * this.canvas.height) / 2;
    var offsetY = (this.canvas.height - scale * this.canvas.height) / 2;

    return [
        points[0] * scale * this.canvas.height + offsetX,
        (1 - points[1]) * scale * this.canvas.height + offsetY
    ]
};

Renderer.prototype.renderFrame = function(){
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

    for(var i = 0; i < this.tris.length; i+=9){
        this.ctx.beginPath();
        
        //this.ctx.fillStyle = this.materials[this.tris[i+9]];
        this.ctx.fillStyle = this.materials[0];
        this.ctx.moveTo.apply(this.ctx,this.pointToCamera(this.tris.slice(i,i+3)));
        this.ctx.lineTo.apply(this.ctx,this.pointToCamera(this.tris.slice(i+3,i+6)));
        this.ctx.lineTo.apply(this.ctx,this.pointToCamera(this.tris.slice(i+6,i+9)));
        
        this.ctx.closePath();
        this.ctx.fill();
    }
};