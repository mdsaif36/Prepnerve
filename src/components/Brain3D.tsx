import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { toast } from "sonner";

type InterviewState = 'idle' | 'preparing' | 'asking' | 'listening' | 'thinking' | 'finished';

const QUOTES = [
  "💡 Consistency is the algorithm for success.",
  "🚀 Every bug you fix is a level up in mastery.",
  "⚡ Your dream job is just one interview away.",
  "🔥 Code implies logic, but System Design implies vision.",
  "💎 Diamonds are formed under pressure. So are Senior Engineers.",
  "🧠 Debug with patience, code with passion.",
  "🌐 You are building the future, one line at a time.",
  "🛡️ Rejection is just redirection to a better offer.",
  "⚔️ Battle in the arena today, lead the industry tomorrow.",
  "🌟 1% better every day compounds to 37x better in a year."
];

interface BrainProps {
  interviewState: InterviewState;
  interactive?: boolean;
}

const GeometricBrain = ({ interviewState, interactive }: BrainProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    // --- 1. ROTATION LOGIC ---
    let rotationSpeed = 0.005;
    let pulseSpeed = 2;
    let baseIntensity = 0.6;

    if (interactive && hovered) {
        rotationSpeed = 0.02; // Spin faster on hover
        baseIntensity = 1.5;
    }

    switch (interviewState) {
      case 'thinking': rotationSpeed = 0.05; pulseSpeed = 10; baseIntensity = 2; break;
      case 'asking': rotationSpeed = 0.01; pulseSpeed = 5; baseIntensity = 1.2; break;
      case 'listening': rotationSpeed = 0.002; pulseSpeed = 1; baseIntensity = 0.3; break;
    }

    meshRef.current.rotation.y += rotationSpeed;
    if (interactive) meshRef.current.rotation.x += rotationSpeed * 0.5;

    // --- 2. PULSE EFFECT ---
    const time = state.clock.getElapsedTime();
    const pulse = (Math.sin(time * pulseSpeed) + 1) * 0.5;
    materialRef.current.emissiveIntensity = baseIntensity + (pulse * 0.5);
    
    // --- 3. COLOR SHIFT ---
    if (interactive && hovered) {
       materialRef.current.emissive.setHex(0xff00ff); // Purple on hover
    } else if (interviewState === 'thinking') {
      materialRef.current.emissive.setHex(0xffaa00); // Orange
    } else if (interviewState === 'listening') {
      materialRef.current.emissive.setHex(0x00ff88); // Green
    } else {
      materialRef.current.emissive.setHex(0x00eaff); // Base Cyan
    }
  });

  const handleClick = (e: any) => {
    if (!interactive) return;
    e.stopPropagation();
    
    // Scale Bump Animation
    if (meshRef.current) {
        meshRef.current.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => {
            if (meshRef.current) meshRef.current.scale.set(1, 1, 1);
        }, 150);
    }

    // Toast Quote
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    toast(randomQuote, {
        description: "System Message",
        style: { background: "#0a0a0a", border: "1px solid #333", color: "#fff" }
    });
  };

  return (
    <mesh 
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        className={interactive ? "cursor-pointer" : ""}
    >
      <icosahedronGeometry args={[2.2, 1]} /> 
      <meshStandardMaterial 
        ref={materialRef}
        transparent 
        side={THREE.DoubleSide}
        emissive="#00eaff"
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
        flatShading={true}
      />
    </mesh>
  );
};

const Brain3D = ({ className, interviewState = 'idle', interactive = false }: { className?: string, interviewState?: InterviewState, interactive?: boolean }) => {
  return (
    <div className={className}>
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ 
            powerPreference: "high-performance",
            preserveDrawingBuffer: true
        }}
        // ✅ FIXED: Handle Context Loss to prevent crash
        onCreated={({ gl }) => {
            const handleContextLost = (event: Event) => {
                event.preventDefault();
                console.warn("WebGL Context Lost - Attempting to restore...");
            };
            gl.domElement.addEventListener("webglcontextlost", handleContextLost, false);
            
            // Clean up listener when component unmounts
            return () => {
                gl.domElement.removeEventListener("webglcontextlost", handleContextLost);
            };
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00eaff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#bd00ff" />
        <GeometricBrain interviewState={interviewState} interactive={interactive} />
      </Canvas>
    </div>
  );
};

export default Brain3D;