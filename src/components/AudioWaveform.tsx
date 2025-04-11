import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { ShaderMaterial } from "three";

function GlowingBubble({ isRecording }: { isRecording: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        isRecording: { value: isRecording ? 1 : 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float isRecording;
        varying vec2 vUv;

        // Simplex noise function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);

          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(a, b, u.x) +
                 (c - a) * u.y * (1.0 - u.x) +
                 (d - b) * u.x * u.y;
        }

        vec3 getColor(float t) {
          vec3 colors[6];
          colors[0] = vec3(1.0, 0.780, 0.373);   // #ffc75f
          colors[1] = vec3(0.839, 0.365, 0.694); // #d65db1
          colors[2] = vec3(1.0, 0.435, 0.569);   // #ff6f91
          colors[3] = vec3(1.0, 0.588, 0.443);   // #ff9671
          colors[4] = vec3(0.518, 0.369, 0.761); // #845ec2
          colors[5] = vec3(0.976, 0.973, 0.443); // #f9f871

          int idx1 = int(mod(t, 6.0));
          int idx2 = int(mod(t + 1.0, 6.0));
          float mixFactor = fract(t);

          return mix(colors[idx1], colors[idx2], mixFactor);
        }

        void main() {
          float distanceFromCenter = length(vUv - vec2(0.5, 0.5)) * 2.0;
          float noiseFactor = noise(vUv * 10.0 + time * 2.0);
          float t = distanceFromCenter * 6.0 + time * 2.0 + noiseFactor;
          
          // Create glow effect
          float glow = isRecording > 0.0 ? (1.0 - distanceFromCenter) * (0.5 + 0.5 * sin(time * 3.0)) : 0.0;
          vec3 baseColor = isRecording > 0.0 ? getColor(t) : vec3(1.0, 1.0, 1.0);
          
          // Add glow to the base color
          vec3 color = baseColor + glow * vec3(0.5, 0.3, 0.2);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, [isRecording]);

  useFrame((state) => {
    if (meshRef.current) {
      const baseScale = 1; // Start smaller
      const scale = isRecording
        ? baseScale + Math.sin(state.clock.getElapsedTime() * 4) * 0.3
        : baseScale;
      meshRef.current.scale.set(scale, scale, scale);
      shaderMaterial.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <primitive attach="material" object={shaderMaterial} />
    </mesh>
  );
}

export default function GlowingBubbleScene({
  isRecording,
}: {
  isRecording: boolean;
}) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 70 }}>
      <ambientLight intensity={0.5} />
      <pointLight intensity={1} position={[5, 5, 5]} />
      <GlowingBubble isRecording={isRecording} />
    </Canvas>
  );
}
