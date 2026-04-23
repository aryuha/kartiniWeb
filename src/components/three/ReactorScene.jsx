// src/components/three/ReactorScene.jsx
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import ReactorModel from './ReactorModel'

const CORE_Y = -1.5

export default function ReactorScene({ rodPositions, reactorData, isScrammed, movingRods }) {
    const power = reactorData?.power || 0
    const isOperating = power > 5 && !isScrammed

    return (
        <Canvas
            shadows
            gl={{ antialias: true, alpha: false }}
            style={{ background: '#dce8f5' }}
        >
            <PerspectiveCamera
                makeDefault
                position={[9, 9, 9]}
                fov={45}
                near={0.1}
                far={300}
            />

            <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={4}
                maxDistance={40}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 1.6}
                target={[0, 0.5, 0]}
            />

            {/* ✅ 2. Ambient disesuaikan agar model tetap terlihat di bg terang */}
            <ambientLight intensity={4.5} color="#e8f0ff" />

            {/* Directional lights */}
            <directionalLight
                position={[10, 22, 10]} intensity={3.5}
                color="#ffffff" castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <directionalLight position={[-8, 14, -6]} intensity={2.0} color="#aaccff" />
            <directionalLight position={[0, 2, 18]} intensity={2.0} color="#ffffff" />
            <directionalLight position={[18, 2, 0]} intensity={1.5} color="#ddeeff" />

            {/* Lampu di dalam teras */}
            <pointLight
                position={[0, CORE_Y, 0]}
                intensity={5}
                color="#ff4422"
                distance={10}
            />
            <pointLight
                position={[0, 2, 0]}
                intensity={2.5}
                color="#ffffff"
                distance={8}
            />

            {/* Cherenkov lights */}
            {isOperating && (
                <>
                    <pointLight
                        position={[0, CORE_Y, 0]}
                        intensity={power / 5}
                        color="#4488ff"
                        distance={16}
                    />
                    <pointLight
                        position={[0, CORE_Y + 1.8, 0]}
                        intensity={power / 8}
                        color="#6655ff"
                        distance={12}
                    />
                    <pointLight
                        position={[0, CORE_Y - 1.5, 0]}
                        intensity={power / 10}
                        color="#3366ff"
                        distance={10}
                    />
                    <pointLight
                        position={[0, CORE_Y + 1, 0]}
                        intensity={power / 6}
                        color="#0044ff"
                        distance={20}
                    />
                </>
            )}

            
            <gridHelper
                args={[50, 50, '#222222', '#444444']}
                position={[0, -5.5, 0]}
            />

            <Suspense fallback={null}>
                <ReactorModel
                    rodPositions={rodPositions}
                    isScrammed={isScrammed}
                    movingRods={movingRods}
                    power={power}
                    isOperating={isOperating}
                />
            </Suspense>
        </Canvas>
    )
}