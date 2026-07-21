"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref,
} from "react";
import type {
  BufferGeometry,
  CanvasTexture,
  Material,
  WebGLRenderer,
} from "three";
import type { PublicApp } from "@/src/content/public-apps";

const ATLAS_PANEL_WIDTH = 1536;
const ATLAS_PANEL_HEIGHT = 800;
const CYLINDER_RADIUS = 4.05;
const CYLINDER_THICKNESS = 0.056;
const CYLINDER_HEIGHT = 3.25;
const PANEL_GAP_ANGLE = Math.PI / 110;
const PANEL_RADIAL_SEGMENTS = 36;
const CAMERA_Z = 12.8;
const PORTRAIT_CAMERA_Z = 15.8;
const PORTRAIT_ASPECT_THRESHOLD = 1.15;

const INNER_SHELL_DIM = 0x8f8a94;
const EDGE_SHELL_COLOR = 0xe9e2d6;
const LABEL_BACK_RADIUS = CYLINDER_RADIUS + 0.24;
const LABEL_FRONT_RADIUS = CYLINDER_RADIUS + 0.32;

type ThreeModule = typeof import("three");
type VectorTuple = [number, number, number];
type UvTuple = [number, number];

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

function createArcFaceGeometry(
  THREE: ThreeModule,
  appIndex: number,
  appCount: number,
  radius: number,
) {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const step = (Math.PI * 2) / appCount;
  const arcLength = step - PANEL_GAP_ANGLE;
  const start = (appIndex + 0.5) * step - arcLength / 2;
  const halfHeight = CYLINDER_HEIGHT / 2;

  const push = (theta: number, y: number, u: number, v: number) => {
    positions.push(radius * Math.sin(theta), y, radius * Math.cos(theta));
    normals.push(Math.sin(theta), 0, Math.cos(theta));
    uvs.push(u, v);
  };

  for (let segment = 0; segment < PANEL_RADIAL_SEGMENTS; segment += 1) {
    const progressA = segment / PANEL_RADIAL_SEGMENTS;
    const progressB = (segment + 1) / PANEL_RADIAL_SEGMENTS;
    const thetaA = start + progressA * arcLength;
    const thetaB = start + progressB * arcLength;
    const atlasA = (appIndex + progressA) / appCount;
    const atlasB = (appIndex + progressB) / appCount;
    push(thetaA, halfHeight, atlasA, 1);
    push(thetaA, -halfHeight, atlasA, 0);
    push(thetaB, halfHeight, atlasB, 1);
    push(thetaA, -halfHeight, atlasA, 0);
    push(thetaB, -halfHeight, atlasB, 0);
    push(thetaB, halfHeight, atlasB, 1);
  }

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
  setPointer: (x: number, y: number) => void;
  resetPointer: () => void;
}

interface WebGLReelProps {
  apps: readonly PublicApp[];
  visualIndex: number;
  reducedMotion: boolean;
  onReady: () => void;
  onUnavailable: () => void;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load reel image: ${src}`));
    image.src = src;
  });
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

let cachedAtlasEntry: {
  apps: readonly PublicApp[];
  promise: Promise<HTMLCanvasElement>;
} | null = null;

function getReelAtlas(apps: readonly PublicApp[]) {
  if (cachedAtlasEntry?.apps === apps) return cachedAtlasEntry.promise;
  const promise = createReelAtlas(apps);
  const entry = { apps, promise };
  cachedAtlasEntry = entry;
  promise.catch(() => {
    if (cachedAtlasEntry === entry) cachedAtlasEntry = null;
  });
  return promise;
}

export function preloadReelAssets(apps: readonly PublicApp[]) {
  void import("three");
  getReelAtlas(apps).catch(() => {});
}

async function createReelAtlas(apps: readonly PublicApp[]) {
  const [images] = await Promise.all([
    Promise.all(apps.map((app) => loadImage(app.reelImage))),
    document.fonts?.ready ?? Promise.resolve(),
  ]);
  const atlas = document.createElement("canvas");
  atlas.width = ATLAS_PANEL_WIDTH * apps.length;
  atlas.height = ATLAS_PANEL_HEIGHT;
  const context = atlas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");

  apps.forEach((app, index) => {
    const x = index * ATLAS_PANEL_WIDTH;
    context.save();
    context.beginPath();
    context.rect(x, 0, ATLAS_PANEL_WIDTH, ATLAS_PANEL_HEIGHT);
    context.clip();
    drawCoverImage(
      context,
      images[index],
      x,
      0,
      ATLAS_PANEL_WIDTH,
      ATLAS_PANEL_HEIGHT,
    );
    context.restore();
  });

  return atlas;
}

function createLabelAtlas(apps: readonly PublicApp[]) {
  const atlas = document.createElement("canvas");
  atlas.width = ATLAS_PANEL_WIDTH * apps.length;
  atlas.height = ATLAS_PANEL_HEIGHT;
  const context = atlas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "400 176px 'DM Serif Display', Georgia, serif";
  context.fillStyle = "#fff";
  apps.forEach((app, index) => {
    const labelX = index * ATLAS_PANEL_WIDTH + ATLAS_PANEL_WIDTH / 2;
    const labelY = ATLAS_PANEL_HEIGHT * 0.52;
    context.shadowColor = "rgb(255 255 255 / 60%)";
    context.shadowBlur = 10;
    context.fillText(app.label, labelX, labelY);
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.fillText(app.label, labelX, labelY);
  });

  return atlas;
}

function WebGLReelComponent(
  {
    apps,
    visualIndex,
    reducedMotion,
    onReady,
    onUnavailable,
  }: WebGLReelProps,
  ref: Ref<WebGLReelHandle>,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const step = (Math.PI * 2) / apps.length;
  const normalizedInitialIndex =
    ((visualIndex % apps.length) + apps.length) % apps.length;
  const targetRotationRef = useRef(-(normalizedInitialIndex + 0.5) * step);
  const dragRotationRef = useRef(0);
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerActiveRef = useRef(false);
  const lastVisualIndexRef = useRef(visualIndex);
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useImperativeHandle(
    ref,
    () => ({
      setDragOffset(offset, segmentWidth) {
        dragRotationRef.current = segmentWidth
          ? (offset / segmentWidth) * step
          : 0;
      },
      setPointer(x, y) {
        if (reducedMotionRef.current) return;
        pointerActiveRef.current = true;
        pointerTargetRef.current.x = x;
        pointerTargetRef.current.y = y;
      },
      resetPointer() {
        pointerActiveRef.current = false;
        pointerTargetRef.current.x = 0;
        pointerTargetRef.current.y = 0;
      },
    }),
    [step],
  );

  useEffect(() => {
    const delta = visualIndex - lastVisualIndexRef.current;
    lastVisualIndexRef.current = visualIndex;
    if (!delta || delta % apps.length === 0 || Math.abs(delta) > apps.length) {
      return;
    }
    targetRotationRef.current -= delta * step;
  }, [apps.length, step, visualIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window.WebGL2RenderingContext === "undefined") {
      console.warn("[reel] WebGL2 unsupported, using DOM fallback");
      onUnavailable();
      return;
    }

    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      depth: true,
      premultipliedAlpha: true,
    });
    if (!context) {
      console.warn("[reel] WebGL2 context unavailable, using DOM fallback");
      onUnavailable();
      return;
    }

    let disposed = false;
    let animationFrame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let renderer: WebGLRenderer | null = null;
    let atlasTexture: CanvasTexture | null = null;
    let labelTexture: CanvasTexture | null = null;
    const disposableGeometries: BufferGeometry[] = [];
    const disposableMaterials: Material[] = [];

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      window.cancelAnimationFrame(animationFrame);
      onUnavailable();
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    const initialize = async () => {
      try {
        const [THREE, atlas] = await Promise.all([
          import("three"),
          getReelAtlas(apps),
        ]);
        if (disposed) return;

        renderer = new THREE.WebGLRenderer({
          canvas,
          context,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          premultipliedAlpha: true,
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
        camera.position.set(0, 0.8, CAMERA_Z);
        camera.lookAt(0, 0.35, 0);

        atlasTexture = new THREE.CanvasTexture(atlas);
        atlasTexture.colorSpace = THREE.SRGBColorSpace;
        atlasTexture.wrapS = THREE.RepeatWrapping;
        atlasTexture.minFilter = THREE.LinearFilter;
        atlasTexture.magFilter = THREE.LinearFilter;
        atlasTexture.generateMipmaps = false;
        atlasTexture.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy(),
        );

        labelTexture = new THREE.CanvasTexture(createLabelAtlas(apps));
        labelTexture.colorSpace = THREE.SRGBColorSpace;
        labelTexture.wrapS = THREE.RepeatWrapping;
        labelTexture.minFilter = THREE.LinearFilter;
        labelTexture.magFilter = THREE.LinearFilter;
        labelTexture.generateMipmaps = false;
        labelTexture.anisotropy = atlasTexture.anisotropy;

        const panelGeometries = apps.map((_, index) =>
          createPanelGeometry(THREE, index, apps.length),
        );
        disposableGeometries.push(...panelGeometries);

        const reelMaterial = new THREE.MeshBasicMaterial({
          map: atlasTexture,
          side: THREE.FrontSide,
        });
        const innerMaterial = new THREE.MeshBasicMaterial({
          map: atlasTexture,
          color: INNER_SHELL_DIM,
          side: THREE.DoubleSide,
        });
        const edgeMaterial = new THREE.MeshBasicMaterial({
          color: EDGE_SHELL_COLOR,
          side: THREE.DoubleSide,
        });
        const labelBackMaterial = new THREE.MeshBasicMaterial({
          map: labelTexture,
          color: 0x17121d,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
        });
        const labelFrontMaterial = new THREE.ShaderMaterial({
          uniforms: {
            labelMap: { value: labelTexture },
            reelMap: { value: atlasTexture },
            atlasRepeat: { value: apps.length },
          },
          vertexShader: `
            varying vec2 vUv;

            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D labelMap;
            uniform sampler2D reelMap;
            uniform float atlasRepeat;
            varying vec2 vUv;

            void main() {
              float glyph = texture2D(labelMap, vUv).a;
              if (glyph < 0.015) discard;
              float panel = floor(vUv.x * atlasRepeat);
              vec2 panelCenter = vec2((panel + 0.5) / atlasRepeat, 0.5);
              vec2 refractedUv = mix(vUv, panelCenter, 0.07);
              refractedUv.y += 0.012;
              vec3 refracted = texture2D(reelMap, refractedUv).rgb;
              vec3 fill = mix(refracted * 1.35, vec3(1.0), 0.5);
              float edgeBand = pow(clamp(4.0 * glyph * (1.0 - glyph), 0.0, 1.0), 1.4);
              vec3 color = fill + vec3(1.0, 0.99, 0.96) * edgeBand * 0.5;
              float alpha = clamp(glyph * 0.7 + edgeBand * 0.28, 0.0, 0.94);
              gl_FragColor = vec4(color, alpha);
            }
          `,
          transparent: true,
          depthWrite: false,
        });
        const labelReflectionMaterial = new THREE.MeshBasicMaterial({
          map: labelTexture,
          transparent: true,
          opacity: 0.28,
          depthWrite: false,
        });
        disposableMaterials.push(
          reelMaterial,
          innerMaterial,
          edgeMaterial,
          labelBackMaterial,
          labelFrontMaterial,
          labelReflectionMaterial,
        );

        const createImageReflectionMaterial = (
          opacity: number,
          brightness: number,
        ) => new THREE.ShaderMaterial({
          uniforms: {
            reelMap: { value: atlasTexture },
            reflectionOpacity: { value: opacity },
            reflectionBrightness: { value: brightness },
            elapsedTime: { value: 0 },
            rippleStrength: { value: 1 },
          },
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vViewNormal;
            varying float vLocalY;

            void main() {
              vUv = uv;
              vViewNormal = normalize(normalMatrix * normal);
              vLocalY = position.y;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D reelMap;
            uniform float reflectionOpacity;
            uniform float reflectionBrightness;
            uniform float elapsedTime;
            uniform float rippleStrength;
            varying vec2 vUv;
            varying vec3 vViewNormal;
            varying float vLocalY;

            void main() {
              float wavePhase = vLocalY * 9.0;
              float ripple = sin(wavePhase + elapsedTime * 1.4 + vUv.x * 14.0)
                + 0.55 * sin(wavePhase * 2.2 - elapsedTime * 2.1 + vUv.x * 47.0);
              vec2 rippleUv = vUv;
              rippleUv.x += ripple * 0.005 * rippleStrength;
              rippleUv.y += sin(vUv.x * 23.0 + elapsedTime * 1.1 + vLocalY * 5.0)
                * 0.007 * rippleStrength;
              vec4 sampled = texture2D(reelMap, rippleUv);
              float floorFade = pow(
                clamp((${(CYLINDER_HEIGHT / 2).toFixed(4)} - vLocalY) / ${CYLINDER_HEIGHT.toFixed(4)}, 0.0, 1.0),
                0.78
              );
              float edgeLight = pow(1.0 - abs(vViewNormal.z), 2.0);
              vec3 softened = mix(sampled.rgb, vec3(0.985, 0.965, 0.925), 0.05);
              float openingReveal = smoothstep(
                ${(-CYLINDER_HEIGHT / 2 + 0.02).toFixed(4)},
                ${(-CYLINDER_HEIGHT / 2 + 0.2).toFixed(4)},
                vLocalY
              );
              float alpha = reflectionOpacity * floorFade * openingReveal * (0.86 + edgeLight * 0.14);
              alpha *= 1.0 - 0.06 * rippleStrength
                * (0.5 + 0.5 * sin(wavePhase * 1.3 - elapsedTime * 1.8 + vUv.x * 21.0));
              if (alpha < 0.006) discard;
              gl_FragColor = vec4(softened * reflectionBrightness, alpha);
            }
          `,
          transparent: true,
          depthWrite: true,
          side: THREE.DoubleSide,
          blending: THREE.NormalBlending,
        });

        const reflectionMaterial = createImageReflectionMaterial(0.5, 1);
        const innerImageReflectionMaterial = createImageReflectionMaterial(
          0.2,
          0.55,
        );
        const createTintReflectionMaterial = (
          colorValue: number,
          opacity: number,
        ) =>
          new THREE.ShaderMaterial({
            uniforms: {
              reflectionColor: { value: new THREE.Color(colorValue) },
              reflectionOpacity: { value: opacity },
            },
            vertexShader: `
              varying float vLocalY;
              varying vec3 vViewNormal;

              void main() {
                vLocalY = position.y;
                vViewNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 reflectionColor;
              uniform float reflectionOpacity;
              varying float vLocalY;
              varying vec3 vViewNormal;

              void main() {
                float floorFade = pow(
                  clamp((${(CYLINDER_HEIGHT / 2).toFixed(4)} - vLocalY) / ${CYLINDER_HEIGHT.toFixed(4)}, 0.0, 1.0),
                  0.72
                );
                float edgeLight = pow(1.0 - abs(vViewNormal.z), 2.0);
                vec3 color = mix(reflectionColor, vec3(1.0, 0.985, 0.955), 0.08 + edgeLight * 0.1);
                gl_FragColor = vec4(color, reflectionOpacity * floorFade);
              }
            `,
            transparent: true,
            depthWrite: true,
            side: THREE.DoubleSide,
            blending: THREE.NormalBlending,
          });

        const edgeReflectionMaterial = createTintReflectionMaterial(
          EDGE_SHELL_COLOR,
          0.6,
        );
        disposableMaterials.push(
          reflectionMaterial,
          innerImageReflectionMaterial,
          edgeReflectionMaterial,
        );

        const createFacetMaterial = (reflectionMode: boolean) =>
          new THREE.ShaderMaterial({
            uniforms: {
              hoverX: { value: 0 },
              hoverY: { value: 0 },
              hoverStrength: { value: 0 },
              elapsedTime: { value: 0 },
              reflectionMode: { value: reflectionMode ? 1 : 0 },
              atlasRepeat: { value: apps.length },
            },
            vertexShader: `
              varying vec2 vUv;
              varying vec3 vViewNormal;
              varying float vLocalY;
              varying float vScreenX;
              varying float vScreenY;

              void main() {
                vUv = uv;
                vViewNormal = normalize(normalMatrix * normal);
                vLocalY = position.y;
                vec4 clipPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                vScreenX = clipPosition.x / clipPosition.w;
                vScreenY = clipPosition.y / clipPosition.w;
                gl_Position = clipPosition;
              }
            `,
            fragmentShader: `
              uniform float hoverX;
              uniform float hoverY;
              uniform float hoverStrength;
              uniform float elapsedTime;
              uniform float reflectionMode;
              uniform float atlasRepeat;
              varying vec2 vUv;
              varying vec3 vViewNormal;
              varying float vLocalY;
              varying float vScreenX;
              varying float vScreenY;

              vec2 hash22(vec2 point) {
                vec2 hash = vec2(
                  dot(point, vec2(127.1, 311.7)),
                  dot(point, vec2(269.5, 183.3))
                );
                return fract(sin(hash) * 43758.5453);
              }

              void main() {
                vec2 shardUv = vec2(
                  vUv.x * atlasRepeat * 14.0 + vUv.y * 1.85,
                  vUv.y * 8.5
                );
                vec2 baseCell = floor(shardUv);
                vec2 local = fract(shardUv);
                float nearestDistance = 10.0;
                float secondDistance = 10.0;
                vec2 nearestCell = vec2(0.0);

                for (int y = -1; y <= 1; y++) {
                  for (int x = -1; x <= 1; x++) {
                    vec2 neighbor = vec2(float(x), float(y));
                    vec2 cell = baseCell + neighbor;
                    vec2 randomPoint = 0.14 + hash22(cell) * 0.72;
                    vec2 delta = neighbor + randomPoint - local;
                    float distanceSquared = dot(delta, delta);
                    if (distanceSquared < nearestDistance) {
                      secondDistance = nearestDistance;
                      nearestDistance = distanceSquared;
                      nearestCell = cell;
                    } else if (distanceSquared < secondDistance) {
                      secondDistance = distanceSquared;
                    }
                  }
                }

                vec2 seedPair = hash22(nearestCell + vec2(7.3, 3.1));
                float seed = seedPair.x;
                float shardEdge = 1.0 - smoothstep(
                  0.018,
                  0.11,
                  secondDistance - nearestDistance
                );
                float shardPresence = smoothstep(0.3, 0.85, seed);
                float shardFill = shardPresence * (0.032 + seedPair.y * 0.042);
                float twinkleWave = 0.5 + 0.5 * sin(
                  elapsedTime * (0.55 + seed * 0.8) + seedPair.y * 28.0
                );
                float twinkle = pow(twinkleWave, 18.0) * smoothstep(0.7, 0.98, seed);
                vec2 pointerDelta = vec2(
                  (vScreenX - hoverX) / 0.55,
                  (vScreenY + hoverY) / 0.8
                );
                float pointerFalloff = 1.0 - smoothstep(0.32, 1.12, length(pointerDelta));
                float rimLight = pow(1.0 - abs(vViewNormal.z), 2.2);

                float alpha = hoverStrength * pointerFalloff;
                alpha *= shardFill
                  + shardEdge * shardPresence * 0.07
                  + twinkle * 0.16
                  + rimLight * shardPresence * 0.018;
                alpha *= smoothstep(0.12, 0.5, abs(vViewNormal.z));

                if (reflectionMode > 0.5) {
                  float floorFade = pow(
                    clamp((${(CYLINDER_HEIGHT / 2).toFixed(4)} - vLocalY) / ${CYLINDER_HEIGHT.toFixed(4)}, 0.0, 1.0),
                    0.78
                  );
                  float openingReveal = smoothstep(
                    ${(-CYLINDER_HEIGHT / 2 + 0.02).toFixed(4)},
                    ${(-CYLINDER_HEIGHT / 2 + 0.2).toFixed(4)},
                    vLocalY
                  );
                  alpha *= floorFade * openingReveal * 0.3;
                }

                if (alpha < 0.008) discard;
                vec3 ice = vec3(0.76, 0.91, 0.98);
                vec3 blush = vec3(1.0, 0.86, 0.8);
                vec3 shardColor = mix(ice, blush, seedPair.y * 0.58);
                shardColor = mix(shardColor, vec3(1.0), twinkle * 0.48 + shardEdge * 0.08);
                gl_FragColor = vec4(shardColor, min(alpha, 0.3));
              }
            `,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,
          });

        const facetMaterial = createFacetMaterial(false);
        const reflectionFacetMaterial = createFacetMaterial(true);
        const hiddenFacetMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
          colorWrite: false,
        });
        disposableMaterials.push(
          facetMaterial,
          reflectionFacetMaterial,
          hiddenFacetMaterial,
        );

        const labelBackGeometries = apps.map((_, index) =>
          createArcFaceGeometry(THREE, index, apps.length, LABEL_BACK_RADIUS),
        );
        const labelFrontGeometries = apps.map((_, index) =>
          createArcFaceGeometry(THREE, index, apps.length, LABEL_FRONT_RADIUS),
        );
        disposableGeometries.push(...labelBackGeometries, ...labelFrontGeometries);

        const reelGroup = new THREE.Group();
        reelGroup.position.y = 0.72;
        reelGroup.rotation.y = targetRotationRef.current;
        panelGeometries.forEach((geometry, index) => {
          const panel = new THREE.Mesh(geometry, [
            reelMaterial,
            innerMaterial,
            edgeMaterial,
          ]);
          reelGroup.add(panel);
          const facets = new THREE.Mesh(geometry, [
            facetMaterial,
            hiddenFacetMaterial,
            hiddenFacetMaterial,
          ]);
          facets.renderOrder = 4;
          reelGroup.add(facets);

          const labelBack = new THREE.Mesh(
            labelBackGeometries[index],
            labelBackMaterial,
          );
          labelBack.position.y = -0.03;
          labelBack.renderOrder = 5;
          reelGroup.add(labelBack);
          const labelFront = new THREE.Mesh(
            labelFrontGeometries[index],
            labelFrontMaterial,
          );
          labelFront.renderOrder = 6;
          reelGroup.add(labelFront);
        });
        scene.add(reelGroup);

        const reflectionGroup = new THREE.Group();
        reflectionGroup.position.y = -2.0;
        reflectionGroup.scale.y = -0.5;
        reflectionGroup.rotation.y = reelGroup.rotation.y;
        reflectionGroup.renderOrder = -1;
        panelGeometries.forEach((geometry, index) => {
          const reflectedPanel = new THREE.Mesh(geometry, [
            reflectionMaterial,
            innerImageReflectionMaterial,
            edgeReflectionMaterial,
          ]);
          reflectionGroup.add(reflectedPanel);
          const reflectedFacets = new THREE.Mesh(geometry, [
            reflectionFacetMaterial,
            hiddenFacetMaterial,
            hiddenFacetMaterial,
          ]);
          reflectedFacets.renderOrder = 3;
          reflectionGroup.add(reflectedFacets);

          const reflectedLabel = new THREE.Mesh(
            labelFrontGeometries[index],
            labelReflectionMaterial,
          );
          reflectedLabel.renderOrder = 3;
          reflectionGroup.add(reflectedLabel);
        });
        scene.add(reflectionGroup);

        const resize = () => {
          if (!renderer) return;
          const width = Math.max(1, canvas.clientWidth);
          const height = Math.max(1, canvas.clientHeight);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.position.z = camera.aspect < PORTRAIT_ASPECT_THRESHOLD
            ? PORTRAIT_CAMERA_Z
            : CAMERA_Z;
          camera.lookAt(0, 0.35, 0);
          camera.updateProjectionMatrix();
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        resize();

        let lastTime = performance.now();
        let facetHoverX = 0;
        let facetHoverY = 0;
        let facetHoverStrength = 0;
        const render = (time: number) => {
          if (disposed || !renderer) return;
          const deltaTime = Math.min((time - lastTime) / 1000, 0.05);
          lastTime = time;
          const desiredRotation =
            targetRotationRef.current + dragRotationRef.current;
          const rotationDamping = reducedMotionRef.current ? 1000 : 10.5;
          reelGroup.rotation.y = THREE.MathUtils.damp(
            reelGroup.rotation.y,
            desiredRotation,
            rotationDamping,
            deltaTime,
          );
          reflectionGroup.rotation.y = reelGroup.rotation.y;

          const pointer = reducedMotionRef.current
            ? { x: 0, y: 0 }
            : pointerTargetRef.current;
          camera.position.x = THREE.MathUtils.damp(
            camera.position.x,
            pointer.x * 0.34,
            7.5,
            deltaTime,
          );
          camera.position.y = THREE.MathUtils.damp(
            camera.position.y,
            0.8 - pointer.y * 0.26,
            7.5,
            deltaTime,
          );
          camera.lookAt(-camera.position.x * 0.12, 0.35, 0);
          reflectionMaterial.uniforms.reflectionOpacity.value =
            0.5 + pointer.y * 0.035;
          const facetStrengthTarget =
            !reducedMotionRef.current && pointerActiveRef.current ? 1 : 0;
          facetHoverX = THREE.MathUtils.damp(
            facetHoverX,
            pointerTargetRef.current.x,
            9,
            deltaTime,
          );
          facetHoverY = THREE.MathUtils.damp(
            facetHoverY,
            pointerTargetRef.current.y,
            9,
            deltaTime,
          );
          facetHoverStrength = THREE.MathUtils.damp(
            facetHoverStrength,
            facetStrengthTarget,
            10,
            deltaTime,
          );
          [facetMaterial, reflectionFacetMaterial].forEach((material) => {
            material.uniforms.hoverX.value = facetHoverX;
            material.uniforms.hoverY.value = facetHoverY;
            material.uniforms.hoverStrength.value = facetHoverStrength;
            material.uniforms.elapsedTime.value = time / 1000;
          });
          [reflectionMaterial, innerImageReflectionMaterial].forEach(
            (material) => {
              material.uniforms.elapsedTime.value = time / 1000;
              material.uniforms.rippleStrength.value = reducedMotionRef.current
                ? 0
                : 1;
            },
          );
          renderer.render(scene, camera);
          animationFrame = window.requestAnimationFrame(render);
        };

        renderer.render(scene, camera);
        onReady();
        animationFrame = window.requestAnimationFrame(render);
      } catch (error) {
        console.error("[reel] WebGL init failed, using DOM fallback:", error);
        if (!disposed) onUnavailable();
      }
    };

    void initialize();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      disposableGeometries.forEach((geometry) => geometry.dispose());
      disposableMaterials.forEach((material) => material.dispose());
      atlasTexture?.dispose();
      labelTexture?.dispose();
      renderer?.dispose();
    };
  }, [apps, onReady, onUnavailable]);

  return (
    <canvas
      ref={canvasRef}
      className="reel-webgl-canvas"
      aria-hidden="true"
    />
  );
}

export const WebGLReel = forwardRef(WebGLReelComponent);
