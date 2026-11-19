'use client';

import Link from '@/app/components/LocaleLink';
import { translate } from '@/app/i18n';
import { useLocale } from './LocaleProvider';
import { useId, useEffect, useRef, useState, type FormEvent } from 'react';
import SiteFooter from '@/app/components/SiteFooter';
import SiteHeader from '@/app/components/SiteHeader';

const clientPortalUrl =
  process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || 'https://portal.origins-software.com';

// Public project credentials only. The service-role key stays inside the Edge Function.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const THREE_CDN_PRIMARY = 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js';
const THREE_CDN_FALLBACK =
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.187.0/three.module.min.js';

// Runtime CDN loader bypassing Next.js static bundling.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let threePromise: Promise<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadThreeCDN(): Promise<any> {
  if (!threePromise) {
    const dynamicImport = new Function('url', 'return import(url)') as (
      url: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => Promise<any>;
    threePromise = dynamicImport(THREE_CDN_PRIMARY).catch(() =>
      dynamicImport(THREE_CDN_FALLBACK),
    );
  }
  return threePromise;
}

const capabilities = [
  {
    number: '01',
    title: 'Product engineering',
    text: 'Digital products built around real users, sound architecture and the work that needs to get done.',
    scope: 'PRODUCT · WEB · MOBILE',
  },
  {
    number: '02',
    title: 'Software architecture',
    text: 'Clear system boundaries, dependable APIs and integrations that make complexity easier to manage.',
    scope: 'PLATFORMS · APIS · INTEGRATION',
  },
  {
    number: '03',
    title: 'Cloud & platform engineering',
    text: 'Secure infrastructure, delivery automation and observability designed for day-to-day reliability.',
    scope: 'CLOUD · DEVOPS · SRE',
  },
  {
    number: '04',
    title: 'AI & machine learning',
    text: 'Applied intelligence, model-powered products and governed automation grounded in measurable outcomes.',
    scope: 'ML · GENAI · MLOPS',
  },
  {
    number: '05',
    title: 'Data engineering',
    text: 'Reliable data foundations, event pipelines and analytical systems that make information useful.',
    scope: 'DATA · STREAMING · ANALYTICS',
  },
  {
    number: '06',
    title: 'Security & modernisation',
    text: 'Threat-aware design, safer defaults and careful improvements for existing systems.',
    scope: 'APPSEC · MIGRATION · QUALITY',
  },
];

const projectTypes = [
  {
    number: '01',
    sector: 'COMPUTER VISION',
    title: 'Turning visual data into dependable decisions',
    text: 'Detection and classification pipelines designed for variable environments, practical evaluation and real operating conditions.',
    disciplines: 'Applied machine learning · Data pipelines · Deployment',
    architecture: 'Edge-to-cloud inference with confidence routing, model evaluation and drift telemetry.',
  },
  {
    number: '02',
    sector: 'CONNECTED WORKFLOWS',
    title: 'Bringing fragmented operations into one workspace',
    text: 'Product experiences that connect communication, tasks, projects and the operational information teams rely on.',
    disciplines: 'Product engineering · Realtime systems · Integrations',
    architecture: 'Event-driven synchronisation connecting business systems, operational workflows and live team state.',
  },
  {
    number: '03',
    sector: 'AI & AUTOMATION',
    title: 'Making automated systems useful and governable',
    text: 'Agent-assisted workflows with explicit permissions, useful observability and human escalation when judgement matters.',
    disciplines: 'AI systems · Workflow orchestration · Access controls',
    architecture: 'Policy-enforced tool gateway with scoped credentials, replay logs, evaluations and human sign-off.',
  },
];

const supportedMarkets = [
  { label: 'United Kingdom', region: 'Europe', lat: 51.51, lon: -0.13 },
  { label: 'Ireland', region: 'Europe', lat: 53.35, lon: -6.26 },
  { label: 'Iceland', region: 'Europe', lat: 64.15, lon: -21.94 },
  { label: 'Norway', region: 'Europe', lat: 59.91, lon: 10.75 },
  { label: 'Finland', region: 'Europe', lat: 60.17, lon: 24.94 },
  { label: 'Germany', region: 'Europe', lat: 52.52, lon: 13.4 },
  { label: 'France', region: 'Europe', lat: 48.86, lon: 2.35 },
  { label: 'Slovakia', region: 'Europe', lat: 48.15, lon: 17.11 },
  { label: 'Serbia', region: 'Europe', lat: 44.79, lon: 20.45 },
  { label: 'Japan', region: 'Asia Pacific', lat: 35.68, lon: 139.65 },
  { label: 'Myanmar', region: 'Asia Pacific', lat: 16.84, lon: 96.17 },
  { label: 'Thailand', region: 'Asia Pacific', lat: 13.76, lon: 100.5 },
  { label: 'Singapore', region: 'Asia Pacific', lat: 1.35, lon: 103.82 },
  { label: 'Australia', region: 'Oceania', lat: -33.87, lon: 151.21 },
  { label: 'New Zealand', region: 'Oceania', lat: -36.85, lon: 174.76 },
] as const;

const marketRegions = ['Europe', 'Asia Pacific', 'Oceania'] as const;
type RegionFilter = 'All' | (typeof marketRegions)[number];

function SupportedMarkets3DGlobe({
  activeRegion,
  selectedCountry,
  onSelectCountry,
  autoRotate,
  localize,
}: {
  activeRegion: RegionFilter;
  selectedCountry: string | null;
  onSelectCountry: (countryLabel: string) => void;
  autoRotate: boolean;
  localize: (text: string) => string;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const labelOverlayRef = useRef<HTMLDivElement | null>(null);

  const activeRegionRef = useRef(activeRegion);
  activeRegionRef.current = activeRegion;
  const selectedCountryRef = useRef(selectedCountry);
  selectedCountryRef.current = selectedCountry;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;
  const onSelectCountryRef = useRef(onSelectCountry);
  onSelectCountryRef.current = onSelectCountry;
  const localizeRef = useRef(localize);
  useEffect(() => {
    localizeRef.current = localize;
  }, [localize]);

  useEffect(() => {
    const container = stageRef.current;
    const overlay = labelOverlayRef.current;
    if (!container || !overlay) return;

    let disposed = false;
    let rafId = 0;
    const cleanups: Array<() => void> = [];

    loadThreeCDN()
      .then((THREE) => {
        if (disposed || !container || !overlay) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const width = container.clientWidth || 540;
        const height = container.clientHeight || 480;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
        camera.position.set(0, 0.12, 6.05);

        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        const R = 1.72;

        // 0. Subtle Ambient Starfield for Depth
        const starCount = 260;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
          const r = 4.2 + Math.random() * 5.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          starPos[i * 3 + 1] = r * Math.cos(phi);
          starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({
          color: 0x8fb0bc,
          size: 0.018,
          transparent: true,
          opacity: 0.38,
        });
        const starField = new THREE.Points(starGeo, starMat);
        scene.add(starField);

        // 1. Obsidian Earth Core with richer specular depth
        const sphereGeo = new THREE.SphereGeometry(R, 72, 72);
        const sphereMat = new THREE.MeshPhongMaterial({
          color: 0x061118,
          emissive: 0x030b10,
          specular: 0x265461,
          shininess: 34,
        });
        globeGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

        // 2. Refined Latitude/Longitude Graticule Wire Cage
        const gratGeo = new THREE.SphereGeometry(R + 0.005, 32, 20);
        const gratMat = new THREE.MeshBasicMaterial({
          color: 0x1e434f,
          wireframe: true,
          transparent: true,
          opacity: 0.19,
        });
        globeGroup.add(new THREE.Mesh(gratGeo, gratMat));

        // 3. Dual-Tone Atmospheric Rim Glow Shader (Teal -> Origins Lime)
        const atmosGeo = new THREE.SphereGeometry(R * 1.055, 64, 64);
        const atmosMat = new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          uniforms: {
            uInnerColor: { value: new THREE.Color(0x1fb5a8) },
            uOuterColor: { value: new THREE.Color(0xcddc39) },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPos;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vViewPos = -mv.xyz;
              gl_Position = projectionMatrix * mv;
            }
          `,
          fragmentShader: `
            uniform vec3 uInnerColor;
            uniform vec3 uOuterColor;
            varying vec3 vNormal;
            varying vec3 vViewPos;
            void main() {
              float intensity = pow(0.66 - dot(vNormal, normalize(vViewPos)), 3.0);
              vec3 col = mix(uInnerColor, uOuterColor, clamp(intensity * 1.15, 0.0, 1.0));
              gl_FragColor = vec4(col, clamp(intensity, 0.0, 1.0) * 0.58);
            }
          `,
        });
        globeGroup.add(new THREE.Mesh(atmosGeo, atmosMat));

        // 3b. Subtle Tilted Orbital Hairline Rings
        const orbitGeo1 = new THREE.TorusGeometry(R * 1.16, 0.0022, 8, 128);
        const orbitMat1 = new THREE.MeshBasicMaterial({
          color: 0x1fb5a8,
          transparent: true,
          opacity: 0.22,
        });
        const orbitRing1 = new THREE.Mesh(orbitGeo1, orbitMat1);
        orbitRing1.rotation.set(Math.PI * 0.38, Math.PI * 0.12, 0);
        scene.add(orbitRing1);

        const orbitGeo2 = new THREE.TorusGeometry(R * 1.24, 0.0018, 8, 128);
        const orbitMat2 = new THREE.MeshBasicMaterial({
          color: 0xcddc39,
          transparent: true,
          opacity: 0.12,
        });
        const orbitRing2 = new THREE.Mesh(orbitGeo2, orbitMat2);
        orbitRing2.rotation.set(Math.PI * 0.56, -Math.PI * 0.2, 0);
        scene.add(orbitRing2);

        // 4. Fibonacci Surface Dot Field (2,100 points)
        const dotCount = 2100;
        const dotPos = new Float32Array(dotCount * 3);
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < dotCount; i++) {
          const y = 1 - (i / (dotCount - 1)) * 2;
          const rAtY = Math.sqrt(1 - y * y);
          const theta = goldenAngle * i;
          dotPos[i * 3] = Math.cos(theta) * rAtY * (R + 0.013);
          dotPos[i * 3 + 1] = y * (R + 0.013);
          dotPos[i * 3 + 2] = Math.sin(theta) * rAtY * (R + 0.013);
        }
        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
        const dotMat = new THREE.PointsMaterial({
          color: 0x6ea0ad,
          size: 0.02,
          transparent: true,
          opacity: 0.45,
        });
        globeGroup.add(new THREE.Points(dotGeo, dotMat));

        const latLonToVec = (lat: number, lon: number, radius = R + 0.03) => {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lon + 180) * (Math.PI / 180);
          return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta),
          );
        };

        // 5. All 15 Supported Country Beacons + Pulsing Rings
        const pinGeo = new THREE.SphereGeometry(0.036, 16, 16);
        const ringGeo = new THREE.RingGeometry(0.052, 0.072, 32);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pinMeshes: any[] = [];
        const countryNodes: Array<{
          label: string;
          region: string;
          lat: number;
          lon: number;
          phase: number;
          localPos: InstanceType<typeof THREE.Vector3>;
          targetRotY: number;
          targetRotX: number;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pinMat: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pinMesh: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ringMesh: any;
          el: HTMLButtonElement;
        }> = [];

        overlay.innerHTML = '';

        supportedMarkets.forEach((market, idx) => {
          const pos = latLonToVec(market.lat, market.lon, R + 0.032);
          const pinMat = new THREE.MeshBasicMaterial({ color: 0xcddc39 });
          const pinMesh = new THREE.Mesh(pinGeo, pinMat);
          pinMesh.position.copy(pos);
          pinMesh.userData.countryLabel = market.label;
          globeGroup.add(pinMesh);
          pinMeshes.push(pinMesh);

          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xcddc39,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.copy(pos);
          ringMesh.lookAt(pos.clone().multiplyScalar(2));
          globeGroup.add(ringMesh);

          const rXZ = Math.hypot(pos.x, pos.z);
          const targetRotY = -Math.atan2(pos.x, pos.z);
          const targetRotX = Math.max(-0.95, Math.min(0.95, Math.atan2(pos.y, rXZ)));

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'globe-country-tag';
          btn.textContent = localizeRef.current(market.label);
          btn.setAttribute('aria-label', localizeRef.current(market.label));
          btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            onSelectCountryRef.current(market.label);
          });
          overlay.appendChild(btn);

          countryNodes.push({
            label: market.label,
            region: market.region,
            lat: market.lat,
            lon: market.lon,
            phase: idx * 0.65,
            localPos: pos,
            targetRotY,
            targetRotX,
            pinMat,
            pinMesh,
            ringMesh,
            el: btn,
          });
        });

        // 6. Elevated Geodesic Delivery Arcs + Traveling Light Pulses
        const arcIndices = [
          [0, 5],  // UK -> Germany
          [0, 4],  // UK -> Finland
          [5, 12], // Germany -> Singapore
          [12, 11], // Singapore -> Thailand
          [12, 9],  // Singapore -> Japan
          [12, 13], // Singapore -> Australia
          [13, 14], // Australia -> New Zealand
        ];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arcGeos: any[] = [];
        const arcMat = new THREE.MeshBasicMaterial({
          color: 0xcddc39,
          transparent: true,
          opacity: 0.28,
        });
        const pulseGeo = new THREE.SphereGeometry(0.022, 10, 10);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0xf4ff81 });
        const arcPulses: Array<{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          curve: any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mesh: any;
          speed: number;
          offset: number;
        }> = [];

        arcIndices.forEach(([a, b], idx) => {
          const start = countryNodes[a].localPos;
          const end = countryNodes[b].localPos;
          const mid = start.clone().add(end).multiplyScalar(0.5);
          const dist = start.distanceTo(end);
          mid.normalize().multiplyScalar(R + 0.12 + dist * 0.24);
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.0045, 6, false);
          arcGeos.push(tubeGeo);
          globeGroup.add(new THREE.Mesh(tubeGeo, arcMat));

          const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
          globeGroup.add(pulseMesh);
          arcPulses.push({
            curve,
            mesh: pulseMesh,
            speed: 0.22 + (idx % 3) * 0.05,
            offset: idx * 0.17,
          });
        });

        // Studio Lights (Key + Teal Rim + Ambient)
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.55);
        dirLight.position.set(4, 3, 5);
        scene.add(dirLight);

        const rimLight = new THREE.DirectionalLight(0x1fb5a8, 1.1);
        rimLight.position.set(-5, -2, -3);
        scene.add(rimLight);

        scene.add(new THREE.AmbientLight(0x3a525e, 1.05));

        const raycaster = new THREE.Raycaster();
        const pointerNDC = new THREE.Vector2();

        let isDragging = false;
        let downX = 0;
        let downY = 0;
        let lastX = 0;
        let lastY = 0;
        let velY = 0;
        let velX = 0;
        let pauseAutoRotateUntil = 0;

        let currentRotY = -1.7;
        let currentRotX = 0.48;
        let targetRotY = -1.7;
        let targetRotX = 0.48;

        let lastTrackedCountry: string | null = null;
        let lastTrackedRegion: RegionFilter = activeRegionRef.current;

        const shortestDelta = (target: number, current: number) => {
          let d = (target - current) % (Math.PI * 2);
          if (d > Math.PI) d -= Math.PI * 2;
          if (d < -Math.PI) d += Math.PI * 2;
          return d;
        };

        const onPointerDown = (e: PointerEvent) => {
          isDragging = true;
          downX = e.clientX;
          downY = e.clientY;
          lastX = e.clientX;
          lastY = e.clientY;
          velX = 0;
          velY = 0;
          container.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e: PointerEvent) => {
          if (!isDragging) return;
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          velY = dx * 0.007;
          velX = dy * 0.006;
          targetRotY += velY;
          targetRotX = Math.max(-1.05, Math.min(1.05, targetRotX + velX));
          lastX = e.clientX;
          lastY = e.clientY;
        };

        const onPointerUp = (e: PointerEvent) => {
          const moveDist = Math.hypot(e.clientX - downX, e.clientY - downY);
          isDragging = false;
          pauseAutoRotateUntil = performance.now() + 2000;
          if (container.hasPointerCapture(e.pointerId)) {
            container.releasePointerCapture(e.pointerId);
          }

          if (moveDist < 6) {
            const rect = container.getBoundingClientRect();
            pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointerNDC, camera);
            const hits = raycaster.intersectObjects(pinMeshes, false);
            if (hits.length > 0 && hits[0].object.userData.countryLabel) {
              onSelectCountryRef.current(hits[0].object.userData.countryLabel);
            }
          }
        };

        container.addEventListener('pointerdown', onPointerDown);
        container.addEventListener('pointermove', onPointerMove);
        container.addEventListener('pointerup', onPointerUp);
        container.addEventListener('pointercancel', onPointerUp);

        const onResize = () => {
          if (!container || disposed) return;
          const nw = container.clientWidth;
          const nh = container.clientHeight;
          if (!nw || !nh) return;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        };
        window.addEventListener('resize', onResize);

        const regionCenters: Record<RegionFilter, { rotY: number; rotX: number }> = {
          All: { rotY: -2.2, rotX: 0.42 },
          Europe: { rotY: -1.72, rotX: 0.85 },
          'Asia Pacific': { rotY: -3.45, rotX: 0.35 },
          Oceania: { rotY: -4.45, rotX: -0.58 },
        };

        const worldVec = new THREE.Vector3();
        const activeColor = new THREE.Color(0xcddc39);
        const selectedColor = new THREE.Color(0xffffff);
        const dimColor = new THREE.Color(0x3a4d54);

        const animate = (now = performance.now()) => {
          if (disposed) return;

          const t = now * 0.001;
          const curCountry = selectedCountryRef.current;
          const curRegion = activeRegionRef.current;

          if (curCountry && curCountry !== lastTrackedCountry) {
            const node = countryNodes.find((n) => n.label === curCountry);
            if (node) {
              targetRotY = currentRotY + shortestDelta(node.targetRotY, currentRotY);
              targetRotX = node.targetRotX;
              pauseAutoRotateUntil = now + 2600;
            }
            lastTrackedCountry = curCountry;
          } else if (!curCountry && lastTrackedCountry) {
            lastTrackedCountry = null;
          }

          if (curRegion !== lastTrackedRegion) {
            if (!curCountry) {
              const rc = regionCenters[curRegion];
              targetRotY = currentRotY + shortestDelta(rc.rotY, currentRotY);
              targetRotX = rc.rotX;
              pauseAutoRotateUntil = now + 2000;
            }
            lastTrackedRegion = curRegion;
          }

          // Always spin smoothly when autoRotate is on and user isn't actively dragging
          if (!isDragging) {
            targetRotY += velY;
            targetRotX = Math.max(-1.05, Math.min(1.05, targetRotX + velX));
            velY *= 0.92;
            velX *= 0.92;

            if (autoRotateRef.current && !reduceMotion && now >= pauseAutoRotateUntil) {
              targetRotY += 0.0024;
            }
          }

          currentRotY += (targetRotY - currentRotY) * 0.08;
          currentRotX += (targetRotX - currentRotX) * 0.08;

          globeGroup.rotation.y = currentRotY;
          globeGroup.rotation.x = currentRotX;
          globeGroup.updateMatrixWorld();

          // Subtle counter-rotation for orbital rings and starfield
          orbitRing1.rotation.z = t * 0.06;
          orbitRing2.rotation.z = -t * 0.04;
          starField.rotation.y = t * 0.012;

          // Move glowing pulses along geodesic arcs
          arcPulses.forEach((p) => {
            const u = (t * p.speed + p.offset) % 1;
            p.curve.getPoint(u, p.mesh.position);
          });

          renderer.render(scene, camera);

          const cw = container.clientWidth;
          const ch = container.clientHeight;
          const placedBoxes: Array<{ x: number; y: number }> = [];

          const sortedNodes = countryNodes.slice().sort((a, b) => {
            if (a.label === curCountry) return -1;
            if (b.label === curCountry) return 1;
            return 0;
          });

          sortedNodes.forEach((node) => {
            const isSelected = node.label === curCountry;
            const inRegion = curRegion === 'All' || node.region === curRegion;

            node.pinMat.color.lerp(
              isSelected ? selectedColor : inRegion ? activeColor : dimColor,
              0.15,
            );
            const pinScale = isSelected ? 1.85 : inRegion ? 1.15 : 0.7;
            node.pinMesh.scale.setScalar(pinScale);

            // Animated beacon pulse ring
            const pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + node.phase);
            node.ringMesh.visible = isSelected || inRegion;
            node.ringMesh.scale.setScalar((isSelected ? 1.65 : 0.95) + pulse * 0.55);
            node.ringMesh.material.opacity = (isSelected ? 0.8 : 0.45) * (1 - pulse * 0.55);

            worldVec.copy(node.localPos).applyMatrix4(globeGroup.matrixWorld);

            if (worldVec.z < 0.38 || (!inRegion && !isSelected)) {
              node.el.style.opacity = '0';
              node.el.style.pointerEvents = 'none';
              return;
            }

            const projected = worldVec.clone().project(camera);
            const sx = (projected.x * 0.5 + 0.5) * cw;
            const sy = (-projected.y * 0.5 + 0.5) * ch;

            const overlaps =
              !isSelected &&
              placedBoxes.some((b) => Math.abs(b.x - sx) < 76 && Math.abs(b.y - sy) < 24);

            if (overlaps) {
              node.el.style.opacity = '0';
              node.el.style.pointerEvents = 'none';
              return;
            }

            placedBoxes.push({ x: sx, y: sy });
            const depthOpacity = Math.min(1, (worldVec.z - 0.35) / 0.85);
            node.el.style.opacity = isSelected ? '1' : depthOpacity.toFixed(2);
            node.el.style.pointerEvents = 'auto';
            node.el.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -135%)`;
            node.el.classList.toggle('is-selected', isSelected);
          });

          if (!reduceMotion) {
            rafId = requestAnimationFrame(animate);
          }
        };

        animate();

        cleanups.push(
          () => container.removeEventListener('pointerdown', onPointerDown),
          () => container.removeEventListener('pointermove', onPointerMove),
          () => container.removeEventListener('pointerup', onPointerUp),
          () => container.removeEventListener('pointercancel', onPointerUp),
          () => window.removeEventListener('resize', onResize),
          () => {
            starGeo.dispose();
            starMat.dispose();
            sphereGeo.dispose();
            sphereMat.dispose();
            gratGeo.dispose();
            gratMat.dispose();
            atmosGeo.dispose();
            atmosMat.dispose();
            orbitGeo1.dispose();
            orbitMat1.dispose();
            orbitGeo2.dispose();
            orbitMat2.dispose();
            dotGeo.dispose();
            dotMat.dispose();
            pinGeo.dispose();
            ringGeo.dispose();
            pulseGeo.dispose();
            pulseMat.dispose();
            arcGeos.forEach((g) => g.dispose());
            arcMat.dispose();
            countryNodes.forEach((n) => {
              n.pinMat.dispose();
              n.ringMesh.material.dispose();
            });
            renderer.dispose();
            if (renderer.domElement.parentNode === container) {
              container.removeChild(renderer.domElement);
            }
          },
        );
      })
      .catch(() => {
        // Graceful fallback
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="globe-interactive-wrap">
      <div ref={stageRef} className="globe-canvas-mount" />
      <div ref={labelOverlayRef} className="globe-label-overlay" />
    </div>
  );
}

type PremiumSelectOption = {
  value: string;
  label: string;
};

function PremiumSelect({
  name,
  value,
  options,
  onChange,
  placeholder,
  required = false,
}: {
  name: string;
  value: string;
  options: PremiumSelectOption[];
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [open]);

  const choose = (option: PremiumSelectOption) => {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      if (!open) {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
        return;
      }

      setActiveIndex((current) =>
        event.key === 'ArrowDown'
          ? (current + 1) % options.length
          : (current - 1 + options.length) % options.length,
      );
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (!open) {
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
      } else if (options[activeIndex]) {
        choose(options[activeIndex]);
      }
    }

    if (event.key === 'Escape') {
      setOpen(false);
    }

    if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(0);
    }

    if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    }
  };

  return (
    <div className="premium-select" ref={rootRef}>
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
      />

      <button
        ref={triggerRef}
        type="button"
        className={`premium-select-trigger ${open ? 'is-open' : ''} ${selected ? 'has-value' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
      >
        <span>{selected?.label || placeholder}</span>
        <span className="premium-select-indicator" aria-hidden="true">
          <i />
        </span>
      </button>

      {open && (
        <div
          id={listId}
          className="premium-select-menu"
          role="listbox"
          aria-label={placeholder}
        >
          <div className="premium-select-menu-heading">
            <span>SELECT AN OPTION</span>
            <span>{String(options.length).padStart(2, '0')}</span>
          </div>

          {options.map((option, index) => (
            <button
              type="button"
              role="option"
              aria-selected={value === option.value}
              key={option.value}
              className={[
                'premium-select-option',
                value === option.value ? 'is-selected' : '',
                activeIndex === index ? 'is-active' : '',
              ].join(' ')}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option)}
            >
              <span className="premium-select-option-label">
                {option.label}
              </span>
              <span className="premium-select-option-check">
                {value === option.value ? '✓' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PremiumLanding() {
  const locale = useLocale();
  const localized = (text: string) => translate(locale, text);

  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('All');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [globeAutoRotate, setGlobeAutoRotate] = useState(true);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryStep, setEnquiryStep] = useState<1 | 2>(1);
  const [enquiryService, setEnquiryService] = useState('Build a new digital product');
  const [enquiryDialCode, setEnquiryDialCode] = useState('+44');
  const [enquiryTimeline, setEnquiryTimeline] = useState('Exploring options');
  const [enquiryBudget, setEnquiryBudget] = useState('');
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [enquiryReference, setEnquiryReference] = useState<string | null>(null);
  const [enquiryNotificationSent, setEnquiryNotificationSent] = useState<boolean | null>(null);

  const dialCodeOptions: PremiumSelectOption[] = [
    { value: '+44', label: 'UK (+44)' },
    { value: '+353', label: 'IE (+353)' },
    { value: '+354', label: 'IS (+354)' },
    { value: '+47', label: 'NO (+47)' },
    { value: '+358', label: 'FI (+358)' },
    { value: '+49', label: 'DE (+49)' },
    { value: '+33', label: 'FR (+33)' },
    { value: '+421', label: 'SK (+421)' },
    { value: '+381', label: 'RS (+381)' },
    { value: '+81', label: 'JP (+81)' },
    { value: '+95', label: 'MM (+95)' },
    { value: '+66', label: 'TH (+66)' },
    { value: '+65', label: 'SG (+65)' },
    { value: '+61', label: 'AU (+61)' },
    { value: '+64', label: 'NZ (+64)' },
  ];

  const countryOptions: PremiumSelectOption[] = supportedMarkets.map((market) => ({
    value: market.label,
    label: localized(market.label),
  }));

  const timelineOptions: PremiumSelectOption[] = [
    { value: 'Exploring options', label: localized('Exploring options') },
    { value: 'Within 1–3 months', label: localized('Within 1–3 months') },
    { value: 'Within 3–6 months', label: localized('Within 3–6 months') },
    { value: 'More than 6 months', label: localized('More than 6 months') },
    { value: 'Time-sensitive', label: localized('Time-sensitive') },
  ];

  const budgetOptions: PremiumSelectOption[] = [
    { value: '', label: localized('Prefer to discuss') },
    { value: 'Under £5,000', label: localized('Under £5,000') },
    { value: '£5,000–£15,000', label: localized('£5,000–£15,000') },
    { value: '£15,000–£50,000', label: localized('£15,000–£50,000') },
    { value: '£50,000–£100,000', label: localized('£50,000–£100,000') },
    { value: '£100,000+', label: localized('£100,000+') },
  ];

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.origins-studio');
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    root.classList.add('motion-ready');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          element.style.transitionDelay = `${element.dataset.delay || 0}ms`;
          element.classList.add('is-visible');
          observer.unobserve(element);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!enquiryOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEnquiryOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [enquiryOpen]);

  const visibleMarkets = selectedRegion === 'All'
    ? supportedMarkets
    : supportedMarkets.filter((market) => market.region === selectedRegion);

  const selectedMarketObj = selectedCountry
    ? supportedMarkets.find((market) => market.label === selectedCountry)
    : null;

  const openEnquiry = (country?: string) => {
    if (country) {
      setSelectedCountry(country);
      const market = supportedMarkets.find((item) => item.label === country);
      if (market) setSelectedRegion(market.region as RegionFilter);
    }
    setEnquiryStep(1);
    setEnquirySubmitting(false);
    setEnquirySubmitted(false);
    setEnquiryError(null);
    setEnquiryReference(null);
    setEnquiryNotificationSent(null);
    setEnquiryOpen(true);
  };

  const handleEnquirySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (enquirySubmitting) return;

    setEnquirySubmitting(true);
    setEnquiryError(null);

    try {
      if (!supabaseUrl || !supabasePublicKey) {
        throw new Error('The enquiry service is not configured yet. Please contact us by email.');
      }

      const formData = new FormData(event.currentTarget);
      const countryValue = String(formData.get('country') || '').trim();
      if (!countryValue) {
        throw new Error('Please select your country or market.');
      }

      const rawPhone = String(formData.get('phone') || '').trim();
      const payload = {
        full_name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: rawPhone ? `${enquiryDialCode} ${rawPhone}` : '',
        company: String(formData.get('company') || '').trim(),
        country: countryValue,
        service: enquiryService,
        project_timeline: enquiryTimeline,
        budget_range: enquiryBudget,
        project_description: String(formData.get('brief') || '').trim(),
        // Honeypot field: legitimate visitors leave this blank.
        website: String(formData.get('website') || '').trim(),
      };

      const response = await fetch(`${supabaseUrl}/functions/v1/rapid-task`, {
        method: 'POST',
        headers: {
          apikey: supabasePublicKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null) as {
        success?: boolean;
        error?: string;
        inquiry_id?: string;
        notification_sent?: boolean;
      } | null;

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.error || 'We could not submit your enquiry. Please try again.',
        );
      }

      setEnquiryReference(result.inquiry_id || null);
      setEnquiryNotificationSent(result.notification_sent !== false);
      setEnquirySubmitted(true);
      setEnquiryStep(2);
    } catch (error) {
      console.error('Project enquiry submission failed:', error);
      setEnquiryError(
        error instanceof Error && error.message === 'Failed to fetch'
          ? 'We could not reach the enquiry service. Please check your connection and try again.'
          : error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
      );
    } finally {
      setEnquirySubmitting(false);
    }
  };

  return (
    <main className="origins-landing origins-studio" id="main-content">
      <SiteHeader />
      {/* HERO — clear enterprise proposition with the original interactive globe */}
      <section className="os-hero" aria-labelledby="hero-title">
        <div className="hero-ambient" aria-hidden="true" />
        <div className="os-shell hero-layout">
          <div className="hero-copy">
            <div className="os-eyebrow" data-reveal>
              <span className="eyebrow-mark" aria-hidden="true" />
              {localized('INDEPENDENT SOFTWARE ENGINEERING PARTNER')}
            </div>
            <p className="hero-overline" data-reveal data-delay="35">{localized('ORIGINS SOFTWARE')} <span> / </span> {localized('ENGINEERING WITH INTENT')}</p>
            <h1 id="hero-title" data-reveal data-delay="70">
              {localized('Technology that')}
              <br />
              {localized('moves business')}
              <br />
              <em>{localized('forward.')}</em>
            </h1>
            <p className="hero-description" data-reveal data-delay="120">
              {localized('We help ambitious organisations design, build and evolve the digital systems their business depends on—from product engineering and AI to cloud platforms and secure modernisation.')}
            </p>
            <div className="hero-actions" data-reveal data-delay="165">
              <button type="button" className="os-button os-button-primary" onClick={() => openEnquiry()}>
                {localized('Start a project')} <span aria-hidden="true">↗</span>
              </button>
              <a className="os-button os-button-text" href="#capabilities">
                {localized('Explore our capabilities')} <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-assurance" data-reveal data-delay="210">
              <span>{localized('Strategy to delivery')}</span>
              <i aria-hidden="true" />
              <span>{localized('Engineering accountability')}</span>
              <i aria-hidden="true" />
              <span>{localized('Long-term partnership')}</span>
            </div>
            <div className="hero-client-link" data-reveal data-delay="245">
              <span>{localized('Already a client?')}</span>
              <a href={clientPortalUrl} target="_blank" rel="noreferrer">{localized('Open your secure client workspace')} <span aria-hidden="true">↗</span></a>
            </div>
          </div>

          <div className="hero-market-card" data-reveal data-delay="100">
            <div className="market-card-heading">
              <div>
                <span className="market-card-kicker">{localized('A connected world')}</span>
                <h2>{localized('Where shall we work together?')}</h2>
              </div>
              <span className="market-live-indicator"><i /> {localized('15 MARKETS')}</span>
            </div>
            <div className="market-card-content">
              <div className="market-globe-column">
                <div className="globe-topbar">
                  <span><i aria-hidden="true" /> {localized('ORIGINS / GLOBAL PRESENCE')}</span>
                  <span>{selectedMarketObj ? localized(selectedMarketObj.label).toUpperCase() : localized('SELECT A COUNTRY')}</span>
                </div>
                <SupportedMarkets3DGlobe
                  activeRegion={selectedRegion}
                  selectedCountry={selectedCountry}
                  onSelectCountry={openEnquiry}
                  autoRotate={globeAutoRotate}
                  localize={localized}
                />
                <div className="globe-controls">
                  <button
                    type="button"
                    className={`globe-control ${globeAutoRotate ? 'is-active' : ''}`}
                    onClick={() => setGlobeAutoRotate((value) => !value)}
                  >
                    {globeAutoRotate ? localized('Pause rotation') : localized('Resume rotation')}
                  </button>
                  <span>{localized('Drag to explore · Select a marker to begin')}</span>
                </div>
              </div>

              <aside className="market-directory" aria-label={localized('Choose your market')}>
                <div className="directory-heading">
                  <span className="market-card-kicker">{localized('Choose your market')}</span>
                  <p>{localized('Select the country closest to your organisation.')}</p>
                </div>
                <div className="region-tabs" role="group" aria-label={localized('Filter by region')}>
                  {(['All', ...marketRegions] as const).map((region) => (
                    <button
                      type="button"
                      key={region}
                      className={`region-tab ${selectedRegion === region ? 'is-active' : ''}`}
                      onClick={() => { setSelectedRegion(region); setSelectedCountry(null); }}
                    >
                      {localized(region === 'All' ? 'All' : region === 'Asia Pacific' ? 'Asia Pacific' : region)}
                    </button>
                  ))}
                </div>
                <div className="market-country-list">
                  {visibleMarkets.map((market) => (
                    <button
                      type="button"
                      key={market.label}
                      className={`market-country ${selectedCountry === market.label ? 'is-selected' : ''}`}
                      onClick={() => openEnquiry(market.label)}
                    >
                      <span>{localized(market.label)}</span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  ))}
                </div>
                <div className="directory-footnote">{localized('Your selection will be carried into a tailored project enquiry.')}</div>
              </aside>
            </div>
          </div>
        </div>
        <div className="os-shell hero-bottomline" data-reveal data-delay="260">
          <span>{localized('ONE PARTNER. FROM FIRST PRINCIPLES TO PRODUCTION.')}</span>
          <span className="hero-bottomline-right">{localized('PRODUCT')} <i>·</i> {localized('INTELLIGENCE')} <i>·</i> {localized('PLATFORMS')}</span>
        </div>
      </section>

      {/* SERVICES — a concise enterprise services overview, not a technology catalogue */}
      <section className="os-section os-capabilities" id="capabilities" aria-labelledby="capabilities-title">
        <div className="os-shell">
          <div className="section-intro" data-reveal>
            <div>
              <span className="section-kicker">{localized('What we do')}</span>
              <h2 id="capabilities-title">{localized('Complex technology.')}<br /><em>{localized('Made useful.')}</em></h2>
            </div>
            <p>{localized('We bring strategy, design and engineering together to solve important business problems. Engage us for a complete product or for the specialist capability your team needs next.')}</p>
          </div>

          <div className="capability-list">
            {capabilities.map((item, index) => (
              <article className="capability-row" key={item.number} data-reveal data-delay={index * 45}>
                <span className="capability-number">{item.number}</span>
                <div className="capability-main">
                  <h3>{localized(item.title)}</h3>
                  <p>{localized(item.text)}</p>
                </div>
                <span className="capability-scope">{localized(item.scope)}</span>
                <Link className="capability-arrow" href="/services" aria-label={`${localized('Explore')} ${localized(item.title)}`}>↗</Link>
              </article>
            ))}
          </div>
          <div className="section-link-row" data-reveal>
            <span>{localized('A considered mix of disciplines, selected around the outcome.')}</span>
            <Link href="/services">{localized('View all services')} <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      {/* SELECTED PROBLEM AREAS */}
      <section className="os-section os-work" id="work">
        <div className="os-shell">
          <div className="section-intro" data-reveal>
            <div>
              <span className="section-kicker">{localized('Where we create value')}</span>
              <h2>{localized('Start with the')}<br /><em>{localized('business challenge.')}</em></h2>
            </div>
            <p>{localized('The best solution is shaped by the context around it. We connect technical decisions to operating realities, measurable outcomes and the people who use the system.')}</p>
          </div>

          <div className="work-grid">
            {projectTypes.map((project, index) => (
              <article className="work-card" key={project.number} data-reveal data-delay={index * 65}>
                <div className="work-card-top"><span>{project.number}</span><span>{localized(project.sector)}</span></div>
                <h3>{localized(project.title)}</h3>
                <p>{localized(project.text)}</p>
                <div className="work-card-approach"><span>{localized('Our approach')}</span><p>{localized(project.architecture)}</p></div>
              </article>
            ))}
          </div>
          <div className="work-link-row" data-reveal>
            <p>{localized('Have a different challenge? We will help you define the right starting point.')}</p>
            <button type="button" className="text-link-button" onClick={() => openEnquiry()}>{localized('Discuss your challenge')} <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </section>

      {/* FINAL CONVERSION */}
      <section className="os-cta" id="contact">
        <div className="os-shell cta-inner" data-reveal>
          <div className="cta-copy">
            <span className="section-kicker">{localized('The next step')}</span>
            <h2>{localized('Let’s make')}<br /><em>{localized('progress tangible.')}</em></h2>
            <p>{localized('Tell us where you want to go. We will help you shape a practical first step, the right team and a path to delivery.')}</p>
          </div>
          <div className="cta-actions">
            <button type="button" className="os-button os-button-primary" onClick={() => openEnquiry()}>{localized('Start a project enquiry')} <span aria-hidden="true">↗</span></button>
            <a className="cta-portal-link" href={clientPortalUrl} target="_blank" rel="noreferrer">{localized('Existing client? Open the client portal')} <span aria-hidden="true">↗</span></a>
            <a className="cta-email" href="mailto:support@origins-software.com">support@origins-software.com</a>
          </div>
        </div>
        <div className="os-shell cta-footer"><span>ORIGINS SOFTWARE</span><span>{localized('ENGINEERED WITH INTENT.')}</span></div>
      </section>

      {/* GUIDED PROJECT ENQUIRY — country is preselected from the globe */}
      {enquiryOpen && (
        <div className="enquiry-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEnquiryOpen(false); }}>
          <section className="enquiry-dialog" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
            <div className="enquiry-dialog-top">
              <div className="enquiry-brand">
                <img
                  src="/origins-icon.png"
                  alt="Origins Software"
                  className="enquiry-brand-logo"
                  width={28}
                  height={28}
                />
                <span>
                  ORIGINS <small>{localized('PROJECT ENQUIRY')}</small>
                </span>
              </div>
              <button type="button" className="enquiry-close" aria-label={localized('Close enquiry')} onClick={() => setEnquiryOpen(false)}>×</button>
            </div>
            <div className="enquiry-progress"><span className={enquiryStep === 1 ? 'is-active' : 'is-complete'} /><span className={enquiryStep === 2 ? 'is-active' : ''} /></div>
            <div className="enquiry-content">
              <div className="enquiry-step-label">{localized(enquirySubmitted ? 'ENQUIRY RECEIVED' : 'A SHORT INTRODUCTION')} <span>{enquiryStep === 1 ? '01 / 02' : '02 / 02'}</span></div>
              {enquirySubmitted ? (
                <div className="enquiry-success" role="status" aria-live="polite">
                  <span className="enquiry-success-icon" aria-hidden="true">✓</span>
                  <h2 id="enquiry-title">{localized('Thank you. Your brief is with our team.')}</h2>
                  <p className="enquiry-lede">{localized('Your project enquiry has been securely recorded. Our team will review the details and follow up using the email address you provided.')}</p>
                  {enquiryReference && (
                    <div className="enquiry-reference">
                      <span>{localized('YOUR REFERENCE')}</span>
                      <code>{enquiryReference}</code>
                    </div>
                  )}
                  {enquiryNotificationSent === false && (
                    <p className="enquiry-notification-warning" role="status">
                      {localized('Your enquiry is saved, but our email notification could not be sent just now. You can also contact us at')}{' '}
                      <a href="mailto:support@origins-software.com">support@origins-software.com</a>.
                    </p>
                  )}
                  <button type="button" className="os-button os-button-primary" onClick={() => setEnquiryOpen(false)}>{localized('Close')} <span aria-hidden="true">✓</span></button>
                </div>
              ) : enquiryStep === 1 ? (
                <>
                  <h2 id="enquiry-title">{localized('What would you like to achieve?')}</h2>
                  <p className="enquiry-lede">{localized('Choose the closest starting point. We will use this to direct your enquiry to the right conversation.')}</p>
                  <div className="enquiry-choice-list">
                    {[
                      'Build a new digital product',
                      'Modernise or extend an existing system',
                      'Apply AI, data or automation',
                      'Improve cloud, DevOps or security',
                      'Extend our engineering capability',
                    ].map((choice, index) => (
                      <button
                        type="button"
                        key={choice}
                        className={`enquiry-choice ${enquiryService === choice ? 'is-selected' : ''}`}
                        onClick={() => setEnquiryService(choice)}
                      >
                        <span className="choice-number">0{index + 1}</span>
                        <strong>{localized(choice)}</strong>
                        <span className="choice-check" aria-hidden="true">{enquiryService === choice ? '✓' : '↗'}</span>
                      </button>
                    ))}
                  </div>
                  <div className="enquiry-footer-actions">
                    <button type="button" className="enquiry-back-link" onClick={() => setEnquiryOpen(false)}>{localized('Cancel')}</button>
                    <button type="button" className="os-button os-button-primary" onClick={() => setEnquiryStep(2)}>{localized('Continue')} <span aria-hidden="true">→</span></button>
                  </div>
                </>
              ) : (
                <>
                  <h2 id="enquiry-title">{localized('Let’s understand the brief.')}</h2>
                  <p className="enquiry-lede">{localized('Share a few details about the project. Your enquiry will be sent securely to the Origins team.')}</p>
                  <form className="enquiry-form" onSubmit={handleEnquirySubmit} aria-busy={enquirySubmitting}>
                    <div className="enquiry-form-grid">
                      <label>
                        {localized('Your name')}
                        <input name="name" type="text" autoComplete="name" placeholder={localized('Full name')} minLength={2} maxLength={120} required />
                      </label>

                      <label>
                        {localized('Work email')}
                        <input name="email" type="email" autoComplete="email" placeholder="name@company.com" maxLength={254} required />
                      </label>

                      <label>
                        {localized('Organisation')}
                        <input name="company" type="text" autoComplete="organization" placeholder={localized('Company name')} maxLength={160} />
                      </label>

                      <div className="enquiry-field">
                        <span className="enquiry-field-label">{localized('Phone number')}</span>
                        <div className="enquiry-phone-row">
                          <PremiumSelect
                            name="dial_code"
                            value={enquiryDialCode}
                            options={dialCodeOptions}
                            onChange={setEnquiryDialCode}
                            placeholder="+44"
                          />
                          <input
                            name="phone"
                            type="tel"
                            autoComplete="tel-national"
                            placeholder={localized('Optional')}
                            maxLength={32}
                          />
                        </div>
                      </div>

                      <div className="enquiry-field">
                        <span className="enquiry-field-label">{localized('Country / market')}</span>
                        <PremiumSelect
                          name="country"
                          value={selectedCountry || ''}
                          options={countryOptions}
                          onChange={(country) => {
                            const next = country || null;
                            setSelectedCountry(next);
                            const market = supportedMarkets.find((item) => item.label === next);
                            if (market) setSelectedRegion(market.region as RegionFilter);
                          }}
                          placeholder={localized('Select a country')}
                          required
                        />
                      </div>

                      <div className="enquiry-field">
                        <span className="enquiry-field-label">{localized('Indicative timeline')}</span>
                        <PremiumSelect
                          name="timeline"
                          value={enquiryTimeline}
                          options={timelineOptions}
                          onChange={setEnquiryTimeline}
                          placeholder={localized('Select timeline')}
                        />
                      </div>

                      <div className="enquiry-field enquiry-full-field">
                        <span className="enquiry-field-label">{localized('Indicative budget')}</span>
                        <PremiumSelect
                          name="budget_range"
                          value={enquiryBudget}
                          options={budgetOptions}
                          onChange={setEnquiryBudget}
                          placeholder={localized('Prefer to discuss')}
                        />
                      </div>

                      <label className="enquiry-full-field">
                        {localized('A little about the project')}
                        <textarea
                          name="brief"
                          rows={3}
                          minLength={10}
                          maxLength={10000}
                          required
                          placeholder={localized('What are you looking to build, improve or solve?')}
                        />
                      </label>

                      <input className="enquiry-honeypot" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                    </div>
                    <div className="enquiry-form-note">{localized('Your information is transmitted securely and recorded for our team to review. Please do not include passwords or other sensitive credentials.')}</div>
                    {enquiryError && <p className="enquiry-feedback enquiry-feedback-error" role="alert">{localized(enquiryError)}</p>}
                    <div className="enquiry-footer-actions">
                      <button type="button" className="enquiry-back-link" onClick={() => setEnquiryStep(1)}>← {localized('Back')}</button>
                      <button type="submit" className="os-button os-button-primary" disabled={enquirySubmitting}>{enquirySubmitting ? localized('Sending enquiry…') : localized('Send project enquiry')} <span aria-hidden="true">{enquirySubmitting ? '…' : '↗'}</span></button>
                    </div>
                  </form>
                </>
              )}
            </div>
            <div className="enquiry-dialog-bottom"><span>{localized('ORIGINS SOFTWARE')}</span><span>{localized('A thoughtful first conversation.')}</span></div>
          </section>
        </div>
      )}

      <SiteFooter />

      <style jsx global>{`
        .origins-studio {
          --os-bg: #020d14;
          --os-surface: #0b1f29;
          --os-surface-2: #102a35;
          --os-line: #1b3342;
          --os-text: #f2f5f7;
          --os-muted: #a9bcc7;
          --os-soft: #78909b;
          --os-accent: #cddc39;
          --os-teal: #1fb5a8;
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: clip;
          background: var(--os-bg);
          color: var(--os-text);
          font-family: Inter, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .origins-studio * { box-sizing: border-box; }
        .origins-studio a { color: inherit; text-decoration: none; }
        .origins-studio button, .origins-studio input, .origins-studio select, .origins-studio textarea { font: inherit; }
        :global(html:has(.origins-landing)),
        :global(body:has(.origins-landing)) { background: #020d14; color-scheme: dark; }
        .origins-studio button:focus-visible, .origins-studio a:focus-visible,
        .origins-studio input:focus-visible, .origins-studio select:focus-visible,
        .origins-studio textarea:focus-visible { outline: 2px solid var(--os-accent); outline-offset: 3px; }
        .origins-studio .os-button:disabled { opacity: .58; cursor: wait; transform: none; }
        .os-shell { width: min(1460px, calc(100% - 96px)); margin-inline: auto; }
        .os-hero { position: relative; padding: 4px 0 26px; isolation: isolate; }
        .hero-ambient { position: absolute; z-index: -1; top: -260px; right: -160px; width: 900px; height: 900px; border-radius: 50%; background: radial-gradient(circle, rgba(31,181,168,.09), transparent 67%); pointer-events: none; }
        .hero-layout { display: grid; grid-template-columns: minmax(390px,.82fr) minmax(620px,1.18fr); align-items: start; gap: clamp(40px,5vw,88px); }
        .hero-copy { max-width: 620px; padding: 0 0 24px; }
        .os-eyebrow, .section-kicker, .market-card-kicker { display: inline-flex; align-items: center; gap: 10px; color: var(--os-muted); font: 500 10px/1.4 "JetBrains Mono", "IBM Plex Mono", monospace; letter-spacing: .13em; text-transform: uppercase; }
        .eyebrow-mark { width: 7px; height: 7px; border-radius: 50%; background: var(--os-accent); box-shadow: 0 0 0 4px rgba(205,220,57,.09); }
        .hero-overline { margin: 20px 0 12px; color: #7f96a0; font: 500 10px/1.5 "JetBrains Mono", monospace; letter-spacing: .14em; }
        .hero-overline span { color: var(--os-accent); padding: 0 5px; }
        .hero-copy h1 {
          max-width: 680px;
          margin: 0;
          color: var(--os-text);
          font-size: clamp(56px, 5.4vw, 80px);
          font-weight: 560;
          line-height: 0.99;
          letter-spacing: -.06em;
        }
        .hero-copy h1 em, .section-intro h2 em, .cta-copy h2 em { color: var(--os-accent); font-style: normal; }
        .hero-description { max-width: 560px; margin: 18px 0 0; color: #a9bbc4; font-size: 15px; line-height: 1.7; }
        .hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 20px; margin-top: 22px; }
        .origins-studio .os-button { display: inline-flex !important; min-height: 46px !important; align-items: center !important; justify-content: center !important; gap: 8px !important; padding: 14px 32px !important; border: 1px solid transparent !important; border-radius: 999px !important; cursor: pointer !important; font-family: var(--font-body) !important; font-size: 15px !important; font-weight: 600 !important; line-height: 1.2 !important; letter-spacing: .01em !important; transition: all .3s cubic-bezier(.16,1,.3,1) !important; }
        .origins-studio .os-button:hover { transform: translateY(-2px) !important; }
        .origins-studio .os-button span { display: inline-block !important; font-size: 16px !important; line-height: 1 !important; transition: transform .3s cubic-bezier(.16,1,.3,1) !important; }
        .origins-studio .os-button-primary { border: 0 !important; background: var(--os-accent) !important; color: #0b1114 !important; box-shadow: 0 4px 15px rgba(205,220,57,.15) !important; }
        .origins-studio .os-button-primary:hover { background: #d4ff33 !important; box-shadow: 0 8px 25px rgba(205,220,57,.3) !important; }
        .origins-studio .os-button-primary:hover span { transform: translate(3px,-3px) !important; }
        .origins-studio .os-button-text { min-height: 42px !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; background: transparent !important; color: var(--os-text) !important; box-shadow: none !important; font-size: 12px !important; font-weight: 500 !important; }
        .origins-studio .os-button-text:hover { color: var(--os-accent) !important; }
        .hero-assurance { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 24px; color: #8196a0; font-size: 10px; letter-spacing: .015em; }
        .hero-assurance i { width: 3px; height: 3px; border-radius: 50%; background: var(--os-accent); }
        .hero-client-link { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(169,188,199,.12); color: #718791; font-size: 11px; }
        .hero-client-link a { color: #d5dfe2; transition: color .2s ease; }
        .hero-client-link a:hover { color: var(--os-accent); }
        .hero-client-link a span { padding-left: 4px; color: var(--os-accent); }
        .hero-market-card { min-width: 0; overflow: hidden; border: 1px solid rgba(169,188,199,.16); background: linear-gradient(135deg, rgba(11,31,41,.97), rgba(5,20,28,.97)); box-shadow: 0 36px 100px rgba(0,0,0,.22); }
        .market-card-heading { display: flex; align-items: center; justify-content: space-between; gap: 22px; padding: 22px 24px 18px; border-bottom: 1px solid rgba(169,188,199,.12); }
        .market-card-heading h2 { margin: 7px 0 0; color: var(--os-text); font-size: 18px; font-weight: 540; letter-spacing: -.035em; }
        .market-live-indicator { display: inline-flex; align-items: center; gap: 8px; color: #8da1aa; white-space: nowrap; font: 9px "JetBrains Mono", monospace; letter-spacing: .08em; }
        .market-live-indicator i, .globe-topbar i { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--os-accent); box-shadow: 0 0 12px rgba(205,220,57,.5); }
        .market-card-content { display: grid; grid-template-columns: minmax(0,1.45fr) minmax(235px,.65fr); min-height: 478px; }
        .market-globe-column { display: flex; min-width: 0; flex-direction: column; border-right: 1px solid rgba(169,188,199,.12); }
        .globe-topbar { min-height: 37px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 16px; border-bottom: 1px solid rgba(169,188,199,.09); color: #8197a1; font: 8px "JetBrains Mono", monospace; letter-spacing: .08em; }
        .globe-topbar span:first-child { display: flex; align-items: center; gap: 8px; color: #b8c7cc; }
        .globe-interactive-wrap { position: relative; flex: 1; min-height: 385px; overflow: hidden; }
        .globe-canvas-mount { position: absolute; inset: 0; min-height: 385px; cursor: grab; touch-action: pan-y; }
        .globe-canvas-mount:active { cursor: grabbing; }
        .globe-canvas-mount canvas { display: block; width: 100%; height: 100%; }
        .globe-label-overlay { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .globe-country-tag { position: absolute; transform: translate(-50%,-50%); padding: 5px 7px; border: 1px solid rgba(169,188,199,.22); border-radius: 2px; background: rgba(2,13,20,.82); color: #c9d7dc; font: 8px "JetBrains Mono", monospace; white-space: nowrap; pointer-events: auto; cursor: pointer; backdrop-filter: blur(8px); transition: background .2s ease,border-color .2s ease,color .2s ease; }
        .globe-country-tag:hover, .globe-country-tag.is-selected { border-color: var(--os-accent); background: rgba(205,220,57,.13); color: var(--os-accent); }
        .globe-controls { display: flex; min-height: 43px; align-items: center; justify-content: space-between; gap: 12px; padding: 0 15px; border-top: 1px solid rgba(169,188,199,.1); color: #718791; font-size: 9px; }
        .globe-control { padding: 6px 0; border: 0; background: transparent; color: #91a5ad; cursor: pointer; font-size: 9px; }
        .globe-control:hover, .globe-control.is-active { color: var(--os-accent); }
        .market-directory { display: flex; min-width: 0; flex-direction: column; padding: 19px 17px 14px; }
        .directory-heading p { margin: 7px 0 14px; color: #91a5ad; font-size: 11px; line-height: 1.55; }
        .region-tabs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 9px; }
        .region-tab { padding: 6px 7px; border: 1px solid transparent; background: transparent; color: #849aa4; cursor: pointer; font-size: 9px; transition: color .2s ease,border-color .2s ease,background .2s ease; }
        .region-tab:hover, .region-tab.is-active { border-color: rgba(205,220,57,.26); background: rgba(205,220,57,.07); color: var(--os-accent); }
        .market-country-list { display: grid; grid-template-columns: 1fr; align-content: start; max-height: 304px; overflow: auto; scrollbar-color: #294450 transparent; scrollbar-width: thin; }
        .market-country { display: flex; min-height: 34px; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 3px; border: 0; border-bottom: 1px solid rgba(169,188,199,.08); background: transparent; color: #b5c4ca; text-align: left; cursor: pointer; font-size: 10px; transition: color .2s ease,padding .2s ease; }
        .market-country span:last-child { color: #647d88; }
        .market-country:hover, .market-country.is-selected { padding-inline: 7px; color: var(--os-accent); }
        .market-country:hover span:last-child, .market-country.is-selected span:last-child { color: var(--os-accent); }
        .directory-footnote { margin-top: auto; padding-top: 13px; color: #6f858e; font-size: 9px; line-height: 1.5; }
        .hero-bottomline { display: flex; justify-content: space-between; gap: 20px; margin-top: 30px; padding-top: 17px; border-top: 1px solid rgba(169,188,199,.13); color: #748994; font: 9px "JetBrains Mono", monospace; letter-spacing: .09em; }
        .hero-bottomline-right { color: #a9bcc7; }
        .hero-bottomline-right i { padding-inline: 7px; color: var(--os-accent); font-style: normal; }

        .os-section { padding: 116px 0; }
        .os-section > .os-shell { position: relative; z-index: 1; }
        .os-capabilities { background: linear-gradient(180deg, #071720 0%, #06151d 100%); color: var(--os-text); border-block: 1px solid rgba(169,188,199,.07); }
        .os-capabilities .section-kicker, .os-capabilities .capability-number, .os-capabilities .capability-scope { color: #8fa4ad; }
        .section-intro { display: grid; grid-template-columns: minmax(0,1.05fr) minmax(280px,.7fr); align-items: end; gap: 60px; margin-bottom: 56px; }
        .section-kicker { color: #94a7ae; }
        .section-intro h2 { margin: 16px 0 0; font-size: clamp(40px,4.5vw,62px); font-weight: 560; line-height: 1.03; letter-spacing: -.06em; }
        .os-capabilities .section-intro h2 { color: var(--os-text); }
        .os-capabilities .section-intro h2 em { color: var(--os-accent); }
        .section-intro > p { max-width: 520px; margin: 0 0 4px; color: #899ba3; font-size: 14px; line-height: 1.85; }
        .os-capabilities .section-intro > p { color: #9aadb5; }
        .capability-list { border-top: 1px solid rgba(169,188,199,.16); }
        .capability-row { display: grid; grid-template-columns: 58px minmax(260px,1fr) minmax(180px,.55fr) 36px; align-items: center; gap: 22px; min-height: 116px; padding: 20px 0; border-bottom: 1px solid rgba(169,188,199,.13); transition: padding .22s ease, border-color .22s ease; }
        .capability-row:hover { padding-inline: 9px; border-bottom-color: rgba(205,220,57,.38); }
        .capability-number { align-self: start; padding-top: 7px; font: 11px "JetBrains Mono", monospace; }
        .capability-main h3 { margin: 0; color: #eaf0f2; font-size: 21px; font-weight: 560; letter-spacing: -.035em; }
        .capability-main p { max-width: 650px; margin: 8px 0 0; color: #91a6af; font-size: 12px; line-height: 1.7; }
        .capability-scope { justify-self: start; font: 9px "JetBrains Mono", monospace; letter-spacing: .035em; }
        .capability-arrow { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid rgba(169,188,199,.24); border-radius: 50%; color: #dce5e8; font-size: 15px; transition: background .2s ease,color .2s ease,border-color .2s ease; }
        .capability-row:hover .capability-arrow { border-color: var(--os-accent); background: rgba(205,220,57,.1); color: var(--os-accent); }
        .section-link-row { display: flex; justify-content: space-between; gap: 20px; margin-top: 23px; color: #8da2ab; font-size: 11px; }
        .section-link-row a { color: #e8eff1; font-weight: 650; }
        .section-link-row a span { margin-left: 8px; }

        .os-work { background: #07151c; }
        .os-work .section-intro h2 { color: var(--os-text); }
        .work-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 1px; border: 1px solid rgba(169,188,199,.14); background: rgba(169,188,199,.14); }
        .work-card { display: flex; min-height: 360px; flex-direction: column; padding: 28px 27px 25px; background: #091b24; transition: background .25s ease; }
        .work-card:hover { background: #0d2530; }
        .work-card-top { display: flex; justify-content: space-between; gap: 12px; color: #8aa0a9; font: 9px "JetBrains Mono", monospace; letter-spacing: .07em; }
        .work-card-top span:first-child { color: var(--os-accent); }
        .work-card h3 { max-width: 340px; margin: 48px 0 13px; color: var(--os-text); font-size: 23px; font-weight: 550; line-height: 1.2; letter-spacing: -.04em; }
        .work-card > p { margin: 0; color: #9aadb5; font-size: 12px; line-height: 1.8; }
        .work-card-approach { margin-top: auto; padding-top: 24px; }
        .work-card-approach > span { color: var(--os-accent); font: 9px "JetBrains Mono", monospace; letter-spacing: .08em; text-transform: uppercase; }
        .work-card-approach p { margin: 8px 0 0; color: #738a94; font-size: 10px; line-height: 1.7; }
        .work-link-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 24px; }
        .work-link-row p { margin: 0; color: #8fa2aa; font-size: 11px; }
        .text-link-button { padding: 8px 0; border: 0; background: transparent; color: var(--os-text); cursor: pointer; font-size: 11px; font-weight: 600; }
        .text-link-button span { padding-left: 8px; color: var(--os-accent); }
        .text-link-button:hover { color: var(--os-accent); }

        .os-cta { padding: 84px 0 22px; background: #0b1f29; }
        .cta-inner { display: flex; align-items: end; justify-content: space-between; gap: 60px; padding-bottom: 78px; }
        .cta-copy { max-width: 650px; }
        .cta-copy h2 { margin: 18px 0 16px; color: var(--os-text); font-size: clamp(44px,5vw,68px); font-weight: 550; line-height: 1.02; letter-spacing: -.06em; }
        .cta-copy p { max-width: 510px; margin: 0; color: #9aadb5; font-size: 13px; line-height: 1.8; }
        .cta-actions { display: flex; min-width: 275px; flex-direction: column; align-items: flex-start; gap: 17px; padding-bottom: 5px; }
        .cta-portal-link, .cta-email { color: #b2c0c5; font-size: 10px; }
        .cta-portal-link:hover, .cta-email:hover { color: var(--os-accent); }
        .cta-portal-link span { padding-left: 4px; color: var(--os-accent); }
        .cta-footer { display: flex; justify-content: space-between; gap: 20px; padding-top: 17px; border-top: 1px solid rgba(169,188,199,.14); color: #718791; font: 9px "JetBrains Mono", monospace; letter-spacing: .1em; }

        .enquiry-backdrop { position: fixed; z-index: 9999; inset: 0; display: grid; place-items: center; overflow-y: auto; padding: 28px; background: rgba(0,8,12,.78); backdrop-filter: blur(14px); animation: enquiryFade .2s ease both; }
        .enquiry-dialog { width: min(680px,100%); max-height: min(900px,calc(100vh - 56px)); overflow-y: auto; border: 1px solid rgba(169,188,199,.2); background: #071820; box-shadow: 0 35px 120px rgba(0,0,0,.55); animation: enquiryRise .28s cubic-bezier(.2,.8,.2,1) both; }
        .enquiry-dialog-top { display: flex; align-items: center; justify-content: space-between; padding: 19px 25px; border-bottom: 1px solid rgba(169,188,199,.12); }
        .enquiry-brand { display: flex; align-items: center; gap: 11px; color: #eff4f5; font-size: 11px; font-weight: 750; letter-spacing: .13em; }
        .enquiry-brand-mark { display: grid; width: 27px; height: 27px; place-items: center; background: var(--os-accent); color: #07151c; font-size: 15px; font-weight: 800; }
        .enquiry-brand-logo {
          display: block;
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 4px;
          flex: 0 0 auto;
        }
        .enquiry-brand small { display: block; margin-top: 3px; color: #8da2ab; font: 8px "JetBrains Mono", monospace; letter-spacing: .12em; }
        .enquiry-close { display: grid; width: 33px; height: 33px; place-items: center; border: 1px solid rgba(169,188,199,.2); background: transparent; color: #b8c7cc; cursor: pointer; font-size: 23px; line-height: 1; }
        .enquiry-close:hover { border-color: var(--os-accent); color: var(--os-accent); }
        .enquiry-progress { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 0 25px; }
        .enquiry-progress span { height: 3px; background: #203844; }
        .enquiry-progress span.is-active, .enquiry-progress span.is-complete { background: var(--os-accent); }
        .enquiry-content { padding: 32px 40px 36px; }
        .enquiry-step-label { display: flex; justify-content: space-between; color: #8fa3ac; font: 9px "JetBrains Mono", monospace; letter-spacing: .11em; }
        .enquiry-step-label span { color: var(--os-accent); }
        .enquiry-content h2 { margin: 17px 0 9px; color: #f2f5f7; font-size: 32px; font-weight: 560; line-height: 1.12; letter-spacing: -.05em; }
        .enquiry-lede { margin: 0 0 24px; color: #91a6af; font-size: 12px; line-height: 1.7; }
        .enquiry-choice-list { display: grid; gap: 7px; }
        .enquiry-choice { display: grid; grid-template-columns: 34px 1fr 22px; align-items: center; gap: 12px; min-height: 57px; padding: 10px 13px; border: 1px solid rgba(169,188,199,.15); background: rgba(255,255,255,.015); color: #cbd6da; text-align: left; cursor: pointer; transition: border-color .2s ease,background .2s ease; }
        .enquiry-choice:hover, .enquiry-choice.is-selected { border-color: rgba(205,220,57,.6); background: rgba(205,220,57,.055); }
        .choice-number { color: #738b95; font: 9px "JetBrains Mono", monospace; }
        .enquiry-choice strong { font-size: 11px; font-weight: 550; }
        .choice-check { color: #748b94; text-align: right; }
        .enquiry-choice.is-selected .choice-check { color: var(--os-accent); }
        .enquiry-footer-actions { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 26px; }
        .enquiry-back-link { border: 0; background: transparent; color: #91a5ad; cursor: pointer; font-size: 11px; }
        .enquiry-back-link:hover { color: var(--os-accent); }
        .enquiry-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .enquiry-form label { display: flex; min-width: 0; flex-direction: column; gap: 7px; color: #adbec4; font-size: 10px; }
        .enquiry-form input, .enquiry-form select, .enquiry-form textarea { width: 100%; min-height: 42px; padding: 10px 11px; border: 1px solid rgba(169,188,199,.19); border-radius: 0; outline: none; background: #0b222d; color: #edf2f3; font-size: 11px; }
        .enquiry-form input::placeholder, .enquiry-form textarea::placeholder { color: #607983; }
        .enquiry-form input:focus, .enquiry-form select:focus, .enquiry-form textarea:focus { border-color: rgba(205,220,57,.7); }
        .enquiry-form select { color-scheme: dark; }
        .enquiry-form textarea { min-height: 78px; resize: vertical; }
        .enquiry-full-field { grid-column: 1 / -1; }
        .enquiry-form-note { margin-top: 15px; color: #718892; font-size: 9px; line-height: 1.6; }
        .enquiry-form select option { background: #0b222d; color: #edf2f3; }
        .enquiry-feedback { margin: 13px 0 0; padding: 11px 13px; border: 1px solid; font-size: 11px; line-height: 1.6; }
        .enquiry-feedback-error { border-color: rgba(242,122,122,.32); background: rgba(155,48,48,.12); color: #ffc1bc; }
        .enquiry-honeypot { position: absolute !important; left: -10000px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; }
        .enquiry-success { padding: 26px 0 8px; }
        .enquiry-success-icon { display: grid; width: 46px; height: 46px; place-items: center; border: 1px solid rgba(205,220,57,.45); border-radius: 50%; background: rgba(205,220,57,.09); color: var(--os-accent); font-size: 22px; }
        .enquiry-success h2 { max-width: 480px; }
        .enquiry-success .enquiry-lede { max-width: 470px; margin-bottom: 22px; }
        .enquiry-reference { display: flex; flex-direction: column; gap: 7px; margin: 0 0 25px; padding: 13px 15px; border: 1px solid rgba(169,188,199,.16); background: rgba(255,255,255,.025); }
        .enquiry-reference span { color: #8fa3ac; font: 8px "JetBrains Mono", monospace; letter-spacing: .12em; }
        .enquiry-reference code { color: var(--os-accent); font: 11px "JetBrains Mono", monospace; overflow-wrap: anywhere; }
        .enquiry-notification-warning { margin: 0 0 20px; padding: 12px 14px; border: 1px solid rgba(205,220,57,.25); background: rgba(205,220,57,.06); color: #c2d0b2; font-size: 10px; line-height: 1.65; }
        .enquiry-notification-warning a { color: var(--os-accent); text-decoration: underline; text-underline-offset: 3px; }
        .enquiry-dialog-bottom { display: flex; justify-content: space-between; gap: 16px; padding: 13px 25px; border-top: 1px solid rgba(169,188,199,.12); color: #6f858e; font: 8px "JetBrains Mono", monospace; letter-spacing: .08em; }
        @keyframes enquiryFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes enquiryRise { from { opacity: 0; transform: translateY(13px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .motion-ready [data-reveal] { opacity: 0; transform: translateY(18px); transition: opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1); }
        .motion-ready [data-reveal].is-visible { opacity: 1; transform: translateY(0); }

        @media (max-width: 1220px) {
          .os-shell { width: min(100% - 56px,1460px); }
          .hero-layout { grid-template-columns: minmax(330px,.78fr) minmax(540px,1.22fr); gap: 35px; }
          .hero-copy h1 { font-size: clamp(52px, 5vw, 68px); }
          .market-card-content { grid-template-columns: minmax(0,1.2fr) minmax(215px,.8fr); }
          .market-card-heading { padding-inline: 18px; }
          .market-directory { padding-inline: 13px; }
        }
        @media (max-width: 980px) {
          .os-shell { width: calc(100% - 48px); }
          .os-hero { padding-top: 4px; }
          .hero-layout { grid-template-columns: 1fr; gap: 42px; }
          .hero-copy { max-width: 750px; padding-bottom: 0; }
          .hero-overline { margin-top: 18px; }
          .hero-market-card { width: 100%; }
          .section-intro { grid-template-columns: 1fr; gap: 22px; }
          .section-intro > p { max-width: 680px; }
          .cta-inner { align-items: flex-start; flex-direction: column; gap: 35px; }
          .cta-actions { flex-direction: row; flex-wrap: wrap; align-items: center; }
        }
        @media (max-width: 680px) {
          .os-shell { width: calc(100% - 36px); }
          .os-hero { padding-top: 4px; }
          .hero-copy h1 { font-size: clamp(44px,12vw,62px); }
          .hero-overline { margin-top: 18px; }
          .hero-description { margin-top: 22px; font-size: 14px; }
          .hero-assurance { gap: 8px; font-size: 9px; }
          .market-card-heading { align-items: flex-start; flex-direction: column; gap: 9px; padding: 17px; }
          .market-card-content { grid-template-columns: 1fr; }
          .market-globe-column { border-right: 0; border-bottom: 1px solid rgba(169,188,199,.12); }
          .globe-interactive-wrap, .globe-canvas-mount { min-height: 330px; }
          .globe-topbar { align-items: flex-start; flex-direction: column; justify-content: center; min-height: 48px; padding-block: 8px; }
          .globe-controls { min-height: 48px; }
          .market-directory { min-height: auto; padding: 16px; }
          .market-country-list { grid-template-columns: 1fr 1fr; column-gap: 18px; max-height: 210px; }
          .directory-footnote { margin-top: 14px; }
          .hero-bottomline { align-items: flex-start; flex-direction: column; gap: 8px; font-size: 8px; }
          .os-section { padding: 78px 0; }
          .section-intro { margin-bottom: 34px; }
          .section-intro h2 { font-size: 43px; }
          .capability-row { grid-template-columns: 31px 1fr 28px; gap: 10px; min-height: auto; padding: 20px 0; }
          .capability-main h3 { font-size: 17px; }
          .capability-main p { font-size: 11px; }
          .capability-scope { grid-column: 2 / 3; grid-row: 2; font-size: 8px; }
          .capability-arrow { grid-column: 3; grid-row: 1 / span 2; }
          .section-link-row, .work-link-row { align-items: flex-start; flex-direction: column; }
          .work-grid { grid-template-columns: 1fr; }
          .work-card { min-height: 310px; }
          .work-card h3 { margin-top: 34px; }
        }
        @media (max-width: 440px) {
          .cta-inner { padding-bottom: 52px; }
          .cta-copy h2 { font-size: 47px; }
          .cta-actions { align-items: flex-start; flex-direction: column; }
          .cta-footer { font-size: 8px; }
          .enquiry-backdrop { align-items: end; padding: 0; }
          .enquiry-dialog { width: 100%; max-height: 94vh; border-bottom: 0; }
          .enquiry-dialog-top { padding: 15px 18px; }
          .enquiry-progress { padding-inline: 18px; }
          .enquiry-content { padding: 25px 19px 26px; }
          .enquiry-content h2 { font-size: 27px; }
          .enquiry-form-grid { grid-template-columns: 1fr; }
          .enquiry-full-field { grid-column: auto; }
          .enquiry-dialog-bottom { padding-inline: 18px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .origins-studio *, .origins-studio *::before, .origins-studio *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }

        /* ── Origins PremiumSelect ── */
        .origins-studio .enquiry-field {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 7px;
        }

        .origins-studio .enquiry-field-label {
          color: #adbec4;
          font-size: 10px;
        }

        .origins-studio .enquiry-phone-row {
          display: grid;
          grid-template-columns: 112px 1fr;
          gap: 8px;
        }

        .origins-studio .premium-select {
          position: relative;
          width: 100%;
        }

        .origins-studio .premium-select-trigger {
          display: flex;
          width: 100%;
          min-height: 42px;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 12px;
          border: 1px solid rgba(169, 188, 199, .19);
          background: linear-gradient(135deg, #0f2833, #0a1f29);
          color: #6f8791;
          font-size: 11px;
          text-align: left;
          cursor: pointer;
          transition: border-color .2s ease, background .2s ease, box-shadow .2s ease, color .2s ease;
        }

        .origins-studio .premium-select-trigger.has-value {
          color: #edf2f3;
        }

        .origins-studio .premium-select-trigger:hover {
          border-color: rgba(205, 220, 57, .42);
          background: #102b37;
        }

        .origins-studio .premium-select-trigger.is-open,
        .origins-studio .premium-select-trigger:focus-visible {
          border-color: rgba(205, 220, 57, .75);
          box-shadow: 0 0 0 3px rgba(205, 220, 57, .08);
        }

        .origins-studio .premium-select-trigger > span:first-child {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .origins-studio .premium-select-indicator {
          display: grid;
          width: 18px;
          height: 18px;
          flex: 0 0 auto;
          place-items: center;
        }

        .origins-studio .premium-select-indicator i {
          display: block;
          width: 6px;
          height: 6px;
          border-right: 1.5px solid #9ab0ba;
          border-bottom: 1.5px solid #9ab0ba;
          transform: translateY(-2px) rotate(45deg);
          transition: transform .2s ease, border-color .2s ease;
        }

        .origins-studio .premium-select-trigger.is-open .premium-select-indicator i {
          border-color: var(--os-accent);
          transform: translateY(2px) rotate(225deg);
        }

        .origins-studio .premium-select-menu {
          position: absolute;
          z-index: 40;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          max-height: 230px;
          overflow-y: auto;
          padding: 6px;
          border: 1px solid rgba(169, 188, 199, .24);
          background: rgba(7, 24, 32, .97);
          box-shadow: 0 22px 54px rgba(0, 0, 0, .62);
          backdrop-filter: blur(14px);
          scrollbar-color: #294450 transparent;
          scrollbar-width: thin;
        }

        .origins-studio .premium-select-menu-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px 8px;
          margin-bottom: 4px;
          border-bottom: 1px solid rgba(169, 188, 199, .1);
          color: #6e8690;
          font: 500 8px/1 "JetBrains Mono", monospace;
          letter-spacing: .12em;
        }

        .origins-studio .premium-select-option {
          display: flex;
          width: 100%;
          min-height: 34px;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 7px 9px;
          border: 1px solid transparent;
          background: transparent;
          color: #c2d1d7;
          font-size: 11px;
          text-align: left;
          cursor: pointer;
          transition: background .15s ease, color .15s ease, border-color .15s ease;
        }

        .origins-studio .premium-select-option:hover,
        .origins-studio .premium-select-option.is-active {
          background: rgba(205, 220, 57, .08);
          color: #f2f5f7;
        }

        .origins-studio .premium-select-option.is-selected {
          border-color: rgba(205, 220, 57, .28);
          background: rgba(205, 220, 57, .12);
          color: var(--os-accent);
        }

        .origins-studio .premium-select-option-check {
          color: var(--os-accent);
          font-size: 11px;
        }
      `}</style>
    </main>
  );
}