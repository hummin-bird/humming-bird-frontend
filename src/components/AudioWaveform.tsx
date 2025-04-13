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
  const autoMoveRef = useRef({ active: true, angle: 0 });

  const [variation, setVariation] = useState(0);

  useEffect(() => {
    // No longer changing variation based on recording state
    // We'll just use VAR=0 for both states to maintain the same visual effect
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
      premultipliedAlpha: false,
    });
    renderer.setClearColor(0x000000, 0); // Set clear color with 0 opacity
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

    // Animation loop
    const animate = () => {
      const currentTime = performance.now() * 0.001;
      const dt = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      timeRef.current = currentTime;

      // Automated mouse movement always active
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Use different radius based on recording state
        const baseRadius = Math.min(rect.width, rect.height);
        const radius = isRecording
          ? baseRadius * 0.3 // Original radius when recording
          : baseRadius * 0.15; // Reduced radius when not recording

        // Create a smooth pattern with varying speed
        const baseSpeed = 0.4;
        const recordingSpeedMultiplier = 8.0; // Increased from 5.0 to 8.0 for faster movement

        const animationSpeed = isRecording
          ? baseSpeed * recordingSpeedMultiplier // Increased speed when recording
          : baseSpeed;

        autoMoveRef.current.angle += dt * animationSpeed;
        const angle = autoMoveRef.current.angle;

        if (isRecording) {
          // When recording, move the point along an elliptical path inside the circle
          // Calculate position to stay close to the inner edge of the circle

          // Create an extremely elongated elliptical path that goes far beyond the circle's edges
          const horizontalRadius = radius * 1.8; // Horizontal radius extends 80% beyond the circle
          const verticalRadius = radius * 0.25; // Very narrow vertical radius (25% of the circle radius)

          // Add multiple overlapping variations for more organic movement
          const primaryPulse = 1.0 + Math.sin(angle * 0.2) * 0.08; // Slow, larger pulse
          const secondaryPulse = 1.0 + Math.sin(angle * 0.7) * 0.03; // Faster, smaller pulse
          const pulseFactor = primaryPulse * secondaryPulse;

          // Add a slight wobble to the vertical component
          const verticalWobble = 1.0 + Math.sin(angle * 3.0) * 0.15;

          // Create extremely elongated elliptical motion with variations
          const ellipticalX = Math.cos(angle) * horizontalRadius * pulseFactor;
          const ellipticalY = Math.sin(angle) * verticalRadius * verticalWobble;

          // Calculate the position that follows the inner edge of the circle
          mouseRef.current.x = centerX + ellipticalX;
          mouseRef.current.y = centerY + ellipticalY;
        } else {
          // For non-recording state
          // Add some variation with sine waves for more organic movement
          const nonRecordingVariation = Math.sin(angle * 0.5) * 0.1 + 0.9;

          // Modified pattern for non-recording - stays closer to center
          mouseRef.current.x =
            centerX + Math.cos(angle) * radius * nonRecordingVariation;
          mouseRef.current.y =
            centerY + Math.sin(angle * 1.3) * radius * nonRecordingVariation;
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
  }, [variation, isRecording]);

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
      className="w-full h-full overflow-hidden rounded-full"
      style={{
        minHeight: "300px",
        background: "transparent",
        aspectRatio: "1/1",
      }}
    />
  );
};

export default AudioWaveform;
