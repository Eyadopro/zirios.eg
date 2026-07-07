"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 140;

function ReactiveField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 6 - 2,
        speed: Math.random() * 0.4 + 0.1,
        scale: Math.random() * 0.35 + 0.08,
        offset: Math.random() * Math.PI * 2,
      })),
    []
  );

  useFrame(({ clock, pointer }) => {
    mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, pointer.x, 0.05);
    mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, pointer.y, 0.05);

    const t = clock.getElapsedTime();
    seeds.forEach((s, i) => {
      const px = mouse.current.x * viewport.width * 0.5;
      const py = mouse.current.y * viewport.height * 0.5;
      const dx = s.x - px;
      const dy = s.y - py;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const push = Math.max(0, 1 - dist / 4) * 0.6;

      dummy.position.set(
        s.x + Math.sin(t * s.speed + s.offset) * 0.3 + (dx / dist) * push,
        s.y + Math.cos(t * s.speed + s.offset) * 0.2 + (dy / dist) * push,
        s.z
      );
      dummy.rotation.set(t * s.speed, t * s.speed * 0.6, 0);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (meshRef.current) meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#ff1a2e" transparent opacity={0.35} wireframe />
    </instancedMesh>
  );
}

export function ReactiveBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-70">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#050506"]} />
        <ReactiveField />
      </Canvas>
    </div>
  );
}
