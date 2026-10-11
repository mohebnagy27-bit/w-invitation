import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./WeddingRings.css";

const MODEL_URL = "/animations/free_ring.glb";
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function disposeObject(object) {
  const geometries = new Set();
  const materials = new Set();

  object.traverse((child) => {
    if (!child.isMesh) return;
    geometries.add(child.geometry);
    const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
    childMaterials.forEach((material) => materials.add(material));
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => {
    Object.values(material).forEach((value) => {
      if (value?.isTexture) value.dispose();
    });
    material.dispose();
  });
}

/**
 * A single transparent WebGL layer. Its scene remains fixed, while the rings'
 * world position is calculated from the real Event Details target bounds.
 */
function WeddingRings() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const target = document.querySelector(".event__ring-target");
    if (!host || !target) return undefined;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // The GLB's original material is almost fully metallic. Because this canvas
    // is transparent, it cannot reflect the page behind it; this compact studio
    // environment gives the original gold texture something soft to reflect.
    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentMap = pmremGenerator.fromScene(environment, 0.04).texture;
    pmremGenerator.dispose();
    disposeObject(environment);
    scene.environment = environmentMap;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.z = 22;

    const keyLight = new THREE.DirectionalLight(0xffedca, 3.1);
    keyLight.position.set(5, 7, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf2dfc4, 1.55);
    fillLight.position.set(-6, 2, 5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 12, 35, 2);
    rimLight.position.set(-3, -2, 8);
    scene.add(rimLight);

    const stage = new THREE.Group();
    stage.visible = false;
    scene.add(stage);

    let raf = 0;
    let mounted = true;
    let lastFrame = performance.now();
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let baseWidth = 6;
    let reducedMotion = false;
    let modelRoot = null;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      reducedMotion = motionQuery.matches;
    };
    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    const resize = () => {
      const { innerWidth: width, innerHeight: height } = window;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (!mounted) {
          disposeObject(gltf.scene);
          return;
        }

        modelRoot = gltf.scene;
        modelRoot.traverse((child) => {
          if (!child.isMesh) return;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            // Keep the GLB's map, base color, metalness, and roughness untouched.
            // This only lets the original PBR material use the studio reflection.
            if (material.isMeshStandardMaterial) material.envMapIntensity = 1.15;
          });
        });
        const bounds = new THREE.Box3().setFromObject(modelRoot);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const normalizedScale = 4.15 / Math.max(size.x, size.y, size.z);
        modelRoot.position.sub(center);

        // The clones share the downloaded model's geometry and materials, but each
        // is parented independently so its tilt remains separately controllable.
        const ringOne = modelRoot.clone(true);
        const ringTwo = modelRoot.clone(true);
        [ringOne, ringTwo].forEach((ring) => {
          ring.scale.setScalar(normalizedScale);
        });

        ringOne.position.set(-1.3, 0.18, 0.15);
        ringOne.rotation.set(-0.76, 0.24, 0.58);
        ringTwo.position.set(1.25, -0.12, -0.28);
        ringTwo.rotation.set(0.68, -0.5, -0.64);
        stage.add(ringOne, ringTwo);

        baseWidth = new THREE.Box3().setFromObject(stage).getSize(new THREE.Vector3()).x;
        stage.visible = true;
      },
      undefined,
      () => {
        // Keep the invitation functional if the optional visual asset cannot load.
        host.classList.add("rings--unavailable");
      }
    );

    const render = (now) => {
      const delta = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const targetBounds = target.getBoundingClientRect();
      const targetCenterX = targetBounds.left + targetBounds.width / 2;
      const targetCenterY = targetBounds.top + targetBounds.height / 2;
      const hasDesktopTarget = targetBounds.width > 0 && targetBounds.height > 0 && viewportWidth > 760;

      // The blend is derived only from the target's real on-screen position.
      // It starts as the target enters the lower half, completes at viewport center,
      // and reverses identically when the visitor scrolls back up.
      const handoffDistance = Math.max(100, Math.min(viewportHeight * 0.3, targetBounds.height * 1.2));
      const anchored = hasDesktopTarget
        ? clamp((viewportHeight * 0.5 + handoffDistance - targetCenterY) / handoffDistance, 0, 1)
        : 0;
      const screenX = THREE.MathUtils.lerp(viewportWidth / 2, targetCenterX, anchored);
      const screenY = THREE.MathUtils.lerp(viewportHeight / 2, targetCenterY, anchored);

      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const worldPerPixel = viewHeight / viewportHeight;
      stage.position.set(
        (screenX - viewportWidth / 2) * worldPerPixel,
        -(screenY - viewportHeight / 2) * worldPerPixel,
        0
      );

      const fixedSize = clamp(Math.min(viewportWidth, viewportHeight) * 0.4, 185, 300);
      const targetSize = hasDesktopTarget
        ? Math.min(targetBounds.width * 0.9, targetBounds.height * 0.84, fixedSize)
        : fixedSize;
      const desiredSize = THREE.MathUtils.lerp(fixedSize, targetSize, anchored);
      stage.scale.setScalar((desiredSize * worldPerPixel) / baseWidth);

      const currentScroll = window.scrollY;
      const rawVelocity = (currentScroll - lastScrollY) / Math.max(delta, 0.001);
      lastScrollY = currentScroll;
      scrollVelocity += (rawVelocity - scrollVelocity) * Math.min(1, delta * 5.5);

      if (!reducedMotion) {
        const gentleScrollBoost = clamp(Math.abs(scrollVelocity) / 2600, 0, 0.5);
        stage.rotation.y += delta * (0.056 + gentleScrollBoost * 0.03);
        stage.rotation.z += delta * (0.011 + gentleScrollBoost * 0.0075);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      motionQuery.removeEventListener("change", syncMotionPreference);
      if (modelRoot) disposeObject(modelRoot);
      environmentMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="rings" ref={hostRef} aria-hidden="true" />;
}

export default WeddingRings;
