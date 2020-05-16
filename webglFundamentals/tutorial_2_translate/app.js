"use scrict"
var gl;

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

    gl.viewport(0, 0, canvas.width, canvas.height);

    var translation = [0, 0];
    var color = [Math.random(), Math.random(), Math.random(), 1];

    // Create position buffer
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // set F shape;
    setGeometry();

    // Set Attributes, Uniforms
    var positionAttribLocation = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(
        positionAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        0,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    var resUniformLocation = gl.getUniformLocation(program, "u_resolution");
    var translationUniformLocation = gl.getUniformLocation(program, "u_translation");
    var colorUniformLocation = gl.getUniformLocation(program, "u_color");

    gl.uniform2f(resUniformLocation, canvas.width, canvas.height);
    gl.uniform2fv(translationUniformLocation, translation);
    gl.uniform4fv(colorUniformLocation, color)

    var move;
    var loop = function(){

        move = Math.floor(performance.now() / 1000 / 6 * 4 * Math.PI)*2;
        if(move > 600) {
            move = 600;
        }
        translation = [move, move];

        gl.uniform2fv(translationUniformLocation, translation);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 18);

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

}

function setGeometry() {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,
  
            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,
  
            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90,
        ]),
        gl.STATIC_DRAW);
  }