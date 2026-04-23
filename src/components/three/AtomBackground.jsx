// src/components/three/AtomBackground.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AtomBackground() {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const W = mount.clientWidth;
        const H = mount.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
        // ✅ Lebih dekat
        camera.position.set(10, 0, 10);

        // ═══════════════════════════════
        // ATOM BESAR - tengah
        // ═══════════════════════════════
        const atomGroup = new THREE.Group();
        scene.add(atomGroup);
        // ✅ Scale lebih besar
        atomGroup.scale.setScalar(1.4);

        // Inti atom
        const nucleusGeo = new THREE.SphereGeometry(0.65, 32, 32); // ✅ Lebih besar
        const nucleus = new THREE.Mesh(nucleusGeo,
            new THREE.MeshBasicMaterial({ color: 0x1e4fd8 })
        );
        atomGroup.add(nucleus);

        // Glow inti
        const glowGeo = new THREE.SphereGeometry(0.95, 32, 32); // ✅ Lebih besar
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x3b82f6, transparent: true, opacity: 0.22,
        });
        atomGroup.add(new THREE.Mesh(glowGeo, glowMat));

        // Glow luar (halo)
        const haloGeo = new THREE.SphereGeometry(1.35, 32, 32);
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0x60a5fa, transparent: true, opacity: 0.07,
        });
        atomGroup.add(new THREE.Mesh(haloGeo, haloMat));

        // Orbit elektron - ✅ Lebih besar
        const orbits = [
            { rx: 4.2, ry: 1.5, rotX: 0, rotY: 0, color: 0x2563eb, speed: 0.8 },
            { rx: 4.2, ry: 1.5, rotX: Math.PI / 3, rotY: 0, color: 0x3b82f6, speed: -0.6 },
            { rx: 4.2, ry: 1.5, rotX: -Math.PI / 3, rotY: Math.PI / 2, color: 0x60a5fa, speed: 0.5 },
        ];

        const electronGroups = [];
        orbits.forEach(o => {
            const g = new THREE.Group();
            g.rotation.x = o.rotX;
            g.rotation.y = o.rotY;
            atomGroup.add(g);

            // ✅ Ring lebih tebal & jelas
            const ringGeo = new THREE.TorusGeometry(o.rx, 0.038, 8, 120);
            const ringMat = new THREE.MeshBasicMaterial({
                color: o.color, transparent: true, opacity: 0.85,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.scale.y = o.ry / o.rx;
            g.add(ring);

            // ✅ Elektron lebih besar
            const eGeo = new THREE.SphereGeometry(0.22, 16, 16);
            const eMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const electron = new THREE.Mesh(eGeo, eMat);

            // ✅ Glow elektron lebih besar
            const egGeo = new THREE.SphereGeometry(0.38, 16, 16);
            const egMat = new THREE.MeshBasicMaterial({
                color: o.color, transparent: true, opacity: 0.55,
            });
            electron.add(new THREE.Mesh(egGeo, egMat));
            g.add(electron);

            electronGroups.push({
                g, electron,
                rx: o.rx, ry: o.ry,
                speed: o.speed,
                angle: Math.random() * Math.PI * 2,
            });
        });

        // ═══════════════════════════════
        // ATOM KECIL - kanan atas
        // ═══════════════════════════════
        const atomSmall1 = new THREE.Group();
        atomSmall1.position.set(22, 5, -5);
        atomSmall1.scale.setScalar(0.5);
        scene.add(atomSmall1);

        atomSmall1.add(new THREE.Mesh(
            new THREE.SphereGeometry(0.38, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6 })
        ));

        const smallElectrons1 = [];
        [
            { rx: 3.2, ry: 1.1, rotX: 0, color: 0x60a5fa, speed: 1.2 },
            { rx: 3.2, ry: 1.1, rotX: Math.PI / 2.5, color: 0x93c5fd, speed: -0.9 },
        ].forEach(o => {
            const g = new THREE.Group();
            g.rotation.x = o.rotX;
            atomSmall1.add(g);
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(o.rx, 0.025, 8, 80),
                new THREE.MeshBasicMaterial({ color: o.color, transparent: true, opacity: 0.55 })
            );
            ring.scale.y = o.ry / o.rx;
            g.add(ring);
            const e = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 12, 12),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            g.add(e);
            smallElectrons1.push({ g, electron: e, rx: o.rx, ry: o.ry, speed: o.speed, angle: Math.random() * Math.PI * 2 });
        });

        // ═══════════════════════════════
        // ATOM KECIL - kanan bawah
        // ═══════════════════════════════
        const atomSmall2 = new THREE.Group();
        atomSmall2.position.set(25, -5, -5);
        atomSmall2.scale.setScalar(0.45);
        scene.add(atomSmall2);

        atomSmall2.add(new THREE.Mesh(
            new THREE.SphereGeometry(0.38, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x1e4fd8, transparent: true, opacity: 0.5 })
        ));

        const smallElectrons2 = [];
        [
            { rx: 3.2, ry: 1.1, rotX: Math.PI / 4, rotY: 0, color: 0x2563eb, speed: -1.0 },
            { rx: 3.2, ry: 1.1, rotX: -Math.PI / 3, rotY: Math.PI / 3, color: 0x3b82f6, speed: 0.7 },
        ].forEach(o => {
            const g = new THREE.Group();
            g.rotation.x = o.rotX;
            g.rotation.y = o.rotY || 0;
            atomSmall2.add(g);
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(o.rx, 0.025, 8, 80),
                new THREE.MeshBasicMaterial({ color: o.color, transparent: true, opacity: 0.5 })
            );
            ring.scale.y = o.ry / o.rx;
            g.add(ring);
            const e = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 12, 12),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            g.add(e);
            smallElectrons2.push({ g, electron: e, rx: o.rx, ry: o.ry, speed: o.speed, angle: Math.random() * Math.PI * 2 });
        });

        // ═══════════════════════════════
        // PARTIKEL MENGAMBANG
        // ═══════════════════════════════
        const particleCount = 120;
        const pPositions = new Float32Array(particleCount * 3);
        const pSpeeds = [];
        for (let i = 0; i < particleCount; i++) {
            pPositions[i * 3] = (Math.random() - 0.5) * 30;
            pPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            pSpeeds.push({
                x: (Math.random() - 0.5) * 0.003,
                y: (Math.random() - 0.5) * 0.003,
            });
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
        const particles = new THREE.Points(pGeo,
            new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.06, transparent: true, opacity: 0.7 })
        );
        scene.add(particles);

        // Grid
        const gridHelper = new THREE.GridHelper(40, 30, 0x93c5fd, 0x93c5fd);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.08;
        gridHelper.position.y = -8;
        scene.add(gridHelper);

        // ═══════════════════════════════
        // ANIMASI
        // ═══════════════════════════════
        let frameId;
        let t = 0;

        const moveElectrons = (list, dt) => {
            list.forEach(item => {
                item.angle += item.speed * dt;
                item.electron.position.x = Math.cos(item.angle) * item.rx;
                item.electron.position.y = Math.sin(item.angle) * item.ry;
                item.electron.position.z = 0;
            });
        };

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const dt = 0.016;
            t += dt;

            // Atom utama berputar
            atomGroup.rotation.y += 0.003;

            // Elektron bergerak
            moveElectrons(electronGroups, dt);
            moveElectrons(smallElectrons1, dt);
            moveElectrons(smallElectrons2, dt);

            // Atom kecil berputar
            atomSmall1.rotation.y += 0.004;
            atomSmall2.rotation.y -= 0.003;

            // ✅ Nucleus pulse lebih dramatis
            const pulse = 1 + Math.sin(t * 2) * 0.12;
            nucleus.scale.setScalar(pulse);
            glowMat.opacity = 0.18 + Math.sin(t * 2) * 0.12;
            haloMat.opacity = 0.05 + Math.sin(t * 1.5) * 0.04;

            // Partikel bergerak
            const pos = pGeo.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                pos[i * 3] += pSpeeds[i].x;
                pos[i * 3 + 1] += pSpeeds[i].y;
                if (pos[i * 3] > 15 || pos[i * 3] < -15) pSpeeds[i].x *= -1;
                if (pos[i * 3 + 1] > 10 || pos[i * 3 + 1] < -10) pSpeeds[i].y *= -1;
            }
            pGeo.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        };
        animate();

        // Resize
        const onResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', onResize);
            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}