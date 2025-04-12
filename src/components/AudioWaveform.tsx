import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { ShaderMaterial } from "three";
import fragmentShader from "../lib/shaders/fragment.glsl"; // Import the shader

const ShaderPlane = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, viewport } = useThree();
  const aspect = size.width / size.height;
  const vMouse = new THREE.Vector2();
  const vMouseDamp = new THREE.Vector2();
  const vResolution = new THREE.Vector2(size.width, size.height);

  useEffect(() => {
    const onPointerMove = (e: MouseEvent) => {
      vMouse.set(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", onPointerMove);
    return () => window.removeEventListener("mousemove", onPointerMove);
  }, []);

  useFrame(({ clock }) => {
    const dt = clock.getDelta();
    vMouseDamp.lerp(vMouse, 0.1);
    if (meshRef.current) {
      meshRef.current.material.uniforms.u_mouse.value = vMouseDamp;
      meshRef.current.material.uniforms.u_resolution.value = vResolution;
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={
          /* glsl */ `
          varying vec2 v_texcoord;
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            v_texcoord = uv;
          }
        `
        }
        fragmentShader={fragmentShader}
        uniforms={{
          u_mouse: { value: vMouseDamp },
          u_resolution: { value: vResolution },
          u_pixelRatio: { value: window.devicePixelRatio },
        }}
        transparent
      />
    </mesh>
  );
};

const App = () => (
  <Canvas>
    <ShaderPlane />
  </Canvas>
);

export default App;
