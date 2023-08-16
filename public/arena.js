// import * as THREE from "../node_modules/three/src/Three";
// const THREE = require('three/src/Three')
// import GLTFLoader from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
// const GLTFLoader = require('three/examples/jsm/loaders/GLTFLoader')
// const THREE = 


const gltfLoader = new THREE.GLTFLoader();

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

const timeline = gsap.timeline();

gltfLoader.load("/models/model.glb", (gltf) => {

  gltf.scene.scale.set(3, 3, 3);
  gltf.scene.rotation.set(0.1253, -1.5, -0.0918);
  scene.add(gltf.scene);

  timeline.to(gltf.scene.rotation, { y: -0.02, duration: 1 });
  timeline.to(
    gltf.scene.scale,
    { x: 2.75, y: 2.75, z: 2.75, duration: 1 },
    "-=1"
  );
  timeline.to(gltf.scene.position, { x: 1.1, duration: 1 });
  timeline.to(gltf.scene.rotation, { y: -0.4, duration: 1 }, "-=1");
  timeline.to(gltf.scene.scale, { x: 3, y: 3, z: 3, duration: 1 }, "-=1");
});

const pointLight = new THREE.AmbientLight(0xffffff, 1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 3);

pointLight2.position.x = 3.3;
pointLight2.position.y = -2.5;
pointLight2.position.z = 3.6;

scene.add(pointLight2);

const sizes = {
  width: 1366,
  height: 768,
};

window.addEventListener("resize", () => {

  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0.15;
camera.position.y = 1.05;
camera.position.z = 2;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  // width: sizes.width
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// tick();