import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

import './App.css'

import { OBJLoader } from 'three/examples/jsm/Addons.js';
import { MTLLoader } from 'three/examples/jsm/Addons.js';
import { FBXLoader } from 'three/examples/jsm/Addons.js';

function TrackModel() {
    const result = useLoader(FBXLoader, 'track.fbx');
    return <primitive object={result} />
}

function CarModel() {
    const carRef = useRef();
    const cameraRef = useRef();
    const materials = useLoader(MTLLoader, '/car.mtl')
    const car = useLoader(OBJLoader, '/car.obj', (loader) => {
        materials.preload();
        loader.setMaterials(materials);
    })
    const cameraOffset = [0.7,0.3,0]
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
    });

    return (
        <>
            <primitive 
                ref={carRef} 
                object={car} 
                position={[-8, 0, -3.5]} 
                scale={0.1} 
                rotation={[-Math.PI/2, 0, -Math.PI/2]}
            />
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

  return (
    <div id="canvas-container" >
      <Canvas  >
        <axesHelper />
        <TrackModel />
        <CarModel />
        <OrbitControls />
        <directionalLight position={[2,5,1]} />
      </Canvas>

    </div>
  )
}

export default App
