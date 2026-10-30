import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { generate3DHeartParticles, type HeartParticleData3D } from '../utils/heartGeometry3D';
import { soundManager } from '../utils/audio';

interface ThreeParticleHeartProps {
  interactive?: boolean;
}

interface FloatingMiniHeart {
  mesh: THREE.Points;
  vy: number;
  vx: number;
  vz: number;
  rotSpeedX: number;
  rotSpeedY: number;
  life: number;
  maxLife: number;
}

export const ThreeParticleHeart: React.FC<ThreeParticleHeartProps> = ({
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

  const animationStateRef = useRef<{
    burstActive: boolean;
    burstTime: number;
    mouse: { x: number; y: number; targetX: number; targetY: number };
    miniHearts: FloatingMiniHeart[];
  }>({
    burstActive: false,
    burstTime: 0,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    miniHearts: [],
  });

  const triggerBurstRef = useRef<((worldX?: number, worldY?: number) => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 46);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1.0);
    container.appendChild(renderer.domElement);

    // 2. Main 3D Heart Group
    const heartGroup = new THREE.Group();

    // Responsive scaling and positioning:
    // Raw heart width is ~30.5 units (-15.2 to +15.2) and height is ~25.7 units.
    // Visible height in 3D units at z=46 is ~33.48.
    // We scale desktop to ~385px (well inside requested 340-430px range)
    // and mobile to ~280px with guaranteed 120px+ clean gap above bottom names.
    const updateHeartTransform = (w: number, h: number) => {
      const isMobile = w < 640;
      const visibleHeight3D = 2 * Math.tan((40 * Math.PI / 180) / 2) * 46;
      const pxPerUnit = h / visibleHeight3D;

      const targetPxWidth = isMobile ? Math.min(275, w * 0.74) : 385;
      const targetUnitWidth = targetPxWidth / pxPerUnit;
      const scale = targetUnitWidth / 30.5;

      heartGroup.scale.set(scale, scale, scale);

      // Elevated vertical position leaves generous gap above names
      const elevatedY = isMobile ? 3.6 : 2.8;
      heartGroup.position.set(0, elevatedY, 0);
    };

    updateHeartTransform(width, height);
    scene.add(heartGroup);

    // 3. Generate 3D Volumetric Heart Particle Cloud
    const isMobileInitial = width < 640;
    const particleCount = isMobileInitial ? 3200 : 4800;
    const heartData: HeartParticleData3D = generate3DHeartParticles(particleCount);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(heartData.positions, 3));
    geometry.setAttribute('aParticleColor', new THREE.BufferAttribute(heartData.colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(heartData.sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(heartData.phases, 1));
    geometry.setAttribute('aLayer', new THREE.BufferAttribute(heartData.layerTypes, 1));
    geometry.setAttribute('aOriginalPos', new THREE.BufferAttribute(heartData.originalPositions, 3));

    // Custom star texture
    const createCircleTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(125, 211, 252, 0.8)');
      grad.addColorStop(0.6, 'rgba(0, 180, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(c);
    };

    const starTexture = createCircleTexture();

    // 4. Custom Shader for Volumetric 3D Particles
    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uBurstProgress: { value: 0 },
        uBreath: { value: 0 },
        uBurstCenter: { value: new THREE.Vector3(0, 0, 0) },
        uStarTexture: { value: starTexture },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uBurstProgress;
        uniform float uBreath;
        uniform vec3 uBurstCenter;

        attribute float aSize;
        attribute float aPhase;
        attribute float aLayer;
        attribute vec3 aOriginalPos;
        attribute vec3 aParticleColor;

        varying vec3 vColor;
        varying float vAlpha;
        varying float vDepth;

        void main() {
          // Subtle organic breathing oscillation
          float breathScale = 1.0 + uBreath * 0.024;
          vec3 pos = aOriginalPos * breathScale;

          // Organic 3D shimmer and micro-drifting
          pos.x += sin(uTime * 1.5 + aPhase) * 0.12;
          pos.y += cos(uTime * 1.3 + aPhase * 1.1) * 0.12;
          pos.z += sin(uTime * 1.2 + aPhase * 0.8) * 0.12;

          // Controlled 3D outward burst wave
          if (uBurstProgress > 0.0) {
            vec3 burstVector = pos - uBurstCenter + vec3(0.001);
            vec3 burstDir = normalize(burstVector);
            float dist = length(burstVector);
            float wave = sin(uBurstProgress * 3.14159) * exp(-uBurstProgress * 2.5);
            float force = (1.0 / (dist * 0.06 + 1.0)) * 10.0 * wave;
            pos += burstDir * force;
          }

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // True perspective depth sizing: foreground particles are crisper
          float depthFactor = (46.0 / -mvPosition.z);
          float shimmer = 0.90 + 0.10 * sin(uTime * 2.6 + aPhase);
          gl_PointSize = aSize * depthFactor * shimmer * 3.4;

          vColor = aParticleColor;
          vDepth = -mvPosition.z;

          // Depth-based subtle luminous brightness (crisp foreground, soft background)
          float depthBrightness = clamp(1.0 - (mvPosition.z + 46.0) * 0.03, 0.70, 1.10);
          vAlpha = depthBrightness * (0.85 + 0.15 * sin(uTime * 2.3 + aPhase));
        }
      `,
      fragmentShader: `
        uniform sampler2D uStarTexture;
        varying vec3 vColor;
        varying float vAlpha;
        varying float vDepth;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // Dual-layer: Crisp particle core + delicate localized cyan halo
          float core = smoothstep(0.24, 0.0, dist);
          float halo = pow(max(0.0, 1.0 - dist * 2.0), 2.2);

          // Rare pure white diamond pinprick center for highlights
          float isWhite = step(0.95, vColor.r) * step(0.95, vColor.g) * step(0.95, vColor.b);
          vec3 finalColor = mix(vColor, vec3(1.0), core * isWhite * 0.85);

          float alpha = (core * 0.92 + halo * 0.42) * vAlpha;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    const heartMesh = new THREE.Points(geometry, particleMaterial);
    heartGroup.add(heartMesh);

    // 5. Ambient Background Stars (distant, slow, deep universe particles)
    const bgStarCount = isMobileInitial ? 100 : 180;
    const bgStarGeometry = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(bgStarCount * 3);
    const bgColors = new Float32Array(bgStarCount * 3);

    for (let i = 0; i < bgStarCount; i++) {
      const idx = i * 3;
      bgPositions[idx] = (Math.random() - 0.5) * 80;
      bgPositions[idx + 1] = (Math.random() - 0.5) * 60;
      bgPositions[idx + 2] = -15 - Math.random() * 30;

      const isCyan = Math.random() < 0.6;
      bgColors[idx] = isCyan ? 0.02 : 0.6;
      bgColors[idx + 1] = isCyan ? 0.55 : 0.8;
      bgColors[idx + 2] = 1.0;
    }
    bgStarGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgStarGeometry.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

    const bgStarMaterial = new THREE.PointsMaterial({
      size: 1.6,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const bgStarPoints = new THREE.Points(bgStarGeometry, bgStarMaterial);
    scene.add(bgStarPoints);

    // 6. Floating Mini 3D Hearts Generator (spawned on tap)
    const spawnMiniHeart3D = (originX: number, originY: number, originZ: number) => {
      const miniPtsCount = 60;
      const miniGeom = new THREE.BufferGeometry();
      const miniPos = new Float32Array(miniPtsCount * 3);
      const miniCol = new Float32Array(miniPtsCount * 3);

      for (let i = 0; i < miniPtsCount; i++) {
        const t = (i / miniPtsCount) * Math.PI * 2;
        const sinT = Math.sin(t);
        const cosT = Math.cos(t);
        const x = 0.5 * Math.pow(sinT, 3);
        const y = 0.5 * (0.85 * cosT - 0.35 * Math.cos(2 * t) - 0.12 * Math.cos(3 * t));
        const z = (Math.random() - 0.5) * 0.3;

        miniPos[i * 3] = x;
        miniPos[i * 3 + 1] = y;
        miniPos[i * 3 + 2] = z;

        miniCol[i * 3] = 0.2;
        miniCol[i * 3 + 1] = 0.85;
        miniCol[i * 3 + 2] = 1.0;
      }
      miniGeom.setAttribute('position', new THREE.BufferAttribute(miniPos, 3));
      miniGeom.setAttribute('color', new THREE.BufferAttribute(miniCol, 3));

      const miniMat = new THREE.PointsMaterial({
        size: 2.0,
        map: starTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const miniMesh = new THREE.Points(miniGeom, miniMat);
      miniMesh.position.set(
        originX + (Math.random() - 0.5) * 4,
        originY + (Math.random() - 0.5) * 3,
        originZ + (Math.random() - 0.5) * 2
      );
      scene.add(miniMesh);

      animationStateRef.current.miniHearts.push({
        mesh: miniMesh,
        vy: Math.random() * 0.08 + 0.06,
        vx: (Math.random() - 0.5) * 0.04,
        vz: (Math.random() - 0.5) * 0.03,
        rotSpeedX: (Math.random() - 0.5) * 0.04,
        rotSpeedY: (Math.random() - 0.5) * 0.04,
        life: 0,
        maxLife: Math.random() * 40 + 70,
      });
    };

    // 7. Interactive 3D Burst
    const triggerBurst = (clientX?: number, clientY?: number) => {
      soundManager.playBurstSound();

      let worldX = 0;
      let worldY = 0;
      if (clientX !== undefined && clientY !== undefined) {
        const ndcX = (clientX / width) * 2 - 1;
        const ndcY = -(clientY / height) * 2 + 1;
        worldX = ndcX * 16;
        worldY = ndcY * 12;
      }

      particleMaterial.uniforms.uBurstCenter.value.set(worldX, worldY, 0);
      animationStateRef.current.burstActive = true;
      animationStateRef.current.burstTime = 0;

      // Spawn 3 floating mini 3D hearts
      for (let i = 0; i < 3; i++) {
        spawnMiniHeart3D(worldX, worldY, 0);
      }
    };

    triggerBurstRef.current = triggerBurst;

    // 8. Event Listeners
    const handlePointerMove = (e: PointerEvent) => {
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      animationStateRef.current.mouse.targetX = ndcX;
      animationStateRef.current.mouse.targetY = ndcY;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactiveRef.current) return;
      triggerBurst(e.clientX, e.clientY);
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      updateHeartTransform(w, h);

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Animation Loop using performance.now()
    let animationFrameId: number;
    let lastTime = performance.now() * 0.001;

    const animate = () => {
      const currentTime = performance.now() * 0.001;
      const delta = Math.min(currentTime - lastTime, 0.1);
      lastTime = currentTime;

      // Smooth mouse easing
      const state = animationStateRef.current;
      state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
      state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

      // Update shader uniforms
      particleMaterial.uniforms.uTime.value = currentTime;

      // Restrained breathing oscillation
      let breath = 0;
      if (!prefersReducedMotion) {
        breath = Math.sin(currentTime * 1.3);
      }
      particleMaterial.uniforms.uBreath.value = breath;

      // Burst progress update
      if (state.burstActive) {
        state.burstTime += delta * 1.05;
        particleMaterial.uniforms.uBurstProgress.value = Math.min(1.0, state.burstTime);
        if (state.burstTime >= 1.0) {
          state.burstActive = false;
          particleMaterial.uniforms.uBurstProgress.value = 0.0;
        }
      }

      // TRUE 3D ROTATION:
      // Gentle, slow yaw around vertical axis (Y) and subtle pitch around horizontal axis (X)
      // As the 3D heart turns, the viewer perceives true front-to-back depth, parallax, and curvature
      const idleYaw = Math.sin(currentTime * 0.4) * 0.16;
      const idlePitch = Math.cos(currentTime * 0.3) * 0.05;
      const mouseYaw = state.mouse.x * 0.28;
      const mousePitch = -state.mouse.y * 0.18;

      heartGroup.rotation.y = idleYaw + mouseYaw;
      heartGroup.rotation.x = idlePitch + mousePitch;

      // Animate background stars drift
      const bgPos = bgStarGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < bgStarCount; i++) {
        bgPos[i * 3 + 1] += 0.03;
        if (bgPos[i * 3 + 1] > 30) {
          bgPos[i * 3 + 1] = -30;
        }
      }
      bgStarGeometry.attributes.position.needsUpdate = true;

      // Animate mini floating hearts
      for (let i = state.miniHearts.length - 1; i >= 0; i--) {
        const mini = state.miniHearts[i];
        mini.mesh.position.y += mini.vy;
        mini.mesh.position.x += mini.vx;
        mini.mesh.position.z += mini.vz;
        mini.mesh.rotation.x += mini.rotSpeedX;
        mini.mesh.rotation.y += mini.rotSpeedY;

        mini.life += 1;
        const ratio = mini.life / mini.maxLife;
        (mini.mesh.material as THREE.PointsMaterial).opacity = Math.max(0, 1.0 - ratio) * 0.75;

        if (mini.life >= mini.maxLife) {
          scene.remove(mini.mesh);
          mini.mesh.geometry.dispose();
          (mini.mesh.material as THREE.PointsMaterial).dispose();
          state.miniHearts.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);

      geometry.dispose();
      particleMaterial.dispose();
      starTexture.dispose();
      bgStarGeometry.dispose();
      bgStarMaterial.dispose();

      animationStateRef.current.miniHearts.forEach((mini) => {
        scene.remove(mini.mesh);
        mini.mesh.geometry.dispose();
        (mini.mesh.material as THREE.PointsMaterial).dispose();
      });

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-10 cursor-pointer overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    />
  );
};

export default ThreeParticleHeart;
