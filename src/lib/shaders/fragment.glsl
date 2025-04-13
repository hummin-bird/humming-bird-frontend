varying vec2 v_texcoord;

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_isRecording; // 1.0 when recording, 0.0 when not recording

/* common constants */
#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif
#ifndef TWO_PI
#define TWO_PI 6.2831853071795864769252867665590
#endif

/* variation constant */
#ifndef VAR
#define VAR 0
#endif

/* Coordinate and unit utils */
#ifndef FNC_COORD
#define FNC_COORD
vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    // correct aspect ratio
    if (u_resolution.x > u_resolution.y) {
        p.x *= u_resolution.x / u_resolution.y;
        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
        p.y *= u_resolution.y / u_resolution.x;
        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    // centering
    p -= 0.5;
    p *= vec2(-1.0, 1.0);
    return p;
}
#endif

#define st0 coord(gl_FragCoord.xy)
#define mx coord(u_mouse * u_pixelRatio)

/* signed distance functions */
float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}
float sdCircle(in vec2 st, in vec2 center) {
    return length(st - center) * 2.0;
}
float sdPoly(in vec2 p, in float w, in int sides) {
    float a = atan(p.x, p.y) + PI;
    float r = TWO_PI / float(sides);
    float d = cos(floor(0.5 + a / r) * r - a) * length(max(abs(p) * 1.0, 0.0));
    return d * 2.0 - w;
}

/* antialiased step function */
float aastep(float threshold, float value) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}
/* Signed distance drawing methods */
float fill(in float x) { return 1.0 - aastep(0.0, x); }
float fill(float x, float size, float edge) {
    return 1.0 - smoothstep(size - edge, size + edge, x);
}

float stroke(in float d, in float t) { return (1.0 - aastep(t, abs(d))); }
float stroke(float x, float size, float w, float edge) {
    float d = smoothstep(size - edge, size + edge, x + w * 0.5) - smoothstep(size - edge, size + edge, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

void main() {
    vec2 pixel = 1.0 / u_resolution.xy;
    vec2 st = st0 + 0.5;
    vec2 posMouse = mx * vec2(1., -1.) + 0.5;
    
    /* sdf (Round Rect) params */
    float size = 1.2;
    float roundness = 0.4;
    float borderSize = 0.05;
    
    /* Get distance to mouse position for glow effect */
    float distToMouse = length(st - posMouse);
    
    // Creating a lens effect with colors instead of transparency
    float lensSize = u_isRecording > 0.5 ? 0.15 : 0.2; // Size of the lens area
    float lensEdge = u_isRecording > 0.5 ? 0.05 : 0.08; // Sharper edge for better defined lens
    
    // Create a clean lens effect with smooth edges (inverted from previous - now 1.0 inside the lens)
    float lensEffect = 1.0 - smoothstep(lensSize - lensEdge, lensSize + lensEdge, distToMouse);
    
    // Create a subtle blur/glow around the lens edge (same as before)
    float edgeGlow = smoothstep(lensSize - lensEdge*3.0, lensSize + lensEdge, distToMouse) * 
                    (1.0 - smoothstep(lensSize - lensEdge, lensSize + lensEdge*3.0, distToMouse));
    edgeGlow *= 1.5; // Intensify the edge glow
    
    // Apply blur parameters
    float glowIntensity = smoothstep(0.3, 0.0, distToMouse) * 2.0;
    
    /* sdf Circle params */
    float circleSize = u_isRecording > 0.5 ? 0.15 : 0.25; 
    float circleEdge = u_isRecording > 0.5 ? 0.3 : 0.4;
    
    /* sdf Circle */
    float sdfCircle = fill(
        sdCircle(st, posMouse),
        circleSize,
        circleEdge
    );
    
    // Create a circular border instead of a rectangle
    float circleRadius = 0.47; // Increased from 0.45 to make the circle larger
    float sdf = sdCircle(st, vec2(0.5)) - circleRadius; // Main circle with larger radius
    float baseSdf = stroke(sdf, 0.0, borderSize, 0.15) * 4.0; // Base stroke with fixed thickness
    float glowingSdf = stroke(sdf, 0.0, borderSize, sdfCircle) * 4.0; // Stroke with mouse-based adjustment
    
    // Create a combined effect with the base shape and the highlight
    sdf = max(baseSdf, glowingSdf * 1.2);
    
    // Apply gradient colors 
    vec3 blueColor = vec3(0.157, 0.706, 0.960); // #28b4f5
    vec3 greenColor = vec3(0.012, 1.0, 0.396);  // #03ff65
    
    // Calculate angle for circular gradient
    vec2 toCenter = st - vec2(0.5);
    float angle = atan(toCenter.y, toCenter.x) / (2.0 * PI) + 0.5; // Normalize to 0-1
    
    // Get gradient color based on circular position around the border
    vec3 gradientColor = mix(greenColor, blueColor, angle);
    
    // Apply the gradient directly to the base stroke with increased intensity
    vec3 baseColor = gradientColor * baseSdf * 1.5; // Increased intensity to make colors more vibrant
    
    // Create a more subtle glow effect that doesn't wash out the gradient
    vec3 hazeColor = mix(gradientColor, vec3(1.0), 0.3); // Only 30% white, 70% gradient color
    
    // Apply the haze with reduced white intensity
    vec3 glowColor = hazeColor * (1.0 + glowIntensity * 1.8) * glowingSdf;
    
    // Create softer blending between base and glow
    vec3 color = mix(baseColor, glowColor, glowingSdf * 0.8);
    
    // Add edge glow to the color - creates a bright rim around the lens
    vec3 edgeColor = hazeColor * 2.0; // Brighter edge color
    color = mix(color, edgeColor, edgeGlow);
    
    // Create a blue-green gradient for the lens interior with dynamic effects
    // Add some time-based animation using the angle (which changes as the glow point moves)
    float animatedFactor = 0.5 + sin(angle * 8.0) * 0.5; // Creates a cycling effect as the point moves
    
    // Create a more vibrant, shimmering lens color
    vec3 lensColor = mix(greenColor * 1.5, blueColor * 1.5, animatedFactor); // Brighter, animated blue-green gradient
    
    // Add a "glow core" - a bright inner part of the lens
    float innerCore = smoothstep(lensSize * 0.4, 0.0, distToMouse);
    lensColor = mix(lensColor, vec3(1.0, 1.0, 1.0), innerCore * 0.7); // White core
    
    // Apply lens color where lensEffect is active, stronger effect
    color = mix(color, lensColor, lensEffect);
    
    // Calculate the base alpha
    float hazeAlpha = glowingSdf * 0.9; // Semi-transparent haze
    float baseAlpha = baseSdf; // Original alpha for the base shape
    float alpha = max(baseAlpha, hazeAlpha);
    
    // Keep everything visible, no transparency in the lens
    float finalAlpha = alpha; // No transparency effect, keep base alpha
    
    gl_FragColor = vec4(color, finalAlpha);
}