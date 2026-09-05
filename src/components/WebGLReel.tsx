"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, type Ref } from "react";
import type { PublicApp } from "@/src/content/public-apps";
import type { WebGLRenderer } from "three";

type ThreeModule = typeof import("three");
type VectorTuple = [number, number, number];
type UvTuple = [number, number];
const CYLINDER_RADIUS = 4.05;
const CYLINDER_THICKNESS = 0.055;
const CYLINDER_HEIGHT = 2.0;
const PANEL_GAP_ANGLE = 0;
const PANEL_RADIAL_SEGMENTS = 64;

function createPanelGeometry(
  THREE: ThreeModule,
  appIndex: number,
  appCount: number,
) {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const step = (Math.PI * 2) / appCount;
  const arcLength = step - PANEL_GAP_ANGLE;
  const center = (appIndex + 0.5) * step;
  const start = center - arcLength / 2;
  const halfHeight = CYLINDER_HEIGHT / 2;
  const innerRadius = CYLINDER_RADIUS - CYLINDER_THICKNESS;

  const addVertex = (
    position: VectorTuple,
    normal: VectorTuple,
    uv: UvTuple,
  ) => {
    positions.push(...position);
    normals.push(...normal);
    uvs.push(...uv);
  };

  const addTriangle = (
    a: VectorTuple,
    b: VectorTuple,
    c: VectorTuple,
    normalA: VectorTuple,
    normalB: VectorTuple,
    normalC: VectorTuple,
    uvA: UvTuple,
    uvB: UvTuple,
    uvC: UvTuple,
  ) => {
    addVertex(a, normalA, uvA);
    addVertex(b, normalB, uvB);
    addVertex(c, normalC, uvC);
  };

  const addQuad = (
    a: VectorTuple,
    b: VectorTuple,
    c: VectorTuple,
    d: VectorTuple,
    normalA: VectorTuple,
    normalB: VectorTuple,
    normalC: VectorTuple,
    normalD: VectorTuple,
    uvA: UvTuple,
    uvB: UvTuple,
    uvC: UvTuple,
    uvD: UvTuple,
  ) => {
    addTriangle(a, b, d, normalA, normalB, normalD, uvA, uvB, uvD);
    addTriangle(b, c, d, normalB, normalC, normalD, uvB, uvC, uvD);
  };

  const point = (
    radius: number,
    theta: number,
    y: number,
  ): VectorTuple => [radius * Math.sin(theta), y, radius * Math.cos(theta)];
  const outerNormal = (theta: number): VectorTuple => [
    Math.sin(theta),
    0,
    Math.cos(theta),
  ];
  const innerNormal = (theta: number): VectorTuple => [
    -Math.sin(theta),
    0,
    -Math.cos(theta),
  ];

  let groupStart = 0;
  const finishGroup = (materialIndex: number) => {
    const vertexCount = positions.length / 3;
    geometry.addGroup(groupStart, vertexCount - groupStart, materialIndex);
    groupStart = vertexCount;
  };

  for (let segment = 0; segment < PANEL_RADIAL_SEGMENTS; segment += 1) {
    const progressA = segment / PANEL_RADIAL_SEGMENTS;
    const progressB = (segment + 1) / PANEL_RADIAL_SEGMENTS;
    const thetaA = start + progressA * arcLength;
    const thetaB = start + progressB * arcLength;
    const atlasA = (appIndex + progressA) / appCount;
    const atlasB = (appIndex + progressB) / appCount;
    addQuad(
      point(CYLINDER_RADIUS, thetaA, halfHeight),
      point(CYLINDER_RADIUS, thetaA, -halfHeight),
      point(CYLINDER_RADIUS, thetaB, -halfHeight),
      point(CYLINDER_RADIUS, thetaB, halfHeight),
      outerNormal(thetaA),
      outerNormal(thetaA),
      outerNormal(thetaB),
      outerNormal(thetaB),
      [atlasA, 1],
      [atlasA, 0],
      [atlasB, 0],
      [atlasB, 1],
    );
  }
  finishGroup(0);

  for (let segment = 0; segment < PANEL_RADIAL_SEGMENTS; segment += 1) {
    const progressA = segment / PANEL_RADIAL_SEGMENTS;
    const progressB = (segment + 1) / PANEL_RADIAL_SEGMENTS;
    const thetaA = start + progressA * arcLength;
    const thetaB = start + progressB * arcLength;
    const atlasA = (appIndex + progressA) / appCount;
    const atlasB = (appIndex + progressB) / appCount;
    addQuad(
      point(innerRadius, thetaA, halfHeight),
      point(innerRadius, thetaB, halfHeight),
      point(innerRadius, thetaB, -halfHeight),
      point(innerRadius, thetaA, -halfHeight),
      innerNormal(thetaA),
      innerNormal(thetaB),
      innerNormal(thetaB),
      innerNormal(thetaA),
      [atlasA, 1],
      [atlasB, 1],
      [atlasB, 0],
      [atlasA, 0],
    );
  }
  finishGroup(1);

  for (let segment = 0; segment < PANEL_RADIAL_SEGMENTS; segment += 1) {
    const progressA = segment / PANEL_RADIAL_SEGMENTS;
    const progressB = (segment + 1) / PANEL_RADIAL_SEGMENTS;
    const thetaA = start + progressA * arcLength;
    const thetaB = start + progressB * arcLength;
    const up: VectorTuple = [0, 1, 0];
    const down: VectorTuple = [0, -1, 0];
    addQuad(
      point(CYLINDER_RADIUS, thetaA, halfHeight),
      point(CYLINDER_RADIUS, thetaB, halfHeight),
      point(innerRadius, thetaB, halfHeight),
      point(innerRadius, thetaA, halfHeight),
      up,
      up,
      up,
      up,
      [progressA, 1],
      [progressB, 1],
      [progressB, 0],
      [progressA, 0],
    );
    addQuad(
      point(CYLINDER_RADIUS, thetaA, -halfHeight),
      point(innerRadius, thetaA, -halfHeight),
      point(innerRadius, thetaB, -halfHeight),
      point(CYLINDER_RADIUS, thetaB, -halfHeight),
      down,
      down,
      down,
      down,
      [progressA, 1],
      [progressA, 0],
      [progressB, 0],
      [progressB, 1],
    );
  }

  const end = start + arcLength;
  const startNormal: VectorTuple = [-Math.cos(start), 0, Math.sin(start)];
  const endNormal: VectorTuple = [Math.cos(end), 0, -Math.sin(end)];
  addQuad(
    point(CYLINDER_RADIUS, start, halfHeight),
    point(innerRadius, start, halfHeight),
    point(innerRadius, start, -halfHeight),
    point(CYLINDER_RADIUS, start, -halfHeight),
    startNormal,
    startNormal,
    startNormal,
    startNormal,
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0],
  );
  addQuad(
    point(CYLINDER_RADIUS, end, halfHeight),
    point(CYLINDER_RADIUS, end, -halfHeight),
    point(innerRadius, end, -halfHeight),
    point(innerRadius, end, halfHeight),
    endNormal,
    endNormal,
    endNormal,
    endNormal,
    [0, 1],
    [0, 0],
    [1, 0],
    [1, 1],
  );
  finishGroup(2);

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeBoundingSphere();
  return geometry;
}


export interface WebGLReelHandle {
  setDragOffset: (offset: number, segmentWidth: number) => void;
  setTilt: (x: number, y: number, pulling?: boolean) => void;
  resetTilt: () => void;
}
interface WebGLReelProps {
  apps: readonly PublicApp[];
  visualIndex: number;
  reducedMotion: boolean;
  onReady: () => void;
  onUnavailable: () => void;
}

function WebGLReelComponent({ apps, visualIndex, reducedMotion, onReady, onUnavailable }: WebGLReelProps, ref: Ref<WebGLReelHandle>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(visualIndex);
  const drag = useRef(0);
  const reduce = useRef(reducedMotion);
  const tilt = useRef({ x: 0, y: 0 });
  useEffect(() => { target.current = visualIndex; }, [visualIndex]);
  useEffect(() => { reduce.current = reducedMotion; }, [reducedMotion]);
  useImperativeHandle(ref, () => ({
    setDragOffset(offset, segmentWidth) { drag.current = reduce.current ? 0 : offset / (segmentWidth || 1); },
    setTilt(x, y, pulling = false) {
      const clamp = (value: number) => Math.max(-1, Math.min(1, value));
      tilt.current = reduce.current ? { x: 0, y: 0 } : {
        x: clamp(x) * (pulling ? .035 : .012),
        y: clamp(y) * (pulling ? .15 : .028),
      };
    },
    resetTilt() { tilt.current = { x: 0, y: 0 }; },
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window.WebGL2RenderingContext) { onUnavailable(); return; }
    let disposed = false;
    let frame = 0;
    let renderer: WebGLRenderer | undefined;
    let observer: ResizeObserver | undefined;
    let release: (() => void) | undefined;
    const contextLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); onUnavailable(); };
    canvas.addEventListener("webglcontextlost", contextLost);
    async function initialize() {
      try {
        const [THREE, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/addons/environments/RoomEnvironment.js"),
        ]);
        if (disposed) return;
        renderer = new THREE.WebGLRenderer({ canvas: canvas!, alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0xffffff, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        const style = getComputedStyle(canvas!);
        const scene = new THREE.Scene();
        // Studio lighting gives the actual curved surface broad reflections;
        // the surrounding page remains an unlit white canvas.
        const studio = new RoomEnvironment();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const environment = pmrem.fromScene(studio, 0.04);
        scene.environment = environment.texture;
        scene.environmentIntensity = 1.05;
        studio.dispose();
        pmrem.dispose();
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
        keyLight.position.set(-3, 6, 7);
        scene.add(keyLight);
        const camera = new THREE.OrthographicCamera(-4.8, 4.8, 1.5, -1.5, 0.1, 40);
        camera.position.set(0, 0.9, 14);
        camera.lookAt(0, 0, 0);
        const group = new THREE.Group();
        // Tilt the entire assembly outside the selection rotation, so text,
        // rims and panels remain rigidly attached during pointer interaction.
        const tiltGroup = new THREE.Group();
        tiltGroup.add(group);
        scene.add(tiltGroup);
        const step = Math.PI * 2 / apps.length;
        group.rotation.y = -(target.current + 0.5) * step;
        const atlas = document.createElement("canvas");
        atlas.width = 1536 * apps.length;
        atlas.height = 640;
        const ctx = atlas.getContext("2d");
        if (!ctx) throw new Error("No text canvas");
        apps.forEach((app, i) => {
          ctx.fillStyle = style.getPropertyValue(`--reel-${app.id}`).trim();
          ctx.fillRect(i * 1536, 0, 1536, 640);

        });
        const texture = new THREE.CanvasTexture(atlas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const front = new THREE.MeshPhysicalMaterial({ map: texture, roughness: 0.32, metalness: 0.3, clearcoat: 0.55, clearcoatRoughness: 0.24 });
        const inner = new THREE.MeshStandardMaterial({ color: style.getPropertyValue("--reel-inner").trim(), roughness: 0.52, metalness: 0.25, side: THREE.DoubleSide });
        const edge = new THREE.MeshStandardMaterial({ color: style.getPropertyValue("--reel-edge").trim(), roughness: 0.22, metalness: 0.8, side: THREE.DoubleSide });
        const geometries = apps.map((_, i) => createPanelGeometry(THREE, i, apps.length));
        geometries.forEach(g => group.add(new THREE.Mesh(g, [front, inner, edge])));
        const rimGeometry = new THREE.TorusGeometry(CYLINDER_RADIUS - CYLINDER_THICKNESS / 2, CYLINDER_THICKNESS / 2, 8, 256);
        for (const y of [-CYLINDER_HEIGHT / 2, CYLINDER_HEIGHT / 2]) {
          const rim = new THREE.Mesh(rimGeometry, edge);
          rim.rotation.x = Math.PI / 2;
          rim.position.y = y;
          group.add(rim);
        }
        // Each title is fixed in its panel's local coordinates. The shared
        // group owns rotation; depth testing and backface culling own visibility.
        const labels = apps.map((app, index) => {
          const labelCanvas = document.createElement("canvas");
          labelCanvas.width = 1400; labelCanvas.height = 400;
          const labelContext = labelCanvas.getContext("2d")!;
          labelContext.font = "400 260px Arial, sans-serif";
          labelContext.textAlign = "center"; labelContext.textBaseline = "middle";
          labelContext.fillStyle = style.getPropertyValue(`--reel-${app.id}-text`).trim();
          labelContext.fillText(app.label, 700, 210);
          const labelTexture = new THREE.CanvasTexture(labelCanvas);
          labelTexture.colorSpace = THREE.SRGBColorSpace;
          labelTexture.anisotropy = texture.anisotropy;
          const material = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false });
          const geometry = new THREE.PlaneGeometry(5.25, 1.5, 64, 1);
          const positions = geometry.getAttribute("position");
          const normals = geometry.getAttribute("normal");
          const uv = geometry.getAttribute("uv");
          const radius = CYLINDER_RADIUS + .012;
          for (let vertex = 0; vertex < positions.count; vertex++) {
            const angle = (uv.getX(vertex) - .5) * 5.25 / radius;
            positions.setXYZ(vertex, Math.sin(angle) * radius, (uv.getY(vertex) - .5) * 1.5, Math.cos(angle) * radius);
            normals.setXYZ(vertex, Math.sin(angle), 0, Math.cos(angle));
          }
          geometry.computeBoundingSphere();
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.y = -.015;
          mesh.rotation.y = (index + .5) * step;
          group.add(mesh);
          return { geometry, material, texture: labelTexture };
        });
        release = () => {
          environment.dispose(); rimGeometry.dispose();
          geometries.forEach(g => g.dispose()); [front, inner, edge].forEach(m => m.dispose()); texture.dispose();
          labels.forEach(label => { label.geometry.dispose(); label.material.dispose(); label.texture.dispose(); });
        };
        function resize() {
          if (!canvas || !renderer) return;
          const { width, height } = canvas.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.top = 4.8 * height / width;
          camera.bottom = -camera.top;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        }
        observer = new ResizeObserver(resize);
        observer.observe(canvas!);
        resize();
        let previous = 0;
        let lastRotation = NaN;
        let lastPitch = NaN;
        let lastRoll = NaN;
        let lastScale = NaN;
        const render = (time: number) => {
          if (disposed) return;
          const dt = Math.min((time - previous) / 1000, 0.05);
          previous = time;
          const desired = -(target.current + 0.5 - drag.current) * step;
          group.rotation.y = reduce.current ? desired : THREE.MathUtils.damp(group.rotation.y, desired, 12, dt);
          if (Math.abs(desired - group.rotation.y) < 0.0001) group.rotation.y = desired;
          const pitch = reduce.current ? 0 : tilt.current.y;
          const roll = reduce.current ? 0 : -tilt.current.x;
          tiltGroup.rotation.x = reduce.current ? 0 : THREE.MathUtils.damp(tiltGroup.rotation.x, pitch, 9, dt);
          tiltGroup.rotation.z = reduce.current ? 0 : THREE.MathUtils.damp(tiltGroup.rotation.z, roll, 9, dt);
          if (Math.abs(tiltGroup.rotation.x - pitch) < .0001) tiltGroup.rotation.x = pitch;
          if (Math.abs(tiltGroup.rotation.z - roll) < .0001) tiltGroup.rotation.z = roll;
          // Keep the full tilted silhouette within the existing canvas slot.
          const viewAngle = Math.atan2(.9, 14) + tiltGroup.rotation.x;
          const halfHeight = CYLINDER_HEIGHT / 2 * Math.abs(Math.cos(viewAngle))
            + CYLINDER_RADIUS * Math.abs(Math.sin(viewAngle))
            + CYLINDER_RADIUS * Math.abs(Math.sin(tiltGroup.rotation.z)) + .04;
          tiltGroup.scale.setScalar(Math.min(1, Math.max(camera.top - .03, 1.3) / halfHeight));
          if (!document.hidden && (group.rotation.y !== lastRotation || tiltGroup.rotation.x !== lastPitch || tiltGroup.rotation.z !== lastRoll || tiltGroup.scale.x !== lastScale)) {
            renderer!.render(scene, camera);
            lastRotation = group.rotation.y;
            lastPitch = tiltGroup.rotation.x;
            lastRoll = tiltGroup.rotation.z;
            lastScale = tiltGroup.scale.x;
          }
          frame = requestAnimationFrame(render);
        };
        onReady();
        frame = requestAnimationFrame(render);
      } catch { if (!disposed) onUnavailable(); }
    }
    void initialize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      canvas.removeEventListener("webglcontextlost", contextLost);
      release?.();
      renderer?.dispose();
    };
  }, [apps, onReady, onUnavailable]);
  return <canvas className="reel-webgl-canvas" ref={canvasRef} aria-hidden="true" />;
}
export const WebGLReel = forwardRef(WebGLReelComponent);
