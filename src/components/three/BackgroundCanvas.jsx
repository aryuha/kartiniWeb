import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const BackgroundCanvas = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        const width = mount.clientWidth;
        const height = mount.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mount.appendChild(renderer.domElement);

        // Grid Helper
        const gridHelper = new THREE.GridHelper(40, 40, 0x90c4e8, 0x90c4e8);
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        gridHelper.position.y = -2;
        scene.add(gridHelper);

        // Floating Particles
        const particleGeo = new THREE.BufferGeometry();
        const count = 80;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x3b82f6,
            size: 0.04,
            transparent: true,
            opacity: 0.6,
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Torus rings
        const ringGeo = new THREE.TorusGeometry(3, 0.008, 8, 80);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.12,
        });
        const ring1 = new THREE.Mesh(ringGeo, ringMat);
        ring1.rotation.x = Math.PI / 3;
        scene.add(ring1);

        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(2, 0.006, 8, 80),
            new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.1 })
        );
        ring2.rotation.x = Math.PI / 4;
        ring2.rotation.z = Math.PI / 6;
        scene.add(ring2);

        // Animation
        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            particles.rotation.y += 0.0005;
            ring1.rotation.z += 0.001;
            ring2.rotation.y += 0.0008;
            renderer.render(scene, camera);
        };
        animate();

        // Resize
        const handleResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            mount.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default BackgroundCanvas;