// components/AnimationBlob.tsx
const AnimationBlob = () => (
  <svg viewBox="0 0 200 200" className="w-64 h-64 rounded-full overflow-hidden">
    <defs>
      <radialGradient id="grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#4299E1" />
        <stop offset="100%" stopColor="rgb(3, 255, 101)" />
      </radialGradient>
      <filter id="noise">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.01 0.02"
          numOctaves="3"
          seed="2"
          result="turbulence"
        >
          <animate
            attributeName="seed"
            values="2;12;2"
            dur="10s"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="30" />
      </filter>
    </defs>
    <circle cx="100" cy="100" r="100" fill="url(#grad)" filter="url(#noise)" />
  </svg>
);

export default AnimationBlob;
