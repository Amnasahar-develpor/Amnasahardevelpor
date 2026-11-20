import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import type { AssistantMode } from '../hooks/useAssistant';

interface CharacterProps {
  mode: AssistantMode;
  muted: boolean;
}

const skin = '#eab99f';
const skinShade = '#dda98f';
const lavender = '#b88bec';
const lavenderLight = '#d3b4f7';
const lavenderDark = '#9a68dc';

function Flower({ scale = 1, color = '#f7d6ff' }: { scale?: number; color?: string }) {
  return (
    <group scale={scale}>
      {Array.from({ length: 5 }).map((_, index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.035, Math.sin(angle) * 0.035, 0]} scale={[1, 0.75, 0.45]}>
            <sphereGeometry args={[0.035, 10, 8]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.018, 10, 8]} />
        <meshStandardMaterial color="#ffe4a3" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Sparkle({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[0, 0, 0]}>
        <planeGeometry args={[0.09, 0.014]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.09, 0.014]} />
        <meshBasicMaterial color="#e9d5ff" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Character({ mode, muted }: CharacterProps) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const fingers = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const mouth = useRef<THREE.Mesh>(null);
  const smile = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);

  const scarfFolds = useMemo(() => {
    const tube = (points: number[][], radius: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
        40,
        radius,
        8,
        false,
      );
    return [
      tube([[0.44, 1.02, -0.16], [0.74, 0.52, -0.22], [0.8, -0.1, -0.12], [0.62, -0.82, 0.04]], 0.085),
      tube([[-0.44, 1.02, -0.16], [-0.74, 0.52, -0.22], [-0.8, -0.1, -0.12], [-0.64, -0.82, 0.04]], 0.085),
      tube([[0, 1.08, -0.28], [0.32, 0.74, -0.44], [0.38, 0.14, -0.4], [0.22, -0.58, -0.26]], 0.06),
    ];
  }, []);

  const eyebrowCurves = useMemo(() => [-0.22, 0.22].map((x) =>
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(x - 0.075, 0.18, 0.7),
        new THREE.Vector3(x, 0.205, 0.73),
        new THREE.Vector3(x + 0.075, 0.18, 0.7),
      ]),
      16,
      0.014,
      6,
      false,
    ),
  ), []);

  const skirtFlowers = useMemo(() => {
    const list: { position: [number, number, number]; scale: number; color: string }[] = [];
    const rows = [
      { y: -0.5, radius: 0.62, count: 7 },
      { y: -0.9, radius: 0.75, count: 8 },
      { y: -1.3, radius: 0.87, count: 9 },
      { y: -1.62, radius: 0.96, count: 10 },
    ];
    rows.forEach((row, rowIndex) => {
      for (let index = 0; index < row.count; index += 1) {
        const angle = (index / row.count) * Math.PI * 2 + rowIndex * 0.32;
        list.push({
          position: [Math.sin(angle) * row.radius, row.y, Math.cos(angle) * row.radius],
          scale: 0.75 + ((index + rowIndex) % 3) * 0.18,
          color: index % 3 === 0 ? '#ffe0f2' : '#f6d0ff',
        });
      }
    });
    return list;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (root.current) root.current.position.y = Math.sin(t * 1.15) * 0.04;
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.55) * 0.1;
      head.current.rotation.z = Math.sin(t * 0.72) * 0.025 + (mode === 'listening' ? Math.sin(t * 2) * 0.04 : 0);
      head.current.rotation.x = mode === 'listening' ? Math.sin(t * 2.4) * 0.05 : Math.sin(t * 0.9) * 0.015;
    }
    if (eyes.current) {
      const blink = t % 4.2 > 4.02 ? 0.1 : 1;
      eyes.current.scale.y += (blink - eyes.current.scale.y) * 0.28;
    }
    if (mouth.current) {
      const beat = Math.abs(Math.sin(t * 10.5)) * 0.7 + Math.abs(Math.sin(t * 6.1)) * 0.3;
      const open = mode === 'speaking' ? 1 + beat * 3.4 : 1;
      const wide = mode === 'speaking' ? 1 + beat * 0.22 : 1;
      mouth.current.scale.y += (open - mouth.current.scale.y) * 0.4;
      mouth.current.scale.x += (wide - mouth.current.scale.x) * 0.3;
    }
    if (smile.current) {
      const target = mode === 'speaking' || mode === 'waving' ? 0.25 : 1;
      smile.current.scale.y += (target - smile.current.scale.y) * 0.18;
    }
    if (rightArm.current) {
      const target = mode === 'waving'
        ? -2.25 + Math.sin(t * 8.5) * 0.32
        : mode === 'speaking'
          ? -0.45 + Math.sin(t * 3.1) * 0.22
          : -0.12 + Math.sin(t * 1.1) * 0.05;
      rightArm.current.rotation.z += (target - rightArm.current.rotation.z) * 0.16;
      rightArm.current.rotation.x = mode === 'waving' ? -0.18 : Math.sin(t * 1.4) * 0.03;
    }
    if (fingers.current) {
      const curl = mode === 'waving' ? 0.2 + Math.sin(t * 8.5) * 0.08 : 0.05;
      fingers.current.rotation.x += (curl - fingers.current.rotation.x) * 0.2;
    }
    if (leftArm.current) {
      const target = mode === 'speaking'
        ? 0.36 - Math.sin(t * 2.5) * 0.17
        : 0.18 + Math.sin(t * 1.05 + 1) * 0.05;
      leftArm.current.rotation.z += (target - leftArm.current.rotation.z) * 0.12;
    }
    if (particles.current) {
      particles.current.rotation.y = t * 0.09;
      particles.current.position.y = Math.sin(t * 0.8) * 0.06;
    }
    if (halo.current) halo.current.rotation.z = t * 0.12;
  });

  return (
    <group ref={root} position={[0, -0.12, 0]} scale={1.06}>
      <mesh ref={halo} position={[0, 0.5, -0.9]}>
        <torusGeometry args={[1.34, 0.006, 8, 96]} />
        <meshBasicMaterial color="#d9b8ff" transparent opacity={0.6} />
      </mesh>
      <group ref={particles}>
        {Array.from({ length: 16 }).map((_, index) => {
          const angle = (index / 16) * Math.PI * 2;
          const radius = 1.3 + (index % 3) * 0.17;
          return (
            <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(angle * 1.7) * 1.2, -0.55 + Math.sin(angle) * 0.3]}>
              <sphereGeometry args={[index % 4 === 0 ? 0.045 : 0.024, 10, 10]} />
              <meshBasicMaterial color={index % 2 ? '#e9d5ff' : '#ffffff'} transparent opacity={0.85} />
            </mesh>
          );
        })}
      </group>

      {/* Soft floating sparkles and light ribbons */}
      <Sparkle position={[-1.35, 0.95, 0.2]} scale={1.1} />
      <Sparkle position={[1.42, 1.15, 0.1]} scale={0.85} />
      <Sparkle position={[-1.1, -0.7, 0.3]} scale={0.7} />
      <Sparkle position={[1.25, -0.45, 0.35]} scale={1} />
      <Sparkle position={[0.35, 1.55, -0.2]} scale={0.6} />
      <mesh position={[0, 0.1, -1]} rotation={[0, 0, 0.4]}>
        <torusGeometry args={[1.5, 0.004, 6, 80, Math.PI * 1.1]} />
        <meshBasicMaterial color="#d8b4fe" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, -0.2, -1]} rotation={[0, 0, -0.6]}>
        <torusGeometry args={[1.7, 0.003, 6, 80, Math.PI * 0.8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.28} />
      </mesh>

      {/* Floral lavender dress */}
      <mesh position={[0, -1.02, 0]} castShadow>
        <cylinderGeometry args={[0.48, 1.0, 1.55, 48]} />
        <meshPhysicalMaterial color={lavender} roughness={0.72} clearcoat={0.28} clearcoatRoughness={0.5} sheen={0.7} sheenColor="#f3dfff" />
      </mesh>
      <mesh position={[0, -1.02, 0.02]}>
        <cylinderGeometry args={[0.49, 1.01, 1.5, 48, 1, true, -0.5, 1]} />
        <meshStandardMaterial color={lavenderLight} roughness={0.9} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.24, 0]}>
        <cylinderGeometry args={[0.45, 0.5, 0.62, 40]} />
        <meshPhysicalMaterial color={lavenderLight} roughness={0.68} clearcoat={0.22} sheen={0.6} sheenColor="#ffffff" />
      </mesh>
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[0.52, 0.53, 0.09, 40]} />
        <meshStandardMaterial color="#f6e7ff" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.52, 0.52]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.16, 0.16, 0.04]} />
        <meshStandardMaterial color="#c084fc" roughness={0.6} />
      </mesh>
      {skirtFlowers.map((flower, index) => (
        <group key={index} position={flower.position} rotation={[0, Math.atan2(flower.position[0], flower.position[2]), 0]}>
          <Flower scale={flower.scale} color={flower.color} />
        </group>
      ))}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.18, 0.21, 0.3, 24]} />
        <meshStandardMaterial color={skin} roughness={0.85} />
      </mesh>

      {/* Right arm — waving and gestures */}
      <group ref={rightArm} position={[0.58, -0.12, 0]}>
        <mesh position={[0, -0.34, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.5, 8, 16]} />
          <meshStandardMaterial color={lavenderLight} roughness={0.85} />
        </mesh>
        <group position={[0, -0.66, 0]}>
          <mesh position={[0, -0.23, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.34, 8, 16]} />
            <meshStandardMaterial color={skin} roughness={0.82} />
          </mesh>
          <mesh position={[0, -0.46, 0]}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color={skin} roughness={0.8} />
          </mesh>
          <group ref={fingers} position={[0, -0.54, 0]}>
            {[-0.075, -0.025, 0.025, 0.075].map((x) => (
              <mesh key={x} position={[x, -0.07, 0]}>
                <capsuleGeometry args={[0.022, 0.11, 4, 8]} />
                <meshStandardMaterial color={skin} roughness={0.8} />
              </mesh>
            ))}
            <mesh position={[-0.11, -0.02, 0.04]} rotation={[0, 0, -0.9]}>
              <capsuleGeometry args={[0.025, 0.09, 4, 8]} />
              <meshStandardMaterial color={skin} roughness={0.8} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Left arm — holds a small notebook */}
      <group ref={leftArm} position={[-0.58, -0.12, 0]}>
        <mesh position={[0, -0.34, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.5, 8, 16]} />
          <meshStandardMaterial color={lavenderLight} roughness={0.85} />
        </mesh>
        <group position={[0, -0.66, 0]}>
          <mesh position={[0, -0.23, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.34, 8, 16]} />
            <meshStandardMaterial color={skin} roughness={0.82} />
          </mesh>
          <mesh position={[0, -0.46, 0]}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color={skin} roughness={0.8} />
          </mesh>
          <group position={[0.12, -0.3, 0.16]} rotation={[0.2, -0.3, 0.12]}>
            <mesh>
              <boxGeometry args={[0.34, 0.44, 0.055]} />
              <meshStandardMaterial color="#8b5cf6" roughness={0.65} />
            </mesh>
            <mesh position={[0, 0, 0.032]}>
              <planeGeometry args={[0.3, 0.4]} />
              <meshStandardMaterial color="#f7f2ff" roughness={0.9} />
            </mesh>
            <group position={[0, 0.05, 0.036]} scale={0.8}>
              <Flower color="#c084fc" />
            </group>
          </group>
        </group>
      </group>

      {/* Head, hijab and face */}
      <group ref={head} position={[0, 0.62, 0]}>
        <mesh position={[0, 0.02, -0.12]} scale={[1.02, 1.06, 1]} castShadow>
          <sphereGeometry args={[0.76, 48, 48]} />
          <meshPhysicalMaterial color={lavenderDark} roughness={0.78} sheen={0.8} sheenColor="#e9d5ff" />
        </mesh>
        <mesh position={[0, 0.1, -0.02]}>
          <sphereGeometry args={[0.77, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshPhysicalMaterial color={lavender} roughness={0.74} sheen={0.75} sheenColor="#f3dfff" side={THREE.DoubleSide} />
        </mesh>
        {scarfFolds.map((geometry, index) => (
          <mesh key={index} geometry={geometry}>
            <meshStandardMaterial color={index === 1 ? lavenderLight : '#a97ae5'} roughness={0.92} />
          </mesh>
        ))}
        <group position={[0.55, 0.5, 0.28]} rotation={[0, 0, -0.3]}>
          <Flower scale={0.9} color="#f9d9ff" />
        </group>

        <mesh position={[0, -0.05, 0.21]} scale={[0.6, 0.68, 0.57]} castShadow>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial color={skin} roughness={0.78} />
        </mesh>
        {[-0.58, 0.58].map((x) => (
          <mesh key={x} position={[x, -0.1, 0.18]}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color={skinShade} roughness={0.85} />
          </mesh>
        ))}

        {/* Expressive eyes */}
        <group ref={eyes}>
          {[-0.22, 0.22].map((x) => (
            <group key={x} position={[x, 0.04, 0.69]}>
              <mesh scale={[1.18, 1.35, 0.55]}>
                <sphereGeometry args={[0.07, 20, 20]} />
                <meshStandardMaterial color="#fffdfb" roughness={0.35} />
              </mesh>
              <mesh position={[0, -0.005, 0.048]} scale={[1, 1.08, 0.5]}>
                <sphereGeometry args={[0.047, 20, 20]} />
                <meshStandardMaterial color="#5b3a2e" roughness={0.3} />
              </mesh>
              <mesh position={[0, -0.005, 0.07]} scale={[0.55, 0.6, 0.4]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial color="#1c1420" />
              </mesh>
              <mesh position={[-0.016, 0.022, 0.085]}>
                <sphereGeometry args={[0.012, 10, 10]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>
        {eyebrowCurves.map((geometry, index) => (
          <mesh key={index} geometry={geometry}>
            <meshStandardMaterial color="#4b3345" roughness={0.85} />
          </mesh>
        ))}

        {/* Nose, smile and speaking mouth */}
        <mesh position={[0, -0.11, 0.77]} scale={[0.055, 0.075, 0.07]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={skinShade} roughness={0.8} />
        </mesh>
        <group ref={smile}>
          <mesh position={[0, -0.32, 0.72]} scale={[1, 1, 1]}>
            <torusGeometry args={[0.1, 0.012, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#a35068" roughness={0.6} />
          </mesh>
        </group>
        <mesh ref={mouth} position={[0, -0.34, 0.74]}>
          <sphereGeometry args={[0.11, 24, 16]} />
          <meshStandardMaterial color={muted ? '#b47a8b' : '#9c4f68'} roughness={0.55} />
        </mesh>
        {[-0.38, 0.38].map((x) => (
          <mesh key={x} position={[x, -0.2, 0.65]} scale={[1, 0.6, 0.3]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#e89ba0" transparent opacity={0.3} />
          </mesh>
        ))}
        {[-0.3, 0.3].map((x) => (
          <mesh key={x} position={[x, 0.06, 0.71]} rotation={[0, 0, x < 0 ? -0.6 : 0.6]}>
            <coneGeometry args={[0.018, 0.075, 8]} />
            <meshStandardMaterial color="#3a2735" roughness={0.7} />
          </mesh>
        ))}
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, -0.18, 0.2]}>
            <sphereGeometry args={[0.032, 12, 12]} />
            <meshStandardMaterial color="#f6d68a" metalness={0.65} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, -0.56, 0.42]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.13, 0.01, 8, 32]} />
          <meshStandardMaterial color="#f6d68a" metalness={0.65} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

export default function Assistant3D({ mode, muted }: CharacterProps) {
  const [webglAvailable] = useState(() => {
    try {
      const canvas = document.createElement('canvas');
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  });

  if (!webglAvailable) {
    return (
      <div className="character-fallback" role="img" aria-label="3D assistant preview">
        <div className="character-fallback__orb"><span>AS</span></div>
        <p>3D preview needs WebGL support in this browser.</p>
      </div>
    );
  }

  return (
    <div className="character-canvas" aria-label="Animated 3D virtual assistant">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.15, 4.3], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={1.3} />
        <directionalLight position={[3, 4, 5]} intensity={2.4} castShadow />
        <pointLight position={[-3, 1.5, 2]} color="#d8b4fe" intensity={22} distance={9} />
        <pointLight position={[2, -1, 3]} color="#ffffff" intensity={10} distance={8} />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={5} color="#ffffff" position={[0, 5, -8]} scale={[10, 10, 1]} />
          <Lightformer form="rect" intensity={3.5} color="#c084fc" position={[-5, 1, -2]} scale={[6, 8, 1]} />
          <Lightformer form="rect" intensity={3} color="#a78bfa" position={[5, 1, 2]} scale={[6, 8, 1]} />
          <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, -3, 2]} scale={4} />
        </Environment>
        <ContactShadows position={[0, -1.78, 0]} opacity={0.42} scale={5} blur={2.6} far={4} color="#5b21b6" />
        <Character mode={mode} muted={muted} />
      </Canvas>
    </div>
  );
}
