// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
    // Compute cosines and sines for the two rotation angles
    var cosX = Math.cos(rotationX);
    var sinX = Math.sin(rotationX);
    var cosY = Math.cos(rotationY);
    var sinY = Math.sin(rotationY);

    // Rotation around the X-axis in column-major order
    var rotX = [
        1,    0,     0,     0,
        0,  cosX,  sinX,    0,
        0, -sinX,  cosX,    0,
        0,    0,     0,     1
    ];

    // Rotation around the Y-axis in column-major order
    var rotY = [
        cosY,  0, -sinY,  0,
        0,     1,     0,  0,
        sinY,  0,  cosY,  0,
        0,     0,     0,  1
    ];

    // Translation matrix in column-major order
    var trans = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];

	trans = MatrixMult(trans, rotY);
	trans = MatrixMult(trans, rotX);
	var mvp = trans;
	return mvp;

    return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations

		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation( this.prog, "mvp" );
		this.mvLoc = gl.getUniformLocation( this.prog, "mv" );
		this.texLoc = gl.getUniformLocation( this.prog, "sampler" );
		this.normLoc = gl.getUniformLocation( this.prog, "normalMatrix" );
		this.lightDir = gl.getUniformLocation( this.prog, "lightDir" );
		this.shin = gl.getUniformLocation( this.prog, "shininess" );

		this.vertexPos = gl.getAttribLocation( this.prog, "vertPos" );
		this.texCoord = gl.getAttribLocation( this.prog, "vertTexCoord" );
		this.norm = gl.getAttribLocation( this.prog, "vertNormal" );

		this.vertexBuffer = gl.createBuffer();
		this.texBuffer = gl.createBuffer();
		this.normBuffer = gl.createBuffer();
		this.swapLoc = gl.getUniformLocation( this.prog, "useSwap" );
		this.showText = gl.getUniformLocation( this.prog, "showText" );
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertPos ), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.texBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.normBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( normals ), gl.STATIC_DRAW );

	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		const swapValue = swap ? 1 : 0;
		console.log("Setting swap uniform to:", swapValue);
		gl.uniform1i(this.swapLoc, swapValue);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv( this.mvpLoc, false, matrixMVP );
		gl.uniformMatrix4fv( this.mvLoc, false, matrixMV );
		gl.uniformMatrix3fv( this.normLoc, false, matrixNormal );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
		gl.vertexAttribPointer( this.vertexPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertexPos );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.texBuffer );
		gl.vertexAttribPointer( this.texCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.texCoord );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.normBuffer );
		gl.vertexAttribPointer( this.norm, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.norm );
		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		gl.useProgram(this.prog);
		const mytex= gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D,mytex);
		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);		
		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, mytex);
		gl.uniform1i(this.texLoc,0);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
        gl.uniform1i(this.show_tex, show);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram( this.prog );
		gl.uniform3f( this.lightDir, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram( this.prog );
		gl.uniform1f( this.shin, shininess );
	}
}

var meshVS = `
attribute vec3 vertPos;
attribute vec3 vertNormal;
attribute vec2 vertTexCoord;

uniform mat4 mvp;
uniform mat4 mv;
uniform mat3 normalMatrix;
varying vec2 fragTexCoord;
varying vec3 viewNormal;
varying vec4 fragPos;
uniform bool useSwap;
void main()
{
	mat4 swap_matrix =mat4 ( 1, 0, 0, 0,
		0, 0, -1, 0,
		0, 1, 0, 0,
		0, 0, 0, 1);

	if(useSwap){
		viewNormal = normalMatrix * vertNormal;
		fragPos = mv * vec4(vertPos, 0.0);
		gl_Position = mvp * swap_matrix * vec4(vertPos,1);
	}
	else {
		viewNormal = normalMatrix * vertNormal;
		fragPos = mv * vec4(vertPos, 0.0);
		gl_Position = mvp * vec4(vertPos,1);
	}
	fragTexCoord = vertTexCoord;
}
`;


var meshFS =  `
precision mediump float;
varying vec2 fragTexCoord;
varying vec3 viewNormal;
varying vec4 fragPos;

uniform sampler2D sampler;
uniform vec3 lightDir;
uniform float shininess;
uniform bool showText;

void main() {
    // Calculate light direction
    vec3 lightDirection = normalize(-lightDir);

    // Calculate view direction
    vec3 viewDirection = normalize(-fragPos.xyz);

    // Calculate halfway vector
    vec3 halfwayDir = normalize(lightDirection + viewDirection);

    // Calculate diffuse term
    float diffuse = max(dot(viewNormal, lightDirection), 0.0);

    // Calculate specular term
    float specular = pow(max(dot(viewNormal, halfwayDir), 0.0), shininess);

    // Apply texture if needed
    vec3 textureColor = vec3(1.0);
    if (showText) {
        textureColor = texture2D(sampler, fragTexCoord).rgb;
    }

    // Define material properties
    vec3 diffuseColor = vec3(1.0); // Diffuse color
    vec3 specularColor = vec3(1.0); // Specular color

    // Calculate final color
    vec3 finalColor = diffuseColor * diffuse + specularColor * specular;
    finalColor *= textureColor; // Multiply with texture color

    gl_FragColor = vec4(finalColor, 1.0);
}

`;

