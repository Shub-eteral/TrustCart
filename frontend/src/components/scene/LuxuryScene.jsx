import { ContactShadows, Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function ProductCore({ scrollProgress }) {
  const group = useRef(null);
  const knot = useRef(null);
  const crystal = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, time * 0.18 + scrollProgress * 1.2, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, scrollProgress * 0.35, 0.04);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(time * 0.7) * 0.12 - scrollProgress * 0.35, 0.04);
    knot.current.rotation.z += delta * 0.32;
    crystal.current.rotation.x -= delta * 0.4;
    crystal.current.rotation.y += delta * 0.28;
  });

  return (
    <group ref={group} scale={1 + scrollProgress * 0.12}>
      <Float speed={1.5} rotationIntensity={0.22} floatIntensity={0.35}>
        <mesh ref={knot} castShadow>
          <torusKnotGeometry args={[1.25, 0.34, 180, 32]} />
          <meshPhysicalMaterial color="#d9b36c" metalness={0.76} roughness={0.14} clearcoat={1} clearcoatRoughness={0.08} iridescence={0.32} iridescenceIOR={1.45} />
        </mesh>
        <mesh ref={crystal} scale={0.66}>
          <icosahedronGeometry args={[1, 2]} />
          <meshPhysicalMaterial color="#f1d7a1" transmission={0.82} thickness={1.1} ior={1.45} roughness={0.08} clearcoat={1} iridescence={0.24} transparent opacity={0.8} />
        </mesh>
      </Float>
      <mesh rotation={[Math.PI / 2.8, 0.2, 0.1]}>
        <torusGeometry args={[2.05, 0.012, 12, 160]} />
        <meshBasicMaterial color="#ff795e" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[0.4, 1.1, 0]} scale={1.22}>
        <torusGeometry args={[2.05, 0.008, 12, 160]} />
        <meshBasicMaterial color="#d9f06b" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function SceneRig({ scrollProgress }) {
  const rig = useRef(null);
  useFrame((state) => {
    const x = state.pointer.x * 0.12;
    const y = state.pointer.y * 0.08;
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, -y, 0.04);
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, x, 0.04);
  });

  return (
    <group ref={rig}>
      <ProductCore scrollProgress={scrollProgress} />
      <Sparkles count={180} scale={[9, 6, 5]} size={1.6} speed={0.25} color="#f0d6a0" opacity={0.58} noise={1.8} />
    </group>
  );
}

export default function LuxuryScene({ scrollProgress }) {
  return (
    <Canvas camera={{ position: [0, 0, 7.5], fov: 38 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }} shadows>
      <color attach="background" args={["#0c0b10"]} />
      <fog attach="fog" args={["#0c0b10", 6, 15]} />
      <ambientLight intensity={1.2} color="#f5e8d0" />
      <directionalLight position={[4, 5, 5]} intensity={3.2} color="#fff1d2" castShadow />
      <spotLight position={[4, 1, 4]} intensity={85} angle={0.34} penumbra={0.9} distance={11} color="#ff735b" />
      <spotLight position={[-4, -1, 3]} intensity={70} angle={0.38} penumbra={1} distance={10} color="#b9d95c" />
      <pointLight position={[0, -2, 2]} intensity={18} distance={8} color="#9270ff" />
      <SceneRig scrollProgress={scrollProgress} />
      <ContactShadows position={[0, -2.2, 0]} opacity={0.48} scale={7} blur={2.8} far={5} color="#000000" />
    </Canvas>
  );
}
