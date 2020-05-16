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

    var translation = [0, 0, 0];
    var scale = [1, 1, 1];
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
        3,
        gl.FLOAT,
        gl.FALSE,
        0,
        0
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    // Create color buffer
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // set colors of FShape
    setColors();

    var colorAttribLocation = gl.getAttribLocation(program, "a_color");
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        0,
        0
    );
    gl.enableVertexAttribArray(colorAttribLocation);

    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    var matrix;
    var angle;
    var loop = function(){
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        //scale = [Math.sin(angle), Math.cos(angle), 1];

        matrix = m4.orthographic(0, canvas.width, canvas.height, 0, 400, -400);
        matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
        matrix = m4.xRotate(matrix, angle);
        matrix = m4.zRotate(matrix, angle/4);
        //matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
        //matrix = m3.multiply(matrix, m3.translation(-50, -75));
        
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        gl.drawArrays(gl.TRIANGLES, 0, 96);
        
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

}

function setGeometry() {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column front
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,
          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0
        ]),
        gl.STATIC_DRAW);
  }

  function setColors() {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column front
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
  
            // top rung front
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
  
            // middle rung front
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
          200/256,  70/256, 120/256,
  
            // left column back
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
  
            // top rung back
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
  
            // middle rung back
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
          80/256, 70/256, 200/256,
  
            // top
          70/256, 200/256, 210/256,
          70/256, 200/256, 210/256,
          70/256, 200/256, 210/256,
          70/256, 200/256, 210/256,
          70/256, 200/256, 210/256,
          70/256, 200/256, 210/256,
  
            // top rung right
          200/256, 200/256, 70/256,
          200/256, 200/256, 70/256,
          200/256, 200/256, 70/256,
          200/256, 200/256, 70/256,
          200/256, 200/256, 70/256,
          200/256, 200/256, 70/256,
  
            // under top rung
          210/256, 100/256, 70/256,
          210/256, 100/256, 70/256,
          210/256, 100/256, 70/256,
          210/256, 100/256, 70/256,
          210/256, 100/256, 70/256,
          210/256, 100/256, 70/256,
  
            // between top rung and middle
          210/256, 160/256, 70/256,
          210/256, 160/256, 70/256,
          210/256, 160/256, 70/256,
          210/256, 160/256, 70/256,
          210/256, 160/256, 70/256,
          210/256, 160/256, 70/256,
  
            // top of middle rung
          70/256, 180/256, 210/256,
          70/256, 180/256, 210/256,
          70/256, 180/256, 210/256,
          70/256, 180/256, 210/256,
          70/256, 180/256, 210/256,
          70/256, 180/256, 210/256,
  
            // right of middle rung
          100/256, 70/256, 210/256,
          100/256, 70/256, 210/256,
          100/256, 70/256, 210/256,
          100/256, 70/256, 210/256,
          100/256, 70/256, 210/256,
          100/256, 70/256, 210/256,
  
            // bottom of middle rung.
          76/256, 210/256, 100/256,
          76/256, 210/256, 100/256,
          76/256, 210/256, 100/256,
          76/256, 210/256, 100/256,
          76/256, 210/256, 100/256,
          76/256, 210/256, 100/256,
  
            // right of bottom
          140/256, 210/256, 80/256,
          140/256, 210/256, 80/256,
          140/256, 210/256, 80/256,
          140/256, 210/256, 80/256,
          140/256, 210/256, 80/256,
          140/256, 210/256, 80/256,
  
            // bottom
          90/256, 130/256, 110/256,
          90/256, 130/256, 110/256,
          90/256, 130/256, 110/256,
          90/256, 130/256, 110/256,
          90/256, 130/256, 110/256,
          90/256, 130/256, 110/256,
  
            // left side
          160/256, 160/256, 220/256,
          160/256, 160/256, 220/256,
          160/256, 160/256, 220/256,
          160/256, 160/256, 220/256,
          160/256, 160/256, 220/256,
          160/256, 160/256, 220/256]),
        gl.STATIC_DRAW);
  }

  var m4 = {

    translate: function(m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },
    
    xRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },
    
    yRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },
    
    zRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },
    
    scale: function(m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

    multiply: function(a, b) {
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        var dst = [];
        dst[ 0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        dst[ 1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        dst[ 2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        dst[ 3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        dst[ 4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        dst[ 5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        dst[ 6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        dst[ 7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        dst[ 8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        dst[ 9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        dst[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        dst[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        dst[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        dst[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        dst[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        dst[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
        return dst;
    },

    translation: function(tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ];
    },

    xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    
    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
    },
    
    yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    
    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
    },
    
    zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    
    return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
    },

    scaling: function(sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1
        ];
    },

    identity: function() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    },

    projection: function(width, height, depth) {
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            0, 0, 0, 1
        ];
    },

    orthographic: function(left, right, bottom, top, near, far) {
      return [
        2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, 2 / (near - far), 0,
        0, 0, 0, 1
      ];
    }

  }