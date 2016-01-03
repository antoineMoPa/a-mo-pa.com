/*
  Resources: 
  
  * https://gist.github.com/mbostock/5440492
  * http://memfrag.se/blog/simple-vertex-shader-for-2d
  * https://www.opengl.org/wiki/Data_Type_%28GLSL%29#Vector_constructors
  * https://www.opengl.org/wiki/Built-in_Variable_%28GLSL%29
  * https://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

  */

// shortcuts
// keep at the top
function ID(id){
    return document.getElementById(id);
};

var canvas = document.querySelectorAll("canvas[name='meow']")[0];
canvas.height = h = window.innerHeight;
canvas.width = w = h;

var ctx = canvas.getContext("webgl");

ctx.clearColor(0.0, 0.0, 0.0, 1.0);
ctx.enable(ctx.DEPTH_TEST);
ctx.depthFunc(ctx.LEQUAL);
ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

/*
  var vertices = [
  -0.5, -0.5, 
  +0.5, -0.5,
  +0.5, +0.5,
  -0.5, +0.5
  ];
*/

var vertices = [
    0,0,0,
    0,0.5,0,
    0.5,0,0,
    0.5,0.5,0,
    0,0.5,0.5,
    0,0,0.5,
    0.5,0,0.5,
    0.5,0.5,0.5
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
ctx.vertexAttribPointer(positionAttribute, 3, ctx.FLOAT, false, 0, 0);

ctx.drawArrays(ctx.POINTS, 0, 8);

ctx.viewport(0, 0, canvas.width, canvas.height);
