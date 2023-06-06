// Get the WebGL context
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// Create the vertex shader
const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

// Create the fragment shader
const fragmentShaderSource = `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec4 color = texture2D(iChannel0, uv);

  float strength = 2.0;  // Adjust the grain size (smaller value for smaller grain)

  float x = (uv.x + 4.0) * (uv.y + 4.0) * (iTime * 5.0);  // Adjust the rate of change (larger value for slower change)
  vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

  // Adjust the grain value based on the UV coordinates
  float grainValue = (grain.r + grain.g + grain.b) / 3.0;
  grainValue *= 1.0 - pow(abs(uv.x - 0.5) * 2.0, 15.0);  // Make grain strength depend on the distance from the center horizontally, tweak last number for strength
  grainValue *= 1.0 - pow(abs(uv.y - 0.5) * 2.0, 15.0);  // Make grain strength depend on the distance from the center vertically, tweak last number for strength

  fragColor = color + vec4(grainValue);
}

void main() {
  vec4 fragColor;
  mainImage(fragColor, gl_FragCoord.xy);
  gl_FragColor = fragColor;
}
`;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// Create the shader program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Create the position attribute
const positionAttributeLocation = gl.getAttribLocation(
	shaderProgram,
	"position"
);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
	gl.ARRAY_BUFFER,
	new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
	gl.STATIC_DRAW
);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Set the uniform variables
const resolutionUniformLocation = gl.getUniformLocation(
	shaderProgram,
	"iResolution"
);
gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

const timeUniformLocation = gl.getUniformLocation(shaderProgram, "iTime");

// Render the scene
function render() {
	gl.uniform1f(timeUniformLocation, performance.now() / 1000);

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	requestAnimationFrame(render);
}

render();
