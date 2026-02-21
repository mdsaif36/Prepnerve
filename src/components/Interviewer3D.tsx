import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Define the states for type safety
export type InterviewState = 'idle' | 'preparing' | 'asking' | 'listening' | 'thinking' | 'finished';

interface InterviewerProps {
  interviewState: InterviewState;
}

const AbstractInterviewer = ({ interviewState }: InterviewerProps) => {
  // Refs for the main mesh and its material for animation
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const wireframeMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current || !wireframeMaterialRef.current) return;

    // --- Animation Parameters based on State ---
    let rotationSpeed = 0.002;
    let pulseSpeed = 1.5;
    let baseIntensity = 0.8;
    let targetColor = new THREE.Color(0x00eaff); // Default Cyan

    switch (interviewState) {
      case 'thinking': // Fast spin, intense orange pulse
        rotationSpeed = 0.03;
        pulseSpeed = 8;
        baseIntensity = 2.0;
        targetColor.setHex(0xffaa00); // Orange
        break;
      case 'asking': // Moderate spin, speaking pulse
        rotationSpeed = 0.008;
        pulseSpeed = 4;
        baseIntensity = 1.2;
        targetColor.setHex(0x00eaff); // Cyan
        break;
      case 'listening': // Slow, calm breathing pulse
        rotationSpeed = 0.001;
        pulseSpeed = 0.8;
        baseIntensity = 0.4;
        targetColor.setHex(0x00ff88); // Green
        break;
      case 'preparing':
      case 'finished':
        rotationSpeed = 0.004;
        pulseSpeed = 2;
        baseIntensity = 0.6;
        targetColor.setHex(0xbd00ff); // Purple
        break;
      default: // 'idle'
        rotationSpeed = 0.003;
        pulseSpeed = 1.5;
        baseIntensity = 0.8;
        targetColor.setHex(0x00eaff); // Cyan
    }

    // --- Apply Animations ---
    
    // 1. Rotation
    meshRef.current.rotation.y += rotationSpeed;
    // Add a slight, slow bobbing motion
    meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;

    // 2. Color Transition (Smooth lerp)
    materialRef.current.emissive.lerp(targetColor, 0.1);
    wireframeMaterialRef.current.emissive.lerp(targetColor, 0.1);

    // 3. Pulse Effect (Emissive Intensity)
    const time = state.clock.getElapsedTime();
    // Sine wave oscillating between 0 and 1
    const pulse = (Math.sin(time * pulseSpeed) + 1) * 0.5; 
    const finalIntensity = baseIntensity + (pulse * 0.5);
    
    materialRef.current.emissiveIntensity = finalIntensity;
    wireframeMaterialRef.current.emissiveIntensity = finalIntensity * 1.5; // Wireframe is brighter
  });

  return (
    <group ref={meshRef}>
      {/* Inner glowing core - Faceted "Head" shape */}
      <mesh>
        {/* Icosahedron gives a nice faceted, low-poly look */}
        <icosahedronGeometry args={[1.8, 1]} /> 
        <meshPhysicalMaterial 
          ref={materialRef}
          color="#ffffff" // Base color (mostly affected by emissive)
          emissive="#00eaff" // Initial glow color
          emissiveIntensity={1}
          roughness={0.2} // Makes it look slightly polished
          metalness={0.8} // Gives a metallic, tech feel
          transparent
          opacity={0.9}
          transmission={0.2} // Adds a slight glass-like quality
          thickness={0.5}
        />
      </mesh>

      {/* Outer Wireframe Overlay - Adds technical detail */}
      <mesh>
        <icosahedronGeometry args={[1.85, 1]} /> {/* Slightly larger */}
        <meshStandardMaterial
          ref={wireframeMaterialRef}
          color="#ffffff"
          emissive="#00eaff"
          emissiveIntensity={1.5}
          wireframe={true} // Key prop for the wireframe look
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
};

// Main Component
const Interviewer3D = ({ className, interviewState = 'idle' }: { className?: string, interviewState?: InterviewState }) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        {/* Lighting setup for a dramatic, techy feel */}
        <ambientLight intensity={0.3} />
        {/* Main key light matching the theme */}
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00eaff" />
        {/* Fill light from the opposite side for depth */}
        <pointLight position={[-10, -5, -10]} intensity={0.8} color="#bd00ff" />
        {/* Rim light to highlight edges */}
        <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} />
        
        <AbstractInterviewer interviewState={interviewState} />
      </Canvas>
    </div>
  );
};

export default Interviewer3D;