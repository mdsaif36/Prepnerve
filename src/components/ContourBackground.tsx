const ContourBackground = () => {
  const contourLines = [];

  for (let i = 0; i < 30; i++) {
    const x = 340 + i * 14;
    const opacity = 0.06 + Math.sin(i * 0.3) * 0.03;
    const strokeWidth = 0.4 + Math.random() * 0.4;
    const delay = i * 0.8;
    contourLines.push(
      <path
        key={`main-${i}`}
        d={`M${x} 0 C${x - 60} 120 ${x + 80} 280 ${x - 10} 400 C${x - 80} 520 ${x + 60} 680 ${x} 800`}
        fill="none"
        stroke="url(#blueGlow)"
        strokeWidth={strokeWidth}
        opacity={opacity}
        style={{
          animation: `wave ${12 + i * 0.5}s ease-in-out ${delay}s infinite`,
        }}
      />
    );
  }

  for (let i = 0; i < 12; i++) {
    const x = 620 + i * 16;
    const delay = i * 1.2;
    contourLines.push(
      <path
        key={`sec-${i}`}
        d={`M${x} 0 C${x - 30} 180 ${x + 50} 320 ${x - 5} 500 C${x - 40} 620 ${x + 30} 720 ${x} 800`}
        fill="none"
        stroke="url(#blueGlow)"
        strokeWidth="0.35"
        opacity={0.03 + i * 0.005}
        style={{
          animation: `wave ${14 + i * 0.6}s ease-in-out ${delay}s infinite`,
        }}
      />
    );
  }

  for (let i = 0; i < 6; i++) {
    const x = 140 + i * 18;
    contourLines.push(
      <path
        key={`bg-${i}`}
        d={`M${x} 0 C${x - 20} 200 ${x + 40} 350 ${x} 500 C${x - 30} 650 ${x + 20} 750 ${x} 800`}
        fill="none"
        stroke="url(#blueGlow)"
        strokeWidth="0.3"
        opacity="0.03"
        style={{
          animation: `wave ${16 + i}s ease-in-out ${i * 1.5}s infinite`,
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); opacity: 1; }
          25% { opacity: 0.6; }
          50% { transform: translateX(8px); opacity: 1; }
          75% { opacity: 0.6; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <svg
        className="absolute top-0 -right-[10%] w-[115%] h-full"
        viewBox="0 0 800 800"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="blueGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a9eff" stopOpacity="0.6" />
            <stop offset="30%" stopColor="#2d7dd2" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1a6bc4" stopOpacity="1" />
            <stop offset="70%" stopColor="#2d7dd2" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4a9eff" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <path
          d="M350 0 C290 130 430 270 345 400 C270 530 430 660 350 800"
          fill="none"
          stroke="url(#blueGlow)"
          strokeWidth="8"
          opacity="0.04"
          style={{ filter: "blur(2px)", animation: "wave 18s ease-in-out infinite" }}
        />
        <path
          d="M352 0 C292 130 432 270 347 400 C272 530 432 660 352 800"
          fill="none"
          stroke="url(#blueGlow)"
          strokeWidth="1.5"
          opacity="0.05"
          style={{ animation: "wave 15s ease-in-out 1s infinite" }}
        />
        {contourLines}
      </svg>
    </div>
  );
};

export default ContourBackground;