import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getHeroKente } from '../../lib/kenteTexture'

const MAX_RIPPLES = 8

// The cloth is pinned along its top edge to a rod. Everything below hangs:
// motion grows with distance from the rod, like real drape.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uSize;
  uniform vec2 uMouse;
  uniform float uPush;
  uniform vec4 uRipples[${MAX_RIPPLES}];
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vDepth;

  vec3 clothPos(vec2 uv) {
    float hang = 1.0 - uv.y;
    float h = pow(hang, 1.1);
    float t = uTime;
    vec2 asp = vec2(uSize.x / uSize.y, 1.0);

    // Wind comes in gusts: its strength swells and eases on slow, uneven cycles.
    float gust = 0.78 + 0.22 * sin(t * 0.37) + 0.14 * sin(t * 0.91 + 1.7);

    // Waves roll across the cloth from left to right, growing toward the free hem.
    float w1 = sin(uv.x * 5.5 - t * 2.1 + uv.y * 1.5);
    float w2 = sin(uv.x * 11.0 - t * 3.3 + uv.y * 3.2 + 1.3);
    float w3 = sin(uv.y * 7.0 - t * 1.7 + uv.x * 2.0);
    float z = (w1 * 0.16 + w2 * 0.05 + w3 * 0.05) * h * gust;
    z += sin(uv.x * 19.0 + 1.3) * 0.015 * (0.25 + h); // resting pleats from the line

    // Touch ripples: rings spreading out from where the cloth was disturbed.
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 r = uRipples[i];
      float age = t - r.z;
      if (age > 0.0 && age < 5.0) {
        float d = length((uv - r.xy) * asp);
        z += r.w * sin(d * 34.0 - age * 7.0) * exp(-age * 1.1) * exp(-d * 4.0)
             * 0.05 * smoothstep(0.0, 0.3, age) * (0.35 + h);
      }
    }

    // The cursor presses the cloth away.
    float dm = length((uv - uMouse) * asp);
    z -= uPush * exp(-dm * dm / 0.012) * 0.22 * (0.3 + h);

    // The whole cloth swings, and the hem lifts as each billow passes, then settles.
    float sway = sin(t * 0.9) * 0.06 * h * h * gust + sin(uv.y * 3.0 - t * 1.4) * 0.03 * h;
    float lift = (abs(w1) * 0.06 + 0.03 * (0.5 + 0.5 * sin(t * 1.1 + uv.x * 4.0))) * h * h * gust;
    return vec3((uv.x - 0.5) * uSize.x + sway * uSize.y, (uv.y - 0.5) * uSize.y + lift * uSize.y, z * uSize.y * 0.6);
  }

  void main() {
    vUv = uv;
    vec3 p = clothPos(uv);
    vec3 px = clothPos(uv + vec2(0.004, 0.0));
    vec3 py = clothPos(uv + vec2(0.0, 0.004));
    vNormal = normalize(normalMatrix * normalize(cross(px - p, py - p)));
    vDepth = p.z;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vViewPos = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uRepeat;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vDepth;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    vec3 base;
    float fringe = 0.045;

    if (uv.y < fringe) {
      // Loose warp threads hanging below the hem.
      float thread = floor(uv.x * 220.0);
      float len = fringe * (0.45 + 0.55 * hash(thread));
      if (uv.y < fringe - len || fract(uv.x * 220.0) > 0.55) discard;
      base = texture2D(uMap, vec2(uv.x * uRepeat.x, fringe * uRepeat.y)).rgb * 0.85;
    } else {
      base = texture2D(uMap, uv * uRepeat).rgb;
    }

    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(vViewPos);
    vec3 L = normalize(vec3(-0.45, 0.65, 0.75));
    vec3 gold = vec3(1.0, 0.8, 0.25);

    float wrapLight = max((dot(N, L) + 0.4) / 1.4, 0.0);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 36.0) * 0.28;
    float sheen = pow(1.0 - max(dot(N, V), 0.0), 3.0);

    vec3 col = base * (0.42 + 0.8 * wrapLight);
    col += gold * spec + gold * sheen * 0.3;
    col *= clamp(0.96 + vDepth * 1.1, 0.7, 1.12); // folds that fall back sit in shadow
    gl_FragColor = vec4(col, 1.0);
  }
`

function Cloth({ compact, still }) {
  const { viewport, size } = useThree()
  const mat = useRef()
  const state = useRef({ push: 0, pushTarget: 0, mouse: new THREE.Vector2(0.5, 0.5), mouseTarget: new THREE.Vector2(0.5, 0.5), lastMove: -10, lastRipple: -10, lastRipplePos: new THREE.Vector2(-1, -1), idx: 0, lastAmbient: 0 })

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(getHeroKente())
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 8
    return t
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMap: { value: texture },
      uSize: { value: new THREE.Vector2(1, 1) },
      uRepeat: { value: new THREE.Vector2(1, 1) }, // one full cloth
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uPush: { value: 0 },
      uRipples: { value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, -100, 0)) },
    }),
    [texture],
  )

  // Size and place the cloth for the viewport: on the right on wide screens, full width on phones.
  const layout = useMemo(() => {
    const vw = viewport.width
    const vh = viewport.height
    const wide = vw / vh > 1.05
    const height = vh * (wide ? 0.86 : 0.52)
    const width = wide ? Math.min(height * 0.78, vw * 0.5) : vw * 0.9
    const x = wide ? vw / 2 - width / 2 - vw * 0.07 : 0
    // Tablet portrait: hang the rod just below the 76px header rather than 10% down, so the cloth starts higher.
    const tabletPortrait = !wide && size.width >= 768 && size.width <= 1024
    const top = vh / 2 - (tabletPortrait ? 80 * (vh / size.height) : vh * (wide ? 0.13 : 0.1))
    return { width, height, x, y: top - height / 2, top, wide }
  }, [viewport.width, viewport.height, size.width, size.height])

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, compact ? 90 : 160, compact ? 120 : 200), [compact])

  const addRipple = (uv, strength) => {
    const s = state.current
    const r = uniforms.uRipples.value[s.idx % MAX_RIPPLES]
    r.set(uv.x, uv.y, uniforms.uTime.value, strength)
    s.idx++
    s.lastRipple = uniforms.uTime.value
    s.lastRipplePos.copy(uv)
  }

  useFrame((_, delta) => {
    const s = state.current
    const u = uniforms
    u.uSize.value.set(layout.width, layout.height)
    // With reduced motion the cloth hangs still: time does not advance and nothing stirs it.
    if (still) return
    const t = (u.uTime.value += Math.min(delta, 0.05))
    if (t - s.lastMove > 1.2) s.pushTarget = 0
    s.push += (s.pushTarget - s.push) * Math.min(1, delta * 4)
    s.mouse.lerp(s.mouseTarget, Math.min(1, delta * 8))
    u.uPush.value = s.push
    u.uMouse.value.copy(s.mouse)
    // When nobody is touching, the cloth is occasionally stirred by a breath of air.
    if (t - s.lastMove > 4 && t - s.lastAmbient > 3.5) {
      s.lastAmbient = t
      addRipple(new THREE.Vector2(0.2 + Math.random() * 0.6, 0.25 + Math.random() * 0.5), 0.5)
    }
  })

  const onMove = (e) => {
    if (still || !e.uv) return
    const s = state.current
    const t = uniforms.uTime.value
    s.mouseTarget.copy(e.uv)
    s.pushTarget = 1
    s.lastMove = t
    if (s.lastRipplePos.distanceTo(e.uv) > 0.07 || t - s.lastRipple > 0.35) addRipple(e.uv, 0.8)
  }

  // The market line runs across the whole hero; the cloth is pegged to it.
  const lineLength = viewport.width * 1.2
  return (
    <group position={[layout.x, 0, 0]}>
      <mesh
        geometry={geometry}
        position={[0, layout.y, 0]}
        onPointerMove={onMove}
        onPointerDown={(e) => {
          if (still || !e.uv) return
          state.current.lastMove = uniforms.uTime.value
          addRipple(e.uv, 1.4)
        }}
        onPointerLeave={() => (state.current.pushTarget = 0)}
      >
        <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, layout.top + 0.012, 0.02]}>
        <mesh position={[-layout.x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.007, 0.007, lineLength, 8]} />
          <meshStandardMaterial color="#F6CF55" metalness={0.4} roughness={0.5} />
        </mesh>
        {[-0.42, -0.14, 0.14, 0.42].map((f) => (
          <mesh key={f} position={[f * layout.width, -0.03, 0.02]}>
            <boxGeometry args={[0.035, 0.12, 0.03]} />
            <meshStandardMaterial color="#E8B31A" metalness={0.3} roughness={0.45} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Reveal the cloth only once the canvas has its real size and has held it for a few frames.
// (A canvas starts at the browser default of 300px wide; revealing it then made the cloth jump.)
function ReadySignal({ container, onReady }) {
  const { size } = useThree()
  const frames = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    const el = container?.current
    const settled = el && Math.abs(size.width - el.clientWidth) < 2 && Math.abs(size.height - el.clientHeight) < 2
    frames.current = settled ? frames.current + 1 : 0
    if (frames.current >= 3) {
      done.current = true
      onReady?.()
    }
  })
  return null
}

export default function FabricCanvas({ eventSource, active, compact, still, onReady }) {
  // Pixel density is fixed for the life of the canvas: changing it mid-animation reallocates the canvas
  // and causes a one frame flash (this was the glitch about two seconds after load).
  const [dpr] = useState(() => Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5))
  return (
    <Canvas
      eventSource={eventSource}
      eventPrefix="client"
      frameloop={active ? 'always' : 'never'}
      dpr={dpr}
      camera={{ position: [0, 0, 5], fov: 35 }}
      gl={{ antialias: !compact, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[-3, 4, 5]} intensity={2.2} color="#FFE2A8" />
      <ReadySignal container={eventSource} onReady={onReady} />
      <Cloth compact={compact} still={still} />
    </Canvas>
  )
}
