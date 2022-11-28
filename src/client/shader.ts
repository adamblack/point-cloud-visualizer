export const VERTEX_SHADER = `
    #ifdef GL_ES
	precision highp float;
	#endif

    uniform float size;
    uniform float scale;
    #define USE_COLOR
    #define USE_MORPHCOLORS
    #include <common>
    #include <color_pars_vertex>
    #include <morphtarget_pars_vertex>
	
    attribute vec3 color;
    varying vec2 vUv;
    uniform float u_time;
    uniform float u_minZ;
    uniform float u_maxZ;
    uniform float u_scale;
    uniform vec3 u_camera_angle;
    uniform int u_parallax_type;
	
    void main()
	{
        #include <color_vertex>
        #include <begin_vertex>
        #include <morphtarget_vertex>
        vColor = color;
        vUv = uv;
        gl_PointSize = 2.0;

        #if defined( MORPHTARGETS_COUNT )
            vColor *= morphTargetBaseInfluence;
            for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
                if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
            }
        #endif

        if (u_parallax_type == 1) {
            transformed.x += u_scale*u_camera_angle.x*transformed.z*0.05;
            transformed.y += u_scale*u_camera_angle.y*transformed.z*0.02;
        } else if (u_parallax_type == 2) {
            transformed.x += transformed.z*cos(0.5*u_time)*0.01;
            transformed.y += transformed.z*sin(0.5*u_time)*0.005;
        }

        vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
	}
`;

export const FRAGMENT_SHADER = `
    #ifdef GL_ES
	precision highp float;
	#endif

    varying vec3 vColor;
    varying vec2 vUv;
    uniform sampler2D u_texture;
    uniform bool u_use_texture;

	void main()
	{
        if (u_use_texture) {
            gl_FragColor = texture2D(u_texture, vUv);
        } else {
            gl_FragColor = vec4( vColor, 1.0 );
        }
	}
	
`;
