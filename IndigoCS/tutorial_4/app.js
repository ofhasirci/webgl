var gl;
var model;

var InitDemo = function() {
    loadTextResource('/shader.vs.glsl', function(vsErr, vsText){
        if(vsErr){
            alert("Fatal error getting vertex shader (see console)");
            console.error(vsErr);
        } else{
            loadTextResource("/shader.fs.glsl", function(fsErr, fsText){
                if(fsErr){
                    alert("Fatal error getting fragment shader (see console)");
                    console.error(fsErr);
                } else{
                    loadJSONResource("/Susan.json", function(modelErr, modelObj){
                        if(modelErr){
                            alert("Fatal error getting Susan model (see console)");
                            console.error(modelErr);
                        } else{
                            loadImage("/SusanTexture.png", function(imgErr, img){
                                if(imgErr){
                                    alert("Fatal error getting Susan texture (see console)");
                                    console.error(imgErr);
                                } else{
                                    RunDemo(vsText, fsText, img, modelObj);
                                }
                            });
                        } 
                    });
                }
            });
        }
    });
};

var RunDemo = function(vertexShaderText, fragmentShaderText, SusanImage, SusanModel)
{
    console.log("This is working.");
    model = SusanModel;

    var canvas = document.getElementById("game-surface");
    gl = canvas.getContext("webgl");

    if(!gl)
    {
        console.log("WebGL not supported, falling back to experimental-webgl");
        gl = canvas.getContext("experimental-webgl");
    }

    if(!gl)
    {
        alert("Your browser does not support WebGL");
    }

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    // create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program)
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error("ERROR linking program!", gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error("ERROR validating program!", gl.getProgramInfoLog(program));
        return;
    }

	// Create buffer
	var susanVertices = SusanModel.meshes[0].vertices;
    var susanIndices = [].concat.apply([], SusanModel.meshes[0].faces);
    var susanTexCoords = SusanModel.meshes[0].texturecoords[0];

    // Create buffer on graphic card
    var susanPosVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVertices), gl.STATIC_DRAW);

    var susanTexCoordVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanTexCoords), gl.STATIC_DRAW);

    var susanIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, susanIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), gl.STATIC_DRAW); 

    gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute Location
        3, //number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
    var textCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
    gl.vertexAttribPointer(
        textCoordAttribLocation, // Attribute Location
        2,
        gl.FLOAT, // Type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex
        0 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(textCoordAttribLocation);

    // Create Texture
    var susanTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, susanTexture);
    //--fliping the texture image in y axis to get texture correct otherwise miss the eyes
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //--
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
    
    /*gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));*/
    
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        SusanImage
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Tell OpenGL state machine which program should be active
    gl.useProgram(program)

    var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    var matViewUniformLocation = gl.getUniformLocation(program, "mView");
    var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.clientHeight, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    //Main render loop
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function()
    {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        glMatrix.mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, susanTexture);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, susanIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};