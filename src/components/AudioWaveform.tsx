import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import fragmentShader from "../lib/shaders/fragment.glsl"; // Using relative path

interface AudioWaveformProps {
  isRecording: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const quadRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef(new THREE.Vector2());
  const mouseDampRef = useRef(new THREE.Vector2());
  const resolutionRef = useRef(new THREE.Vector2());
  const timeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Add automated mouse movement simulation when recording
  const autoMoveRef = useRef({ active: false, angle: 0 });

  const [variation, setVariation] = useState(isRecording ? 1 : 0);

  useEffect(() => {
    // Set variation based on recording state
    setVariation(isRecording ? 1 : 0);

    // Toggle auto-move based on recording state
    autoMoveRef.current.active = isRecording;
  }, [isRecording]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Viewport setup
    const updateSize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current)
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);

      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(dpr);

      // Update camera
      cameraRef.current.left = -width / 2;
      cameraRef.current.right = width / 2;
      cameraRef.current.top = height / 2;
      cameraRef.current.bottom = -height / 2;
      cameraRef.current.updateProjectionMatrix();

      // Update quad size
      if (quadRef.current) {
        quadRef.current.scale.set(width, height, 1);
      }

      // Update resolution uniform
      resolutionRef.current.set(width, height).multiplyScalar(dpr);
      if (
        quadRef.current &&
        quadRef.current.material instanceof THREE.ShaderMaterial
      ) {
        quadRef.current.material.uniforms.u_resolution.value =
          resolutionRef.current;
        quadRef.current.material.uniforms.u_pixelRatio.value = dpr;
      }
    };

    // Orthographic camera setup
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    camera.position.z = 1;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Plane geometry for the shader
    const geometry = new THREE.PlaneGeometry(1, 1);

    // Shader material
    const material = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec2 v_texcoord;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            v_texcoord = uv;
        }`,
      fragmentShader,
      uniforms: {
        u_mouse: { value: mouseDampRef.current },
        u_resolution: { value: resolutionRef.current },
        u_pixelRatio: { value: window.devicePixelRatio },
      },
      defines: {
        VAR: variation.toString(),
      },
      transparent: true,
    });

    // Create mesh and add to scene
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);
    quadRef.current = quad;

    // Update size initially
    updateSize();

    // Handle window resize
    window.addEventListener("resize", updateSize);

    // Handle mouse movement
    const onPointerMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;

        // Disable auto-movement when user is interacting
        if (autoMoveRef.current.active) {
          autoMoveRef.current.active = false;

          // Re-enable auto-movement after 3 seconds of inactivity if still recording
          if (isRecording) {
            setTimeout(() => {
              autoMoveRef.current.active = isRecording;
            }, 3000);
          }
        }
      }
    };

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("pointermove", onPointerMove);

    // Animation loop
    const animate = () => {
      const currentTime = performance.now() * 0.001;
      const dt = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      timeRef.current = currentTime;

      // Automated mouse movement when recording
      if (autoMoveRef.current.active && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(rect.width, rect.height) * 0.3;

        // Create a smooth circular or figure-eight pattern
        autoMoveRef.current.angle += dt * 0.8;
        const angle = autoMoveRef.current.angle;

        if (variation === 1) {
          // Circle pattern for variation 1
          mouseRef.current.x = centerX + Math.cos(angle) * radius;
          mouseRef.current.y = centerY + Math.sin(angle) * radius;
        } else {
          // Figure 8 pattern for other variations
          mouseRef.current.x = centerX + Math.sin(angle) * radius;
          mouseRef.current.y = centerY + Math.sin(angle * 2) * radius * 0.5;
        }
      }

      // Update mouse with damping
      mouseDampRef.current.x = THREE.MathUtils.damp(
        mouseDampRef.current.x,
        mouseRef.current.x,
        8,
        dt
      );

      mouseDampRef.current.y = THREE.MathUtils.damp(
        mouseDampRef.current.y,
        mouseRef.current.y,
        8,
        dt
      );

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup function
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("pointermove", onPointerMove);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      if (quadRef.current) {
        quadRef.current.geometry.dispose();
        if (quadRef.current.material instanceof THREE.ShaderMaterial) {
          quadRef.current.material.dispose();
        }
      }
    };
  }, [variation]);

  useEffect(() => {
    // Update material when isRecording changes
    if (
      quadRef.current &&
      quadRef.current.material instanceof THREE.ShaderMaterial
    ) {
      quadRef.current.material.defines.VAR = variation.toString();
      quadRef.current.material.needsUpdate = true;
    }
  }, [variation]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden"
      style={{
        minHeight: "300px",
        background: "transparent",
      }}
    />
  );
};

export default AudioWaveform;
