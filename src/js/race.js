import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

const trackURL = new URL('../../assets/track.fbx', import.meta.url);
const carURL = new URL('../../assets/car.obj', import.meta.url);
const carMaterialsURL = new URL('../../assets/car.mtl', import.meta.url).href;

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0,-9.81,0)
})
const timeStep = 1 / 60



const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const axes = new THREE.AxesHelper(5);

scene.add(axes);
camera.position.set(0,2,5);


const fbxLoader = new FBXLoader();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

let track;
fbxLoader.load(trackURL.href,function(fbx){
    track = fbx;
    scene.add(track);
    track.position.set(0,0,0);
    track.scale.set(2,2,2);
},undefined,function(error){console.error(error)}
);


let car;

mtlLoader.load(carMaterialsURL, function(mtl){
    mtl.preload();
    objLoader.setMaterials(mtl);
});
objLoader.load(carURL.href,function(obj){
        car = obj;
        scene.add(car);
        car.position.set(40,0,27);
        car.scale.set(0.4,0.4,0.4);
        car.rotation.x = -Math.PI / 2;
        car.rotation.z = Math.PI / 2;

        car.run = false;
        car.speed = 0;
        car.rSpeed = 0;
        car.dirRotation = 0;
        car.acceleration = 0.001;
        car.deceleration = 0.0009;
        car.maxSpeed = 0.1
        car.add(camera);
        camera.position.set(0, 5, 3);
        camera.lookAt(car.position);

        car.brake = function () { car.run = false; };
        car.cancelBrake = function () { car.speed = 0; };

    },undefined,function(error){console.error(error)}
);



const ambientLight = new THREE.AmbientLight(0x404040, 5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x333333);
scene.add(directionalLight);

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

const keys = {};
const speed = 0.1;
const rotationSpeed = 0.05;

document.body.addEventListener('keydown', function (e) {
    if (!car) return;
    switch (e.key.toLowerCase()) {
        case 'w':
            car.run = true;
            break;
        case 'a':
            car.rSpeed = rotationSpeed / 5;
            break;
        case 'd':
            car.rSpeed = -rotationSpeed / 5;
            break;
        case 's':
            car.brake();
            break;
    }
});

document.body.addEventListener('keyup', function (e) {
    if (!car) return;
    switch (e.key.toLowerCase()) {
        case 'w':
            car.run = false;
            break;
        case 'a':
        case 'd':
            car.rSpeed = 0;
            break;
        case 's':
            car.cancelBrake();
            console.log(car.speed);
            break;
    }
});

function updateCar() {
    if (!car) return;

    if (car.run) {
        car.speed += car.acceleration;
        if (car.speed > car.maxSpeed) {
            car.speed = car.maxSpeed;
        }
    } else {
        car.speed -= car.deceleration;
        if (car.speed < 0) {
            car.speed = 0;
        }
    }
    let speed = car.speed; 
    if (speed === 0) return;

    car.dirRotation += car.rSpeed;
    let speedX = Math.sin(car.dirRotation) * speed;
    let speedZ = Math.cos(car.dirRotation) * speed;
    //car.rotation.x = -Math.PI / 2;
    car.rotation.z = car.dirRotation;
    car.position.x += speedX;
    car.position.z += speedZ;
}

function animate() {
    world.step(timeStep)
    updateCar();
    renderer.render(scene, camera);
    
    if (car){
        const orbit = new OrbitControls(camera, renderer.domElement);
        orbit.target.set(car.position.x, car.position.y, car.position.z);
        orbit.update();

    }
}

renderer.setAnimationLoop(animate);

