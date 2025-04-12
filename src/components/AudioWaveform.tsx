import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { ShaderMaterial } from "three";
import fragmentShader from "../lib/shaders/fragment.glsl"; // Import the shader

function GlowingBubble({ isRecording }: { isRecording: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const vMouse = useRef(new THREE.Vector2());
  const vMouseDamp = useRef(new THREE.Vector2());
  const vResolution = useRef(new THREE.Vector2());

  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        isRecording: { value: isRecording ? 1 : 0 },
        u_mouse: { value: vMouseDamp.current },
        u_resolution: { value: vResolution.current },
        u_pixelRatio: { value: window.devicePixelRatio || 1 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader,
    });
  }, [isRecording]);

  useFrame((state) => {
    if (meshRef.current) {
      const baseScale = 1;
      const scale = isRecording
        ? baseScale + Math.sin(state.clock.getElapsedTime() * 4) * 0.3
        : baseScale;
      meshRef.current.scale.set(scale, scale, scale);
      shaderMaterial.uniforms.time.value = state.clock.getElapsedTime();

      // Ease mouse motion with damping
      vMouseDamp.current.lerp(vMouse.current, 0.1);
    }
  });

  useEffect(() => {
    const onPointerMove = (e: MouseEvent) => {
      vMouse.current.set(e.pageX, e.pageY);
    };
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);

      vResolution.current.set(w, h).multiplyScalar(dpr);
      shaderMaterial.uniforms.u_pixelRatio.value = dpr;
    };
    window.addEventListener("resize", resize);
    resize();

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
    };
  }, [shaderMaterial]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
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
