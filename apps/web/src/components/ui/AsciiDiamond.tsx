"use client";
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AsciiRenderer } from '@react-three/drei';
import * as THREE from 'three';

function RotatingDiamond() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* 0 detail octahedron is a geometric diamond shape */}
      <octahedronGeometry args={[2.2, 0]} />
      <meshStandardMaterial color="white" roughness={0.5} metalness={0.8} />
    </mesh>
  );
}

export function AsciiDiamond() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60vw] pointer-events-none flex items-center justify-end z-[0]">
      <div 
        className="w-full h-full relative opacity-90 font-mono text-[10px] md:text-sm font-bold tracking-tight"
        style={{
          maskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)'
        }}
      >
        <div 
          className="w-full h-full flex items-center justify-center p-4 md:p-12 pr-12 md:pr-24"
          style={{
            background: 'linear-gradient(to right, #1bd668 0%, #7b2cbf 50%, #ffffff 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
            <pointLight position={[-10, -10, -10]} intensity={1} />
            <RotatingDiamond />
            <AsciiRenderer 
              fgColor="transparent"
              bgColor="transparent" 
              characters=" .:-+*=%@#" 
              invert={true}
              resolution={0.25}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
