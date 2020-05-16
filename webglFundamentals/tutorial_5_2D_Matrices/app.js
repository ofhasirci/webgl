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
    var scale = [1, 1];
    var color = [Math.random(), Math.random(), Math.random(), 1];
    console.log(color);

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
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    var colorUniformLocation = gl.getUniformLocation(program, "u_color");

    gl.uniform2f(resUniformLocation, canvas.width, canvas.height);
    gl.uniform4fv(colorUniformLocation, color);

    var matrix;
    var angle;
    var loop = function(){

        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        scale = [Math.sin(angle), Math.cos(angle)];

        matrix = m3.projection(canvas.width, canvas.height);
        matrix = m3.translate(matrix, translation[0], translation[1]);
        matrix = m3.rotate(matrix, angle);
        matrix = m3.scale(matrix, scale[0], scale[1]);
        //matrix = m3.multiply(matrix, m3.translation(-50, -75));

        gl.uniformMatrix3fv(matrixLocation, false, matrix);

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

  var m3 = {

    translate: function(m, tx, ty) {
        return m3.multiply(m, m3.translation(tx, ty));
    },

    rotate: function(m, angleInRadians) {
        return m3.multiply(m, m3.rotation(angleInRadians));
    },

    scale: function(m, sx, sy) {
        return m3.multiply(m, m3.scaling(sx, sy));
    },

    multiply: function(a, b) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
     
        return [
          b00 * a00 + b01 * a10 + b02 * a20,
          b00 * a01 + b01 * a11 + b02 * a21,
          b00 * a02 + b01 * a12 + b02 * a22,
          b10 * a00 + b11 * a10 + b12 * a20,
          b10 * a01 + b11 * a11 + b12 * a21,
          b10 * a02 + b11 * a12 + b12 * a22,
          b20 * a00 + b21 * a10 + b22 * a20,
          b20 * a01 + b21 * a11 + b22 * a21,
          b20 * a02 + b21 * a12 + b22 * a22,
        ];
      },

      translation: function(tx, ty) {
          return [
              1, 0, 0,
              0, 1, 0,
              tx, ty, 1
          ];
      },

      rotation: function(angleInRadians) {
          var c = Math.cos(angleInRadians);
          var s = Math.sin(angleInRadians);
          return [
              c, -s, 0,
              s, c, 0,
              0, 0, 1
          ];
      },

      scaling: function(sx, sy) {
          return [
              sx, 0, 0,
              0, sy, 0,
              0, 0, 1
          ];
      },

      identity: function() {
        return [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
        ];
      },

      projection: function(width, height) {
          return [
              2 / width, 0, 0,
              0, -2 / height, 0,
              0, 0, 1
          ];
      }

  }