import React, { useState, useEffect, useRef } from "react";

const AnimationBlob = ({ isRecording }: { isRecording: boolean }) => {
  const [freq, setFreq] = useState({ x: 0.008, y: 0.01 });
  const [scale, setScale] = useState(1);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const mappedX = 0.006 + x * 0.01;
    const mappedY = 0.006 + y * 0.01;
    setFreq({ x: mappedX, y: mappedY });

    const dx = x - 0.5;
    const dy = y - 0.5;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const mappedScale = 1 + distance * 0.3;
    setScale(mappedScale);
  };

  const handleMouseLeave = () => {
    setScale(1);
    setFreq({ x: 0.008, y: 0.01 });
  };

  // ⏱ 錄音狀態下自動動畫：模擬 hover 波動
  useEffect(() => {
    if (isRecording) {
      const animate = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;

        // 讓 freq 在一段時間內 sinusoidal 波動
        const t = elapsed / 1000;
        const newX = 0.008 + Math.sin(t * 2) * 0.004;
        const newY = 0.01 + Math.cos(t * 2.5) * 0.004;
        const pulseScale = 1 + Math.sin(t * 1.5) * 0.1;

        setFreq({ x: newX, y: newY });
        setScale(pulseScale);

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // 停止動畫 + 回復初始狀態
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      startTimeRef.current = 0;
      setFreq({ x: 0.008, y: 0.01 });
      setScale(1);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  // radius + scale 合併處理
  const radius = isRecording ? 110 : 80;
  const totalScale = isRecording ? scale * 1.2 : scale;

  // 定義顏色方案
  const colorSchemes = {
    default: {
      center: "#ffffff",
      middle: "#f8f9fa",
      outer: "#e9ecef",
    },
    recording: {
      center: "#ffffff",
      middle: "#28b4f5", // Blue
      outer: "#03ff65", // Green
    },
  };

  // 當前使用的配色
  const currentColors = isRecording
    ? colorSchemes.recording
    : colorSchemes.default;

  return (
    <div
      className="w-64 h-64 transition-transform duration-300"
      style={{ transform: `scale(${totalScale})` }}
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor={currentColors.center}
              stopOpacity="0.9"
            />
            <stop
              offset="40%"
              stopColor={currentColors.middle}
              stopOpacity="0.6"
            />
            <stop
              offset="100%"
              stopColor={currentColors.outer}
              stopOpacity="0.3"
            />
          </radialGradient>

          <filter id="noise">
            <feTurbulence
              type="turbulence"
              baseFrequency={`${freq.x} ${freq.y}`}
              numOctaves="3"
              result="turbulence"
            />
            <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="30" />
          </filter>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={isRecording ? "12" : "8"}
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="200"
          cy="200"
          r={radius}
          fill="url(#grad)"
          filter="url(#noise) url(#glow)"
          className="transition-all duration-500"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 200 200"
            to="360 200 200"
            dur="30s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default AnimationBlob;
