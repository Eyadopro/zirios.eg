"use client";

import { Environment, Float, MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * Stand-in "product" mesh. Swap the geometry group below for a
 * GLTF import (useGLTF) of the real ZIRIOS hoodie/shoe model once
 * the asset pipeline (Cloudinary/S3 -> /public/models) is wired up.
 */
function FloatingProduct() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ mouse, clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = clock.getElapsedTime() * 0.15 + mouse.x * 0.3;
    mesh.current.rotation.x = mouse.y * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={mesh} castShadow position={[0, 0.6, 0]}>
        <torusKnotGeometry args={[0.9, 0.28, 200, 32]} />
        <meshPhysicalMaterial
          color="#111114"
          metalness={0.9}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#ff1a2e"
          emissiveIntensity={0.08}
        />
      </mesh>
    </Float>
  );
}

function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        mirror={0}
        roughness={0.9}
        depthScale={1}
        minDepthThreshold={0.85}
        color="#050506"
        metalness={0.6}
      />
    </mesh>
  );
}

export function HeroScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.8, 5.5], fov: 40 }}
      className="!absolute inset-0"
      dpr={[1, 1.75]}
    >
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 4, 14]} />

      <ambientLight intensity={0.15} />
      <spotLight
        position={[3, 5, 3]}
        angle={0.35}
        penumbra={1}
        intensity={3}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[-3, 1, -2]} intensity={2} color="#ff1a2e" />

      <FloatingProduct />
      <ReflectiveFloor />
      <Sparkles count={80} scale={6} size={2} speed={0.3} color="#ff1a2e" opacity={0.4} />

      <Environment preset="city" />
    </Canvas>
  );
}
