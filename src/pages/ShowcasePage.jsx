import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { extend, Canvas, useFrame } from '@react-three/fiber';
import { Image, Environment, ScrollControls, useScroll, useTexture } from '@react-three/drei';
import { easing } from 'maath';

// ==========================================
// 1. הגדרות מחלקות Three.js מותאמות אישית
// ==========================================
class BentPlaneGeometry extends THREE.PlaneGeometry {
    constructor(radius, ...args) {
        super(...args);
        let p = this.parameters;
        let hw = p.width * 0.5;
        let a = new THREE.Vector2(-hw, 0);
        let b = new THREE.Vector2(0, radius);
        let c = new THREE.Vector2(hw, 0);
        let ab = new THREE.Vector2().subVectors(a, b);
        let bc = new THREE.Vector2().subVectors(b, c);
        let ac = new THREE.Vector2().subVectors(a, c);
        let r = (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
        let center = new THREE.Vector2(0, radius - r);
        let baseV = new THREE.Vector2().subVectors(a, center);
        let baseAngle = baseV.angle() - Math.PI * 0.5;
        let arc = baseAngle * 2;
        let uv = this.attributes.uv;
        let pos = this.attributes.position;
        let mainV = new THREE.Vector2();
        for (let i = 0; i < uv.count; i++) {
            let uvRatio = 1 - uv.getX(i);
            let y = pos.getY(i);
            mainV.copy(c).rotateAround(center, arc * uvRatio);
            pos.setXYZ(i, mainV.x, y, -mainV.y);
        }
        pos.needsUpdate = true;
    }
}

class MeshSineMaterial extends THREE.MeshBasicMaterial {
    constructor(parameters = {}) {
        super(parameters);
        this.setValues(parameters);
        this.time = { value: 0 };
    }
    onBeforeCompile(shader) {
        shader.uniforms.time = this.time;
        shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`
        );
    }
}

extend({ MeshSineMaterial, BentPlaneGeometry });

// ==========================================
// 2. קומפוננטות העזר התלת-ממדיות
// ==========================================
function Rig(props) {
    const ref = useRef();
    const scroll = useScroll();
    useFrame((state, delta) => {
        ref.current.rotation.y = -scroll.offset * (Math.PI * 2); // סיבוב הקרוסלה לפי הגלילה
        state.events.update();
        easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y + 1.5, 10], 0.3, delta);
        state.camera.lookAt(0, 0, 0);
    });
    return <group ref={ref} {...props} />;
}

function Carousel({ projects, radius = 2 }) {
    // אופציה 1: סינון פרויקטים שאין להם תמונה בכלל
    const validProjects = projects.filter(proj => proj.imageUrl);
    const count = validProjects.length;

    return validProjects.map((project, i) => {
        // אופציה 2: אם אתה מעדיף להציג פרויקטים ללא תמונה, השתמש בתמונת גיבוי
        // const fallbackImage = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80';
        // const finalUrl = project.imageUrl || fallbackImage;

        return (
            <Card
                key={project.id || i}
                url={project.imageUrl} // אם בחרת באופציה 2, שנה ל- finalUrl
                position={[Math.sin((i / count) * Math.PI * 2) * radius, 0, Math.cos((i / count) * Math.PI * 2) * radius]}
                rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
            />
        );
    });
}

function Card({ url, ...props }) {
    const ref = useRef();
    const [hovered, hover] = useState(false);
    const pointerOver = (e) => (e.stopPropagation(), hover(true));
    const pointerOut = () => hover(false);
    
    useFrame((state, delta) => {
        easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta);
        easing.damp(ref.current.material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta);
        easing.damp(ref.current.material, 'zoom', hovered ? 1 : 1.5, 0.2, delta);
    });

    return (
        <Image
            ref={ref}
            url={url}
            transparent
            side={THREE.DoubleSide}
            onPointerOver={pointerOver}
            onPointerOut={pointerOut}
            {...props}
        >
            <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
        </Image>
    );
}

function Banner(props) {
    const ref = useRef();
    // החלף את ה-URL הזה לתמונה שקופה/טקסטורה שמתאימה לפרויקט שלך (למשל הלוגו שלך חוזר על עצמו)
    const texture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/uv_grid_opengl.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    const scroll = useScroll();
    
    useFrame((state, delta) => {
        ref.current.material.time.value += Math.abs(scroll.delta) * 4;
        ref.current.material.map.offset.x += delta / 2;
    });
    
    return (
        <mesh ref={ref} {...props}>
            <cylinderGeometry args={[1.6, 1.6, 0.14, 128, 16, true]} />
            <meshSineMaterial map={texture} map-anisotropy={16} map-repeat={[10, 1]} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
    );
}

// ==========================================
// 3. הקומפוננטה הראשית (מייצאים אותה)
// ==========================================
export default function ShowcasePage (){
    const [myProjects, setMyProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const MY_EMAIL = "gurd6116@gmail.com"; // המייל שלך לסינון

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/projects');
                const data = await response.json();
                const filtered = data.filter(proj => proj.email === MY_EMAIL);
                setMyProjects(filtered);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (isLoading) {
        return <div className="loading-screen">טוען חוויה תלת-ממדית...</div>;
    }

    if (myProjects.length === 0) {
        return <div className="loading-screen">אין עדיין פרויקטים להצגה.</div>;
    }

    return (
        <>
        <p>test</p>
        <div className="portfolio-3d-wrapper">
            <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
                <fog attach="fog" args={['#a79', 8.5, 12]} />
                <ScrollControls pages={4} infinite>
                    <Rig rotation={[0, 0, 0.15]}>
                        <Carousel projects={myProjects} radius={1.8} />
                    </Rig>
                    <Banner position={[0, -0.15, 0]} />
                </ScrollControls>
                <Environment preset="dawn" background blur={0.5} />
            </Canvas>

            {/* שכבת ה-HTML מעל הקנבס - לעיצוב והכוונה */}
            <div className="portfolio-overlay">
                <div className="portfolio-header">הפורטפוליו שלי</div>
                <div className="portfolio-scroll-hint">גלול למטה / למעלה לסיבוב</div>
            </div>
        </div>
        </>
    );
}