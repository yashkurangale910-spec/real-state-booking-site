import React, { useEffect, useRef, useState, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, MapPin, Menu, Shield, Thermometer, Volume2, Share2, Heart, Download, ArrowLeft, ArrowRight, ArrowUpRight, Instagram, Linkedin, Twitter, Search, Grid, List as ListIcon, ChevronDown, X } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei';

gsap.registerPlugin(ScrollTrigger);

const Magnetic = ({ children }) => {
  const ref = useRef(null);
  useEffect(() => {
    const xTo = gsap.quickTo(ref.current, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(ref.current, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const mouseMove = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = ref.current.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.25); yTo(y * 0.25);
    };
    const mouseLeave = () => { xTo(0); yTo(0); };
    ref.current.addEventListener("mousemove", mouseMove);
    ref.current.addEventListener("mouseleave", mouseLeave);
    return () => {
      ref.current?.removeEventListener("mousemove", mouseMove);
      ref.current?.removeEventListener("mouseleave", mouseLeave);
    };
  }, []);
  return React.cloneElement(children, { ref });
};

const CustomCursor = () => {
  const cursorRef = useRef(null);
  useEffect(() => {
    const moveCursor = (e) => { gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power3.out' }); };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);
  return <div ref={cursorRef} style={{ position: 'fixed', top: -10, left: -10, width: '20px', height: '20px', border: '1px solid #c29a5b', borderRadius: '50%', zIndex: 10000, pointerEvents: 'none', mixBlendMode: 'difference' }} />;
};

const Loader = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => { if (prev >= 100) { clearInterval(timer); setTimeout(onFinished, 500); return 100; } return prev + 1; });
    }, 12);
    return () => clearInterval(timer);
  }, [onFinished]);
  return (
    <div className="loader-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#0a0a0a', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.4em', opacity: 0.4, marginBottom: '20px', color: '#fff' }}>PRECISION IN PROGRESS</div>
      <div style={{ fontSize: '48px', fontFamily: '"Cormorant Garamond", serif', color: '#fff', fontWeight: 700, letterSpacing: '0.2em' }}>NESTLY</div>
      <div style={{ color: '#fff', fontSize: '64px', fontWeight: 300, marginTop: '20px' }}>{progress}%</div>
    </div>
  );
};

const AnimatedMesh = () => {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });
  return (
    <Float speed={3} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.8}>
        <torusKnotGeometry args={[1, 0.4, 256, 32]} />
        <MeshDistortMaterial color="#2d5a5a" distort={0.6} speed={2} roughness={0.05} metalness={1} />
      </mesh>
    </Float>
  );
};

const ThreeBackground = () => (
  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.6 }}>
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <AnimatedMesh />
    </Canvas>
  </div>
);

const ParallaxImage = ({ src, alt, style }) => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.to(ref.current, { y: -50, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
  }, []);
  return (
    <div style={{ overflow: 'hidden', ...style }}>
      <img ref={ref} src={src} alt={alt} style={{ width: '100%', height: '115%', objectFit: 'cover', marginTop: '-15px' }} />
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); 
  const [activeProperty, setActiveProperty] = useState(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    const lenis = new Lenis();
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    return () => { if (lenis) lenis.destroy(); ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, [loading, view]);

  const changeView = (newView, prop = null) => {
    gsap.to(mainRef.current, { opacity: 0, duration: 0.4, onComplete: () => {
      setView(newView); setActiveProperty(prop); window.scrollTo(0, 0);
      gsap.to(mainRef.current, { opacity: 1, duration: 0.6 });
    }});
  };

  if (loading) return <Loader onFinished={() => setLoading(false)} />;

  const properties = [
    { id: 1, title: "Aurelia Heights", location: "Worli Seaface, Mumbai", price: "₹48.5 Cr", img: "/hero.png", beds: "4", sqft: "6,200", badge1: "EXCLUSIVE", badge2: "OFF-MARKET" },
    { id: 2, title: "The Obsidian Penthouse", location: "Golf Course Road, Gurgaon", price: "₹32.0 Cr", img: "/curated.png", beds: "5", sqft: "8,450", badge1: "FEATURED ESTATE" },
    { id: 3, title: "Celestial Pavilion", location: "Jubilee Hills, Hyderabad", price: "₹65.0 Cr", img: "/structural.png", beds: "6", sqft: "12,000", badge1: "EXCLUSIVE" },
    { id: 4, title: "Heritage Monolith", location: "Sadashivnagar, Bangalore", price: "₹22.5 Cr", img: "/flow.png", beds: "4", sqft: "5,800", badge1: "EXCLUSIVE PORTFOLIO" }
  ];

  return (
    <div ref={mainRef} style={{ cursor: 'none', background: '#080808', minHeight: '100vh', color: '#fff' }}>
      <CustomCursor />
      
      {inquiryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ position: 'relative', width: '500px', padding: '60px', background: '#0a0a0a', border: '1px solid #222' }}>
              <button onClick={() => setInquiryOpen(false)} style={{ position: 'absolute', top: '30px', right: '30px', color: '#fff' }}><X size={24} /></button>
              <h2 className="serif" style={{ fontSize: '32px', marginBottom: '30px' }}>Inquiry</h2>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <input type="text" placeholder="FULL NAME" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #333', padding: '15px 0', color: '#fff', fontSize: '10px' }} />
                <input type="email" placeholder="EMAIL ADDRESS" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #333', padding: '15px 0', color: '#fff', fontSize: '10px' }} />
                <button className="btn-primary" style={{ background: '#c29a5b', padding: '18px' }} type="button" onClick={() => setInquiryOpen(false)}>SUBMIT INQUIRY</button>
              </form>
           </div>
        </div>
      )}

      <header style={{ zIndex: 1000 }}>
        <div className="container nav-container">
          <div className="logo" onClick={() => changeView('home')} style={{ cursor: 'pointer' }}>NESTLY</div>
          <nav className="nav-links">
            <Magnetic><a href="#" onClick={() => changeView('listing')}>Collections</a></Magnetic>
            <Magnetic><a href="#" onClick={() => changeView('listing')}>Residences</a></Magnetic>
            <Magnetic><a href="#" onClick={() => changeView('home')}>The Legacy</a></Magnetic>
            <Magnetic><a href="#" onClick={() => setInquiryOpen(true)}>Concierge</a></Magnetic>
            <Magnetic><a href="#" onClick={() => setInquiryOpen(true)}>Contact</a></Magnetic>
          </nav>
          <Magnetic><button className="btn-primary" onClick={() => setInquiryOpen(true)} style={{ background: '#c29a5b', color: '#000', padding: '12px 25px', fontSize: '10px' }}>INQUIRE NOW</button></Magnetic>
        </div>
      </header>

      <main>
        {view === 'home' && (
          <>
            <section className="hero" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <ThreeBackground />
              <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: '9px', letterSpacing: '0.4em', marginBottom: '25px', opacity: 0.4 }}>ESTD. 2026 IN GENEVA</p>
                <h1 className="reveal" style={{ fontSize: 'clamp(50px, 8vw, 130px)', fontWeight: 300, lineHeight: 0.85 }}>Where <br/><span className="serif" style={{ fontStyle: 'italic', fontWeight: 500 }}>Architecture</span><br/>Meets Soul.</h1>
                <div className="reveal" style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '50px', alignItems: 'center' }}>
                   <Magnetic><button className="btn-primary" onClick={() => changeView('listing')} style={{ background: '#c29a5b', padding: '18px 45px' }}>EXPLORE COLLECTION</button></Magnetic>
                   <button onClick={() => changeView('listing')} style={{ fontSize: '10px', letterSpacing: '0.1em', opacity: 0.6, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '3px' }}>VIEW PRIMARY GALLERY</button>
                </div>
              </div>
            </section>
            <div className="ticker-wrap"><div className="ticker">{Array(10).fill(0).map((_, i) => <span key={i}>THE OBSIDIAN TOWER — CELESTIAL MEADOWS — AZURE SANCTUARY — THE MARBLE SPIKE</span>)}</div></div>
            <section className="grid-section">
              <div className="container">
                <div className="project-grid" style={{ gap: '40px' }}>
                   <div className="reveal" style={{ gridColumn: 'span 8', position: 'relative' }} onClick={() => changeView('listing')}><ParallaxImage src="/hero.png" alt="Hero" style={{ height: '700px' }} /></div>
                   <div className="reveal" style={{ gridColumn: 'span 4' }}><ParallaxImage src="/curated.png" alt="Curated" style={{ height: '400px' }} /></div>
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'listing' && (
          <section className="container" style={{ padding: '150px 0' }}>
            <h1 className="serif" style={{ fontSize: '64px', marginBottom: '60px' }}>Available Estates</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px' }}>
              {properties.map(p => (
                <div key={p.id} className="reveal" style={{ background: '#111', border: '1px solid #222', cursor: 'pointer' }} onClick={() => changeView('detail', p)}>
                  <img src={p.img} alt={p.title} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
                  <div style={{ padding: '30px' }}>
                    <h3 className="serif" style={{ fontSize: '28px' }}>{p.title}</h3>
                    <p style={{ fontSize: '12px', opacity: 0.4 }}>{p.location}</p>
                    <h4 className="serif" style={{ color: '#c29a5b', marginTop: '15px', fontSize: '20px' }}>{p.price}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'detail' && activeProperty && (
          <div className="property-detail">
            <section className="hero" style={{ height: '100vh', justifyContent: 'flex-start', paddingTop: '20vh' }}>
              <div className="hero-bg" style={{ backgroundImage: `url('${activeProperty.img}')`, backgroundSize: 'cover' }}></div>
              <div className="hero-overlay" style={{ background: 'linear-gradient(to bottom, #0d0d0d66, #0d0d0d)' }}></div>
              <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <span style={{ border: '1px solid #c29a5b', color: '#c29a5b', fontSize: '10px', padding: '6px 18px' }}>COLLECTION 2024</span>
                <h1 style={{ fontSize: 'clamp(50px, 10vw, 100px)', marginTop: '20px' }}>{activeProperty.title}</h1>
                <p style={{ maxWidth: '500px', opacity: 0.6, fontSize: '16px', marginTop: '20px' }}>Located at {activeProperty.location}. Designed for the ultimate luxury Monograph.</p>
                <div style={{ display: 'flex', gap: '20px', marginTop: '50px' }}>
                   <Magnetic><button className="btn-primary" onClick={() => setInquiryOpen(true)} style={{ background: '#c29a5b' }}>BOOK VIEWING</button></Magnetic>
                   <button onClick={() => changeView('listing')} style={{ color: '#fff', fontSize: '12px', borderBottom: '1px solid #fff' }}>BACK TO PORTFOLIO</button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <footer style={{ padding: '100px 0', background: '#000', borderTop: '1px solid #111' }}>
         <div className="container" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10vw', fontFamily: 'var(--font-serif)', opacity: 0.1, marginBottom: '50px' }}>Nestly</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontSize: '10px', opacity: 0.4 }}>
               <a href="#" onClick={() => changeView('home')}>HOME</a>
               <a href="#" onClick={() => changeView('listing')}>COLLECTIONS</a>
               <a href="#" onClick={() => setInquiryOpen(true)}>CONCIERGE</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
