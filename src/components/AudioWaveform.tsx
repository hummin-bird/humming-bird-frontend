import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import fragmentShader from "../lib/shaders/fragment.glsl"; // Using relative path

interface AudioWaveformProps {
  isRecording: boolean;
}

// Add type definition for the WebAudio API
interface Window {
  webkitAudioContext: typeof AudioContext;
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

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioDataRef = useRef<Uint8Array | null>(null);

  const [variation, setVariation] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (isRecording) {
      // Create audio context and analyzer if they don't exist
      if (!audioContextRef.current) {
        // Safely create AudioContext with cross-browser support
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        audioDataRef.current = new Uint8Array(
          analyserRef.current.frequencyBinCount
        );
      }

      // Get user microphone
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          mediaStreamRef.current = stream;

          if (audioContextRef.current && analyserRef.current) {
            const source =
              audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
          }
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err);
        });
    } else {
      // Cleanup when not recording
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      // Cleanup audio resources
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isRecording]);

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
        u_isRecording: { value: 0.0 },
        u_audioLevel: { value: 0.0 },
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

      // Get audio data if recording
      let audioLevel = 0;
      if (isRecording && analyserRef.current && audioDataRef.current) {
        analyserRef.current.getByteFrequencyData(audioDataRef.current);

        // Calculate average volume level from frequency data
        const sum = audioDataRef.current.reduce((acc, val) => acc + val, 0);
        audioLevel = sum / audioDataRef.current.length / 255; // Normalize to 0-1
        setAudioLevel(audioLevel);
      }

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

        // Use audio level to influence speed when recording
        const recordingSpeedMultiplier = isRecording
          ? 3.0 + audioLevel * 10.0 // Base speed + audio level influence
          : 8.0; // Default speed when not recording

        const animationSpeed = isRecording
          ? baseSpeed * recordingSpeedMultiplier
          : baseSpeed;

        autoMoveRef.current.angle += dt * animationSpeed;
        const angle = autoMoveRef.current.angle;

        if (isRecording) {
          // When recording, use audio level to influence the path
          // Higher audio levels = more extreme movements

          // Base elliptical parameters
          const horizontalRadius = radius * (1.4 + audioLevel * 1.0); // Expands with audio level
          const verticalRadius = radius * (0.25 + audioLevel * 0.3); // Expands with audio level

          // Add multiple overlapping variations for more organic movement
          const primaryPulse =
            1.0 + Math.sin(angle * 0.2) * 0.08 * (1 + audioLevel);
          const secondaryPulse =
            1.0 + Math.sin(angle * 0.7) * 0.03 * (1 + audioLevel);
          const pulseFactor = primaryPulse * secondaryPulse;

          // Add audio-reactive wobble to the vertical component
          const verticalWobble =
            1.0 + Math.sin(angle * 3.0) * 0.15 * (1 + audioLevel * 2);

          // Create audio-reactive elliptical motion
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

      // Update shader uniforms
      if (
        quadRef.current &&
        quadRef.current.material instanceof THREE.ShaderMaterial
      ) {
        quadRef.current.material.uniforms.u_isRecording.value = isRecording
          ? 1.0
          : 0.0;
        quadRef.current.material.uniforms.u_audioLevel.value = audioLevel;
      }

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
