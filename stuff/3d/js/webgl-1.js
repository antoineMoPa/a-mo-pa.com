var canvas = document.querySelectorAll("canvas[name='meow']")[0];
canvas.width = window.innerWidth
canvas.height = window.innerHeight;

var gl = initWebGL(canvas);

if(gl){
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var tri = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,tri);

	var vertices = [
		0,0,0,
		0,1,0,
		1,0,0
	];
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
}

gl.viewport(0, 0, canvas.width, canvas.height);

function initWebGL(canvas) {
    gl = null;

    try{
        gl = canvas.getContext("webgl");
    }
    catch(e){
	}

    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }

    return gl;
}
