"use scrict"
var gl;

function randomInt(range){
    return Math.floor(Math.random() * range);
}

function Init(){
    console.log("This is working");
    
    var canvas = document.getElementById("game-surface");
    gl = canvas.getContext("webgl");
    if(!gl){
        console.log("Webgl is not supported, falling bac webgl-experimental.");
        gl = canvas.getContext("experimental-webgl");
        if(!gl){
            alert("Webgl is not supported.");
        }
    }

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, document.getElementById("vertexShader").innerHTML);
    gl.shaderSource(fragmentShader, document.getElementById("fragmentShader").innerHTML);

    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error("ERROR compiling fragment shader!", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error("ERROR linking program!", gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error("ERROR validate program!", gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create the buffer
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Set Attributes, Uniforms
    var positionAttribLocation = gl.getAttribLocation(program, "a_position");
    var colorUniformLocation = gl.getUniformLocation(program, "u_color");
    gl.vertexAttribPointer(
        positionAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.viewport(0, 0, canvas.width, canvas.height);

    
    for(var i=0; i<50; i++)
    {
        x = randomInt(canvas.width);
        y = randomInt(canvas.height);
        width = randomInt(canvas.width);
        height = randomInt(canvas.height);
        x1 = x;
        x2 = ((x + width) > canvas.width) ? canvas.width : x + width;
        y1 = y;
        y2 = ((y + height) > canvas.height) ? canvas.height : y + height;

        x1 = (x1 / canvas.width) * 2.0 - 1.0;
        x2 = (x2 / canvas.width) * 2.0 - 1.0;
        y1 = (y1 / canvas.height) * 2.0 - 1.0;
        y2 = (y2 / canvas.height) * 2.0 - 1.0;

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);
        
        gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

}