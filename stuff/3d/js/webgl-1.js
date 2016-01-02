/*
  Resources: 
  
  * https://gist.github.com/mbostock/5440492
  * http://memfrag.se/blog/simple-vertex-shader-for-2d
    
  */

// shortcuts
// keep at the top
function ID(id){
    return document.getElementById(id);
};

var canvas = document.querySelectorAll("canvas[name='meow']")[0];
canvas.width = window.innerWidth
canvas.height = window.innerHeight;

var ctx = canvas.getContext("webgl");

ctx.clearColor(0.0, 0.0, 0.0, 1.0);
ctx.enable(ctx.DEPTH_TEST);
ctx.depthFunc(ctx.LEQUAL);
ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

var vertices = [
        -1.0, -1.0,
        +1.0, -1.0,
        +1.0, +1.0,
        -1.0, +1.0
];

var tri = ctx.createBuffer();
ctx.bindBuffer(ctx.ARRAY_BUFFER,tri);
ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vertices), ctx.STATIC_DRAW);


var program = ctx.createProgram();

var vertex_shader =
    add_shader(ctx.VERTEX_SHADER,ID("vertex-shader").textContent);
var fragment_shader =
    add_shader(ctx.FRAGMENT_SHADER,ID("fragment-shader").textContent);

function add_shader(type,content){
    var shader = ctx.createShader(type);
    ctx.shaderSource(shader,content);
    ctx.compileShader(shader);
    if(!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)){
        console.log(ctx.getShaderInfoLog(shader))
    }
    ctx.attachShader(program, shader);
    return shader;
}

ctx.linkProgram(program);

if(!ctx.getProgramParameter(program, ctx.LINK_STATUS)){
    console.log(ctx.getProgramInfoLog(program));
}

ctx.useProgram(program);


var positionAttribute = ctx.getAttribLocation(program, "position");
ctx.enableVertexAttribArray(positionAttribute);
ctx.vertexAttribPointer(positionAttribute, 2, ctx.FLOAT, false, 0, 0);

ctx.drawArrays(ctx.TRIANGLE_FAN, 0, 4);

ctx.viewport(0, 0, canvas.width, canvas.height);
