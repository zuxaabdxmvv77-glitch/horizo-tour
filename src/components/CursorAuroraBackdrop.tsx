import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {useTheme} from '../context/ThemeContext';

const GLOBE_RADIUS = 2.45;
const HUB_COORDS = {lat: 41.2995, lon: 69.2401}; // Tashkent (TAS)

const DESTINATION_COORDS: ReadonlyArray<{lat: number; lon: number}> = [
  {lat: 25.2048, lon: 55.2708}, // Dubai
  {lat: 36.8969, lon: 30.7133}, // Antalya
  {lat: 41.0082, lon: 28.9784}, // Istanbul
  {lat: 27.9158, lon: 34.3299}, // Sharm El Sheikh
  {lat: 4.1755, lon: 73.5093}, // Maldives
  {lat: 7.8804, lon: 98.3923}, // Phuket
  {lat: 12.2388, lon: 109.1967}, // Nha Trang
  {lat: -8.3405, lon: 115.092}, // Bali
  {lat: 6.35, lon: 99.8}, // Langkawi
  {lat: 18.2528, lon: 109.5119}, // Hainan / Sanya
  {lat: 37.5665, lon: 126.978}, // Seoul
];

const LIGHT_PALETTE = {
  bg: new THREE.Color('#F3F6FB'),
  fog: new THREE.Color('#F3F6FB'),
  meridian: new THREE.Color('#0B1F5C'),
  equator: new THREE.Color('#2563EB'),
  arc: new THREE.Color('#1D4ED8'),
  hubNode: new THREE.Color('#FF8A00'),
  destNode: new THREE.Color('#0B1F5C'),
  pulse: new THREE.Color('#FF8A00'),
  rimRing: new THREE.Color('#0B1F5C'),
};

const DARK_PALETTE = {
  bg: new THREE.Color('#060A14'),
  fog: new THREE.Color('#060A14'),
  meridian: new THREE.Color('#3B82F6'),
  equator: new THREE.Color('#60A5FA'),
  arc: new THREE.Color('#38BDF8'),
  hubNode: new THREE.Color('#FF8A00'),
  destNode: new THREE.Color('#93C5FD'),
  pulse: new THREE.Color('#FF8A00'),
  rimRing: new THREE.Color('#38BDF8'),
};

// Reusable math objects outside animation loop (zero per-frame GC)
const _dummy = new THREE.Object3D();
const _point = new THREE.Vector3();
const _nextPoint = new THREE.Vector3();

function latLonToVector3(latDeg: number, lonDeg: number, radius: number, out = new THREE.Vector3()): THREE.Vector3 {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);
  out.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
  return out;
}

function detectSoftwareGl(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

interface FlightArcTrack {
  curve: THREE.CatmullRomCurve3;
  speed: number;
  offset: number;
}

export function CursorAuroraBackdrop() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const {theme} = useTheme();
  const isDarkRef = useRef(theme === 'dark');
  const [fallbackActive, setFallbackActive] = useState(false);

  useEffect(() => {
    isDarkRef.current = theme === 'dark';
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', onMotionChange);

    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setFallbackActive(true);
      motionQuery.removeEventListener('change', onMotionChange);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFallbackActive(true);
    };
    const onContextRestored = () => {
      setFallbackActive(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const scene = new THREE.Scene();
    const initialPalette = isDarkRef.current ? DARK_PALETTE : LIGHT_PALETTE;
    const bgColor = initialPalette.bg.clone();
    const fogColor = initialPalette.fog.clone();
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.068);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.1,
      40,
    );
    camera.position.set(0, 0.35, 8.2);

    const globeGroup = new THREE.Group();
    // Tilt subtly toward Central Asia / Eurasia so Tashkent and air routes shine cleanly
    globeGroup.rotation.set(0.32, -2.55, 0.14);
    scene.add(globeGroup);

    const disposables: Array<{dispose: () => void}> = [];

    // 1. Minimalist meridian & latitude wireframe lines
    const meridianMat = new THREE.LineBasicMaterial({
      color: initialPalette.meridian.clone(),
      transparent: true,
      opacity: isDarkRef.current ? 0.24 : 0.12,
    });
    const equatorMat = new THREE.LineBasicMaterial({
      color: initialPalette.equator.clone(),
      transparent: true,
      opacity: isDarkRef.current ? 0.42 : 0.2,
    });
    const arcMat = new THREE.LineBasicMaterial({
      color: initialPalette.arc.clone(),
      transparent: true,
      opacity: isDarkRef.current ? 0.48 : 0.28,
    });
    const rimMat = new THREE.LineBasicMaterial({
      color: initialPalette.rimRing.clone(),
      transparent: true,
      opacity: isDarkRef.current ? 0.22 : 0.11,
    });
    disposables.push(meridianMat, equatorMat, arcMat, rimMat);

    // Latitude parallels
    const latAngles = [-60, -35, -15, 0, 15, 35, 60];
    for (const lat of latAngles) {
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= 72; s++) {
        const lon = -180 + (s / 72) * 360;
        pts.push(latLonToVector3(lat, lon, GLOBE_RADIUS));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      globeGroup.add(new THREE.Line(geo, lat === 0 ? equatorMat : meridianMat));
    }

    // Longitude meridians
    for (let lon = 0; lon < 180; lon += 20) {
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= 72; s++) {
        const lat = -90 + (s / 72) * 180;
        pts.push(latLonToVector3(lat, lon, GLOBE_RADIUS));
      }
      // Complete back half of great circle
      for (let s = 72; s >= 0; s--) {
        const lat = -90 + (s / 72) * 180;
        pts.push(latLonToVector3(lat, lon + 180, GLOBE_RADIUS));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      disposables.push(geo);
      globeGroup.add(new THREE.Line(geo, meridianMat));
    }

    // Outer architectural orbital ring
    const orbitalPts: THREE.Vector3[] = [];
    for (let s = 0; s <= 96; s++) {
      const angle = (s / 96) * Math.PI * 2;
      orbitalPts.push(new THREE.Vector3(Math.cos(angle) * 3.15, 0, Math.sin(angle) * 3.15));
    }
    const orbitalGeo = new THREE.BufferGeometry().setFromPoints(orbitalPts);
    disposables.push(orbitalGeo);
    const orbitalRing = new THREE.Line(orbitalGeo, rimMat);
    orbitalRing.rotation.set(0.35, 0, -0.22);
    globeGroup.add(orbitalRing);

    // 2. Destination & Hub Nodes via InstancedMesh
    const hubPos = latLonToVector3(HUB_COORDS.lat, HUB_COORDS.lon, GLOBE_RADIUS);
    const hubGeo = new THREE.SphereGeometry(0.062, 16, 16);
    const hubMat = new THREE.MeshBasicMaterial({color: initialPalette.hubNode.clone()});
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.position.copy(hubPos);
    globeGroup.add(hubMesh);
    disposables.push(hubGeo, hubMat);

    const destGeo = new THREE.SphereGeometry(0.038, 12, 12);
    const destMat = new THREE.MeshBasicMaterial({color: initialPalette.destNode.clone()});
    const destInstanced = new THREE.InstancedMesh(destGeo, destMat, DESTINATION_COORDS.length);
    DESTINATION_COORDS.forEach((coord, i) => {
      latLonToVector3(coord.lat, coord.lon, GLOBE_RADIUS, _point);
      _dummy.position.copy(_point);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();
      destInstanced.setMatrixAt(i, _dummy.matrix);
    });
    destInstanced.instanceMatrix.needsUpdate = true;
    destInstanced.computeBoundingSphere();
    globeGroup.add(destInstanced);
    disposables.push(destGeo, destMat);

    // 3. Elevated 3D Flight Arcs & Moving Beacons
    const flightTracks: FlightArcTrack[] = [];
    const mid = new THREE.Vector3();

    DESTINATION_COORDS.forEach((coord, idx) => {
      const end = latLonToVector3(coord.lat, coord.lon, GLOBE_RADIUS);
      const dist = hubPos.distanceTo(end);
      const lift = GLOBE_RADIUS + Math.min(1.15, Math.max(0.28, dist * 0.28));

      const q1 = hubPos.clone().lerp(end, 0.33).normalize().multiplyScalar(GLOBE_RADIUS + (lift - GLOBE_RADIUS) * 0.86);
      const q2 = mid.copy(hubPos).lerp(end, 0.67).normalize().multiplyScalar(GLOBE_RADIUS + (lift - GLOBE_RADIUS) * 0.86).clone();

      const curve = new THREE.CatmullRomCurve3([hubPos.clone(), q1, q2, end]);
      const arcPoints = curve.getPoints(48);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
      disposables.push(arcGeo);
      globeGroup.add(new THREE.Line(arcGeo, arcMat));

      flightTracks.push({
        curve,
        speed: 0.14 + (idx % 4) * 0.032,
        offset: (idx * 0.19) % 1,
      });
    });

    // Instanced traveling flight pulses along each arc
    const pulseGeo = new THREE.CapsuleGeometry(0.022, 0.08, 4, 8);
    pulseGeo.rotateX(Math.PI / 2);
    const pulseMat = new THREE.MeshBasicMaterial({color: initialPalette.pulse.clone()});
    const pulseInstanced = new THREE.InstancedMesh(pulseGeo, pulseMat, flightTracks.length);
    pulseInstanced.frustumCulled = false;
    globeGroup.add(pulseInstanced);
    disposables.push(pulseGeo, pulseMat);

    // Subtle atmospheric horizon stars / waypoints (InstancedMesh)
    const starCount = 75;
    const starGeo = new THREE.SphereGeometry(0.016, 6, 6);
    const starMat = new THREE.MeshBasicMaterial({
      color: initialPalette.meridian.clone(),
      transparent: true,
      opacity: isDarkRef.current ? 0.38 : 0.16,
    });
    const starInstanced = new THREE.InstancedMesh(starGeo, starMat, starCount);
    for (let i = 0; i < starCount; i++) {
      const r = 4.6 + ((i * 37) % 100) * 0.04;
      const theta = ((i * 137.5) % 360) * (Math.PI / 180);
      const y = (((i * 73) % 100) / 100 - 0.5) * 6.5;
      _dummy.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r - 1.5);
      _dummy.scale.setScalar(0.7 + (i % 3) * 0.35);
      _dummy.updateMatrix();
      starInstanced.setMatrixAt(i, _dummy.matrix);
    }
    starInstanced.instanceMatrix.needsUpdate = true;
    starInstanced.computeBoundingSphere();
    scene.add(starInstanced);
    disposables.push(starGeo, starMat);

    const updateResponsivePlacement = () => {
      const w = window.innerWidth;
      const h = Math.max(1, window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));

      if (w < 768) {
        globeGroup.position.set(0.15, -0.35, -0.8);
        globeGroup.scale.setScalar(0.84);
      } else {
        globeGroup.position.set(1.65, -0.1, 0);
        globeGroup.scale.setScalar(1.0);
      }
    };

    updateResponsivePlacement();
    window.addEventListener('resize', updateResponsivePlacement);

    const pointer = {x: 0, y: 0};
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      pointer.y = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, {passive: true});

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let disposed = false;
    let prevNow = performance.now();
    let elapsed = 0;

    function afterDraw(cb: () => void) {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            if (disposed) return;
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED) {
              frameId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 80);
            }
          };
          frameId = window.setTimeout(poll, 5);
          return;
        }
      } catch {
        // Fallback pacing if fenceSync unavailable
      }
      frameId = window.setTimeout(cb, 80);
    }

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - prevNow) / 1000));
      prevNow = now;
      if (!reducedMotion) {
        elapsed += dt;
      }

      const targetPalette = isDarkRef.current ? DARK_PALETTE : LIGHT_PALETTE;
      const colorDamp = 1 - Math.exp(-dt * 5.5);
      bgColor.lerp(targetPalette.bg, colorDamp);
      fogColor.lerp(targetPalette.fog, colorDamp);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(fogColor);
      }

      meridianMat.color.lerp(targetPalette.meridian, colorDamp);
      meridianMat.opacity = THREE.MathUtils.damp(
        meridianMat.opacity,
        isDarkRef.current ? 0.24 : 0.12,
        5.5,
        dt,
      );
      equatorMat.color.lerp(targetPalette.equator, colorDamp);
      equatorMat.opacity = THREE.MathUtils.damp(
        equatorMat.opacity,
        isDarkRef.current ? 0.42 : 0.2,
        5.5,
        dt,
      );
      arcMat.color.lerp(targetPalette.arc, colorDamp);
      arcMat.opacity = THREE.MathUtils.damp(
        arcMat.opacity,
        isDarkRef.current ? 0.48 : 0.28,
        5.5,
        dt,
      );
      rimMat.color.lerp(targetPalette.rimRing, colorDamp);
      rimMat.opacity = THREE.MathUtils.damp(
        rimMat.opacity,
        isDarkRef.current ? 0.22 : 0.11,
        5.5,
        dt,
      );
      destMat.color.lerp(targetPalette.destNode, colorDamp);
      starMat.color.lerp(targetPalette.meridian, colorDamp);
      starMat.opacity = THREE.MathUtils.damp(
        starMat.opacity,
        isDarkRef.current ? 0.38 : 0.16,
        5.5,
        dt,
      );

      // Gentle cursor parallax & continuous planetary rotation
      const targetCamX = pointer.x * 0.45;
      const targetCamY = 0.35 - pointer.y * 0.28;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3.2, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3.2, dt);
      camera.lookAt(0.25, 0, 0);

      if (!reducedMotion) {
        globeGroup.rotation.y = -2.55 + elapsed * 0.045;
        orbitalRing.rotation.z = -0.22 + Math.sin(elapsed * 0.25) * 0.04;
      }

      // Advance moving flight pulses along arcs
      for (let i = 0; i < flightTracks.length; i++) {
        const track = flightTracks[i];
        const t = (elapsed * track.speed + track.offset) % 1;
        const tNext = Math.min(0.999, t + 0.02);
        track.curve.getPointAt(t, _point);
        track.curve.getPointAt(tNext, _nextPoint);
        _dummy.position.copy(_point);
        _dummy.lookAt(_nextPoint);
        const fade = Math.sin(t * Math.PI);
        _dummy.scale.setScalar(0.65 + fade * 0.65);
        _dummy.updateMatrix();
        pulseInstanced.setMatrixAt(i, _dummy.matrix);
      }
      pulseInstanced.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (!reducedMotion) {
        if (isSoftwareGl) {
          afterDraw(tick);
        } else {
          frameId = requestAnimationFrame(tick);
        }
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      motionQuery.removeEventListener('change', onMotionChange);
      window.removeEventListener('resize', updateResponsivePlacement);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#F3F6FB] dark:bg-[#060A14] transition-colors duration-300"
    >
      {fallbackActive ? (
        <div className="w-full h-full bg-gradient-to-br from-[#EEF3FA] via-[#F6F5F2] to-[#E8EEF8] dark:from-[#060A14] dark:via-[#0B1224] dark:to-[#070B16]" />
      ) : (
        <div ref={mountRef} className="w-full h-full" />
      )}
    </div>
  );
}
