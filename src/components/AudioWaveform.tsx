import React from "react";

interface AudioWaveformProps {
  isRecording: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording }) => {
  // Number of bars to show in the waveform
  const bars = 9;

  return (
    <div className="flex items-center justify-center w-full">
      <div className={`audio-wave ${isRecording ? "active" : "inactive"}`}>
        {Array.from({ length: bars }).map((_, index) => (
          <div
            key={index}
            className={`wave-bar ${
              isRecording ? `animate-wave-${(index % 5) + 1}` : ""
            }`}
            style={{
              opacity: isRecording ? 1 : 0.5,
              height: isRecording ? "100%" : "30%",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioWaveform;
