import { Canvas, useLoader, useFrame} from '@react-three/fiber';
import { useRef, useState, useEffect, useMemo } from 'react';
import { KeyboardControls, OrbitControls, PerspectiveCamera, useKeyboardControls, } from '@react-three/drei';

import './App.css'

import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { MTLLoader } from 'three/examples/jsm/Addons.js';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { Physics, RigidBody } from '@react-three/rapier';

function TrackModel() {
    const result = useLoader(FBXLoader, 'track.fbx');
    return <primitive object={result} />
}

export const Controls = {
    forward: "forward",
    back: "back",
    left: "left",
    right: "right"
}

function CarModel() {
    const carRef = useRef();
    const cameraRef = useRef();
    const apiRef = useRef();
    const materials = useLoader(MTLLoader, '/car.mtl')
    const car = useLoader(OBJLoader, '/car.obj', (loader) => {
        materials.preload();
        loader.setMaterials(materials);
    })
    const cameraOffset = [-2,3,-2]

    const leftPressed = useKeyboardControls((state) => state[Controls.left]);
    const rightPressed = useKeyboardControls((state) => state[Controls.right]);
    const forwardPressed = useKeyboardControls((state) => state[Controls.forward]);
    const backPressed = useKeyboardControls((state) => state[Controls.back]);

    // const handleMovement = () => {
    //     if (!apiRef.current) return;
    //     const impulse = { x: 0, y: 0, z: 0 };
    //     if (leftPressed) impulse.x = 0.05;
    //     if (rightPressed) impulse.x = 0.1;
    //     if (forwardPressed) impulse.z = 0.1;
    //     if (backPressed) impulse.z = 0.1;

    //     apiRef.current.applyImpulse(impulse, true);
    // };

    const handleMovement = () => {

        const impulse = { x: 0, y: 0, z: 0 };
        const torque = { x: 0, y: 0, z: 0 };

        if (leftPressed) {
            impulse.z += 0.0001;
            torque.x += 0.00001;
        }
        if (rightPressed) {
            impulse.z -= 0.0001;
            torque.x -= 0.00002;
        }
        if (forwardPressed) {
            impulse.x -= 0.001;
            console.log("forward pressed")
        }
        if (backPressed) {
            impulse.x += 0.001;
            torque.z += 0.00002;   
        }

        apiRef.current.applyImpulse(impulse);
        apiRef.current.applyTorqueImpulse(torque);
    }

    useFrame((state, delta) => {
        if (carRef.current && cameraRef.current) {
            const carPosition = carRef.current.position;
            
            cameraRef.current.position.set(
                carPosition.x + cameraOffset[0],
                carPosition.y + cameraOffset[1],
                carPosition.z + cameraOffset[2]
            );
            
            cameraRef.current.lookAt(carPosition);
        }
        // if (!apiRef.current || !cameraRef.current) return;

        // const { x, y, z } = apiRef.current.translation();

        // cameraRef.current.position.set(
        //     x + cameraOffset[0],
        //     y + cameraOffset[1],
        //     z + cameraOffset[2]
        // );

        // cameraRef.current.lookAt(carRef.current.position);
        handleMovement();
        
    });

    return (
        <>
        <RigidBody 
                ref={apiRef}
                type="dynamic"
                mass={1}
                friction={0.5}
                restitution={0.3}
                colliders = "hull"
            >
                
                <primitive
                    ref={carRef}
                    object={car}
                    position={[-8, 1, -3.5]} 
                    scale={0.1}
                    rotation={[-Math.PI/2, 0, -Math.PI/2]}
                />
            </RigidBody>

            <PerspectiveCamera 
                ref={cameraRef}
                makeDefault
                position={[-8 + cameraOffset[0], 0 + cameraOffset[1], -3.5 + cameraOffset[2]]}
                fov={75}
            />
        </>
    );
}

function App() {
    const map = useMemo(
        () => [
            { name: Controls.forward, keys: ["ArrowUp", "KeyW"]},
            { name: Controls.back, keys: ["ArrowDown", "KeyS"]},
            { name: Controls.left, keys: ["ArrowLeft", "KeyA"]},
            { name: Controls.right, keys: ["ArrowRight", "KeyD"]}
        ])
    return (
        <div id="canvas-container" >
        <Canvas  >
            <axesHelper />
            <OrbitControls />
            <directionalLight position={[2,5,1]} />
            <KeyboardControls map = { map }>
                <Physics gravity={[0, -9.81, 0]} debug>
                    <RigidBody type="fixed" >
                        <TrackModel />
                    </RigidBody>
                    <CarModel />
                </Physics>
            </KeyboardControls>
        </Canvas>

        </div>
    )
    }

export default App