export const ARROW_VERTEX_SHADER = `#version 300 es

in vec4 a_position;
uniform vec2 u_vector_index;
uniform ivec2 u_noise_size;
uniform mat4 u_matrix_model;
uniform mat4 u_matrix_view;
uniform mat4 u_matrix_projection;
uniform sampler2D noiseTex;

// we can draw arrow with certain angle via texel or value passed to shader 
uniform float u_fromTexel;
uniform float u_arrowXYAngleValue;
uniform float u_arrowXZAngleValue;
uniform float u_arrowSizeValue;
uniform float u_z_projection;

const float PI = 3.141;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  vec4 noiseValue = vec4(0.0);

  if (u_fromTexel == 1.0) {
    ivec2 texelCoords = ivec2(round(vec2(u_vector_index.x*float(u_noise_size.x), u_vector_index.y*float(u_noise_size.y))));
    // edge is non-existent
    texelCoords.x = min( texelCoords.x, u_noise_size.x - 1);
    texelCoords.y = min( texelCoords.y, u_noise_size.y - 1);
    
    noiseValue = texelFetch(noiseTex, texelCoords, 0);
  } else {
    noiseValue = vec4(u_arrowXYAngleValue, u_arrowXZAngleValue, u_arrowSizeValue, 0.0);
  }
  
  float angle = map(noiseValue.r, 0.0, 1.0, 0.0, PI * 2.0);
  float zAngle = map(noiseValue.g, 0.0, 1.0, 0.0, PI * 2.0);
  
  if (u_z_projection == 1.0) {
    zAngle = 0.0;
  }

  float noiseScaleFactor = 0.05 + noiseValue.b / 10.0;
  mat4 noiseScale = mat4(noiseScaleFactor, 0.0, 0.0, 0.0,  // 1. column
                  0.0, noiseScaleFactor, 0.0, 0.0,  // 2. column
                  0.0, 0.0, noiseScaleFactor, 0.0,  // 3. column
                  0.0, 0.0, 0.0, 1.0); // 4. column
  
  // scale
  vec4 rotated_position = noiseScale*a_position;//*(1.0 + noiseValue.b*1000.0);
  // Basic xy rotation
  rotated_position = vec4(rotated_position.x*cos(angle) - rotated_position.y*sin(angle), rotated_position.x*sin(angle) + rotated_position.y*cos(angle), rotated_position.zw);
  // Basic xz rotation
  rotated_position = vec4(rotated_position.x*cos(zAngle), rotated_position.y, -rotated_position.x*sin(zAngle) , rotated_position.w);
  gl_Position = u_matrix_projection * u_matrix_view * u_matrix_model * rotated_position;
}
`

export const ARROW_FRAGMENT_SHADER = `#version 300 es

precision highp float;
out vec4 outColor;
 
void main() {
  outColor = vec4(0, 0, 0.5, 1);
}
`

export const FLOW_HISTORY_VERTEX_SHADER = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;
uniform mat4 u_matrix_model;
uniform mat4 u_matrix_view;
uniform mat4 u_matrix_projection;

out vec2 v_texcoord;

void main() {
  gl_Position = u_matrix_projection * u_matrix_view * u_matrix_model * a_position;
  v_texcoord = a_texcoord;
}
`

export const FLOW_HISTORY_FRAGMENT_SHADER = `#version 300 es

precision highp float;
out vec4 outColor;
uniform sampler2D u_flowHistoryTex;
uniform float u_dimming_ratio;
in vec2 v_texcoord;
 
void main() {
  vec4 dimmedColor = texture(u_flowHistoryTex, v_texcoord)*u_dimming_ratio;
  if (dimmedColor.a < 0.2) {
    dimmedColor.a = 0.0;
  }
  outColor = dimmedColor;
}
`

export const FLOW_STEP_VERTEX_SHADER = `#version 300 es
  in vec3 oldPosition;

  uniform float u_time_delta;
  uniform ivec2 u_noise_size;

  out vec3 newPosition;

  uniform sampler2D noiseTex;

  const float PI = 3.141;

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  float rand(vec2 n, float simplexValue)
  {
    return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))*41753.5453);
  }

  void main() {

    float xPosition = (oldPosition.x + 1.0)/2.0;
    float yPosition = (oldPosition.y + 1.0)/2.0;

    ivec2 texelCoords = ivec2(round(vec2(xPosition*float(u_noise_size.x),yPosition*float(u_noise_size.y))));
    // edge is non-existent
    texelCoords.x = min( texelCoords.x, u_noise_size.x - 1);
    texelCoords.y = min( texelCoords.y, u_noise_size.y - 1);

    vec4 noiseValue = texelFetch(noiseTex, texelCoords, 0);
    
    float angle = map(noiseValue.r, 0.0, 1.0, 0.0, PI * 2.0);
    vec2 angleVelocity = vec2(cos(angle), sin(angle));

    vec2 absolutePosition = oldPosition.xy + angleVelocity * u_time_delta*0.5;

    vec2 particleSeed = vec2(xPosition, yPosition);
    if (rand(particleSeed, noiseValue.r) > 0.98) {
      float randX = (rand(particleSeed + noiseValue.r*1.78, noiseValue.r) - 1.0)*2.0;
      float randY = (rand(particleSeed + noiseValue.r*2.37, noiseValue.r) - 1.0)*2.0;
      absolutePosition = vec2(randX, randY);
    }

    if (absolutePosition.x > 1.0) {
      absolutePosition.x -= 2.0;
    }
    if (absolutePosition.y > 1.0) {
      absolutePosition.y -= 2.0;
    }
    if (absolutePosition.x < -1.0) {
      absolutePosition.x += 2.0;
    }
    if (absolutePosition.y < -1.0) {
      absolutePosition.y += 2.0;
    }

    newPosition = vec3(absolutePosition, noiseValue.b);
  }
  `;

export const FLOW_STEP_FRAGMENT_SHADER = `#version 300 es
  precision highp float;
  void main() {
  }
  `

export const FLOW_DRAW_VERTEX_SHADER = `#version 300 es
  in vec4 position;
  uniform mat4 u_matrix_model;
  uniform mat4 u_matrix_view;
  uniform mat4 u_matrix_projection;

  out float v_particle_speed;

  void main() {
    gl_PointSize = 1.5;
    v_particle_speed = position.z;
    gl_Position = u_matrix_projection * u_matrix_view * u_matrix_model * position;
  }
  `

export const FLOW_DRAW_FRAGMENT_SHADER = `#version 300 es
  precision highp float;
  
  in float v_particle_speed;
  out vec4 outColor;

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  void main() {
    float noiseMax = 0.8;
    float r = map(v_particle_speed, 0.0, noiseMax, 0.0, 0.8);
    float g = map(v_particle_speed, 0.0, noiseMax, 0.44, 0.0);
    float b = map(v_particle_speed, 0.0, noiseMax, 0.69, 0.12);
    outColor = vec4(r, g, b, 1);
  }
  `

  const SIMPLEX_METHODS = `
  //
  // Description : Array and textureless GLSL 2D/3D/4D simplex 
  //               noise functions.
  //      Author : Ian McEwan, Ashima Arts.
  //  Maintainer : stegu
  //     Lastmod : 20110822 (ijm)
  //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
  //               Distributed under the MIT License. See LICENSE file.
  //               https://github.com/ashima/webgl-noise
  //               https://github.com/stegu/webgl-noise
  // 
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0; }
  
  float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0; }
  
  vec4 permute(vec4 x) {
       return mod289(((x*34.0)+1.0)*x);
  }
  
  float permute(float x) {
       return mod289(((x*34.0)+1.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float taylorInvSqrt(float r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  vec4 grad4(float j, vec4 ip)
    {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;
  
    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 
  
    return p;
    }
              
  // (sqrt(5) - 1)/4 = F4, used once below
  #define F4 0.309016994374947451
  
  float snoise(vec4 v)
    {
    const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                          0.276393202250021,  // 2 * G4
                          0.414589803375032,  // 3 * G4
                         -0.447213595499958); // -1 + 4 * G4
  
  // First corner
    vec4 i  = floor(v + dot(v, vec4(F4)) );
    vec4 x0 = v -   i + dot(i, C.xxxx);
  
  // Other corners
  
  // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
  //  i0.x = dot( isX, vec3( 1.0 ) );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
  //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;
  
    // i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );
  
    //  x0 = x0 - 0.0 + 0.0 * C.xxxx
    //  x1 = x0 - i1  + 1.0 * C.xxxx
    //  x2 = x0 - i2  + 2.0 * C.xxxx
    //  x3 = x0 - i3  + 3.0 * C.xxxx
    //  x4 = x0 - 1.0 + 4.0 * C.xxxx
    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;
  
  // Permutations
    i = mod289(i); 
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
               i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
             + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
             + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
             + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
  
  // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;
  
    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);
  
  // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));
  
  // Mix contributions from the five corners
    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
                 + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
  
    }
  
  // demo code:
  float color(vec3 xyz, float time) { return snoise(vec4(xyz, 0.3*time)); }
  `

export const SIMPLEXA_VERTEX_SHADER = `#version 300 es

in vec4 a_position;
uniform mat4 u_matrix_model;
uniform mat4 u_matrix_view;
uniform mat4 u_matrix_projection;

out vec2 v_texcoord;

void main() {
  gl_Position = u_matrix_projection * u_matrix_view * u_matrix_model * a_position;
  v_texcoord = a_position.xy;
}
`

export const SIMPLEXB_FRAGMENT_SHADER = `#version 300 es
precision highp float;

${SIMPLEX_METHODS}

uniform float u_time;
uniform float u_z_layer;
uniform vec2 u_screen_size;
// 0 - draw combined
// 1 - draw xy angle only
// 2 - draw xz angle only
// 3 - draw vector abs size only
uniform float u_filter_visualization;
out vec4 outColor;
in vec2 v_texcoord;

// used to sample values for angle in xy plane
const float X_ANGLE_OFFSET = 0.0;
// used to sample values for angle in xz plane
const float Y_ANGLE_OFFSET = -50.0;
// used to sample vector size
const float SIZE_OFFSET = -100.0;


float sampleNoise(vec3 xyz) {
  vec3 step = vec3(1.3, 1.7, 2.1);

  float n = color(xyz, u_time);
  n += 0.5 * color(xyz * 2.0 - step, u_time);
  n += 0.25 * color(xyz * 4.0 - 2.0 * step, u_time);
  n += 0.125 * color(xyz * 8.0 - 3.0 * step, u_time);
  n += 0.0625 * color(xyz * 16.0 - 4.0 * step, u_time);
  n += 0.03125 * color(xyz * 32.0 - 5.0 * step, u_time);

  return n;
}
 
void main() {
  vec2 p = v_texcoord;
  vec3 xyz = vec3(p, u_z_layer);
  float n = sampleNoise(xyz);

  vec3 combinedNoiseTexel = vec3(0, 0, 0);
  for (int i = 0; i < 3; i++) {
    float offset = 0.0;
    vec3 mask_vector = vec3(1, 0, 0);
    if (i == 1) {
      offset = Y_ANGLE_OFFSET;
      mask_vector = vec3(0, 1, 0);
    } else if (i == 2) {
      offset = SIZE_OFFSET;
      mask_vector = vec3(0, 0, 1);
    }

    vec3 xyzToSample = vec3(p, u_z_layer + offset);
    float sampledValue = sampleNoise(xyzToSample);
    vec3 scaledSample = mix(0.0, 0.5 + 0.5 * sampledValue, smoothstep(0.0, 0.003, 1.0)) * mask_vector;
    combinedNoiseTexel += scaledSample;
  }

  if (u_filter_visualization == 0.0) {
    outColor = vec4(combinedNoiseTexel, 1);
  } else if (u_filter_visualization == 1.0) {
    outColor = vec4(combinedNoiseTexel.r, combinedNoiseTexel.r, combinedNoiseTexel.r, 1);
  } else if (u_filter_visualization == 2.0) {
    outColor = vec4(combinedNoiseTexel.g, combinedNoiseTexel.g, combinedNoiseTexel.g, 1);
  } else if (u_filter_visualization == 3.0) {
    outColor = vec4(combinedNoiseTexel.b, combinedNoiseTexel.b, combinedNoiseTexel.b, 1);
  }

  // testing values, XY angle, XZ angle, size
  // outColor = vec4(0.25, 0, 1.0, 1);
  // outColor = vec4(0.5, 0, 1.0, 1);
  // outColor = vec4(1.0, 0, 1.0, 1);
}
`

export const FLIGHT_VERTEX_SHADER = `#version 300 es
            in vec4 a_position;
            uniform mat4 u_matrix_model;
            uniform mat4 u_matrix_view;
            uniform mat4 u_matrix_projection;
          
            void main() {
              gl_Position = u_matrix_projection * u_matrix_view * u_matrix_model * a_position;
            }
            `

export const FLIGHT_FRAGMENT_SHADER = `#version 300 es
            precision highp float;
            uniform float u_color_r;
            out vec4 outColor;
            void main() {
              outColor = vec4(0, 0, 1.0 - u_color_r, 1);
            }
`

export const SAMPLE_NOISE_VERTEX_SHADER = `#version 300 es
  ${SIMPLEX_METHODS}
  in vec3 a_positionToSample;
  out vec3 sampledValue;

  uniform float u_time;

  // used to sample values for angle in xy plane
  const float X_ANGLE_OFFSET = 0.0;
  // used to sample values for angle in xz plane
  const float Y_ANGLE_OFFSET = -50.0;
  // used to sample vector size
  const float SIZE_OFFSET = -100.0;


  float sampleNoise(vec3 xyz) {
    vec3 step = vec3(1.3, 1.7, 2.1);

    float n = color(xyz, u_time);
    n += 0.5 * color(xyz * 2.0 - step, u_time);
    n += 0.25 * color(xyz * 4.0 - 2.0 * step, u_time);
    n += 0.125 * color(xyz * 8.0 - 3.0 * step, u_time);
    n += 0.0625 * color(xyz * 16.0 - 4.0 * step, u_time);
    n += 0.03125 * color(xyz * 32.0 - 5.0 * step, u_time);

    return n;
  }

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  void main() {

    vec3 p = a_positionToSample;
    vec3 combinedNoiseTexel = vec3(0, 0, 0);

    for (int i = 0; i < 3; i++) {
      float offset = 0.0;
      vec3 mask_vector = vec3(1, 0, 0);
      if (i == 1) {
        offset = Y_ANGLE_OFFSET;
        mask_vector = vec3(0, 1, 0);
      } else if (i == 2) {
        offset = SIZE_OFFSET;
        mask_vector = vec3(0, 0, 1);
      }

      vec3 xyzToSample = vec3(p.x, p.z, p.y + offset);
      float sampledValue = sampleNoise(xyzToSample);
      vec3 scaledSample = mix(0.0, 0.5 + 0.5 * sampledValue, smoothstep(0.0, 0.003, 1.0)) * mask_vector;
      combinedNoiseTexel += scaledSample;
    }

  sampledValue = combinedNoiseTexel.xyz;

  // testing values, XY angle, XZ angle, size
  // sampledValue = vec3(0.25, 0.0, 0.5);
  // sampledValue = vec3(0.5, 0.0, 0.5);
  // sampledValue = vec3(1, 0.0, 0.5);
  }
  `;

export const SAMPLE_NOISE_FRAGMENT_SHADER = `#version 300 es
  precision highp float;
  void main() {
  }
  `


