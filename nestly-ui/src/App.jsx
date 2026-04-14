import React, { useEffect, useRef, useState, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, MapPin, Menu, Shield, Thermometer, Volume2, Share2, Heart, Download, ArrowLeft, ArrowRight, ArrowUpRight, Instagram, Linkedin, Twitter, Search, Grid, List as ListIcon, ChevronDown, X, Star, ExternalLink } from 'lucide-react';
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
  const [activeProperty, setActiveProperty] = useState(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [inquiryData, setInquiryData] = useState({ name: '', email: '', message: '' });
  const mainRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/properties')
      .then(res => res.json())
      .then(data => setProperties(data))
      .catch(err => console.error("Error fetching properties:", err));
  }, []);

  useEffect(() => {
    if (activeProperty) {
      fetch(`http://localhost:8080/api/properties/${activeProperty.id}/reviews`)
        .then(res => res.json())
        .then(data => setReviews(data))
        .catch(err => console.error("Error fetching reviews:", err));
    }
  }, [activeProperty]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/properties/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      if (res.ok) { alert("Subscribed to Nestly Newsletter!"); setNewsletterEmail(''); }
    } catch (err) { console.error("Newsletter error:", err); }
  };

  const handleInquiryChange = (e) => {
    setInquiryData({ ...inquiryData, [e.target.name]: e.target.value });
  };

  const submitInquiry = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/properties/enquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inquiryData,
          property: activeProperty ? { id: activeProperty.id } : null
        })
      });
      if (response.ok) {
        alert("Inquiry submitted successfully!");
        setInquiryOpen(false);
        setInquiryData({ name: '', email: '', message: '' });
      }
    } catch (err) {
      console.error("Error submitting inquiry:", err);
    }
  };

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

  // Properties are now fetched from backend

  return (
    <div ref={mainRef} style={{ cursor: 'none', background: '#080808', minHeight: '100vh', color: '#fff' }}>
      <CustomCursor />
      
      {inquiryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ position: 'relative', width: '500px', padding: '60px', background: '#0a0a0a', border: '1px solid #222' }}>
              <button onClick={() => setInquiryOpen(false)} style={{ position: 'absolute', top: '30px', right: '30px', color: '#fff' }}><X size={24} /></button>
              <h2 className="serif" style={{ fontSize: '32px', marginBottom: '30px' }}>Inquiry</h2>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <input name="name" type="text" placeholder="FULL NAME" value={inquiryData.name} onChange={handleInquiryChange} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #333', padding: '15px 0', color: '#fff', fontSize: '10px' }} />
                <input name="email" type="email" placeholder="EMAIL ADDRESS" value={inquiryData.email} onChange={handleInquiryChange} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #333', padding: '15px 0', color: '#fff', fontSize: '10px' }} />
                <textarea name="message" placeholder="MESSAGE (OPTIONAL)" value={inquiryData.message} onChange={handleInquiryChange} style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #333', padding: '15px 0', color: '#fff', fontSize: '10px', minHeight: '80px' }} />
                <button className="btn-primary" style={{ background: '#c29a5b', padding: '18px' }} type="button" onClick={submitInquiry}>SUBMIT INQUIRY</button>
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
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
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
              <div className="hero-bg" style={{ backgroundImage: `url('${activeProperty.image}')`, backgroundSize: 'cover' }}></div>
              <div className="hero-overlay" style={{ background: 'linear-gradient(to bottom, #0d0d0d66, #0d0d0d)' }}></div>
              <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <span style={{ border: '1px solid #c29a5b', color: '#c29a5b', fontSize: '10px', padding: '6px 18px' }}>COLLECTION 2024</span>
                <h1 style={{ fontSize: 'clamp(50px, 10vw, 100px)', marginTop: '20px' }}>{activeProperty.title}</h1>
                <p style={{ maxWidth: '500px', opacity: 0.6, fontSize: '16px', marginTop: '20px' }}>Located at {activeProperty.location}. Designed for the ultimate luxury Monograph.</p>
                <div style={{ display: 'flex', gap: '20px', marginTop: '50px' }}>
                   <Magnetic><button className="btn-primary" onClick={() => setInquiryOpen(true)} style={{ background: '#c29a5b' }}>BOOK VIEWING</button></Magnetic>
                   {activeProperty.virtualTourUrl && (
                     <Magnetic><button className="btn-primary" onClick={() => window.open(activeProperty.virtualTourUrl, '_blank')} style={{ background: 'transparent', border: '1px solid #c29a5b', color: '#c29a5b' }}>VIRTUAL TOUR <ExternalLink size={14} style={{ marginLeft: '10px' }} /></button></Magnetic>
                   )}
                </div>

                <section className="reviews-section">
                   <h2 className="serif" style={{ fontSize: '32px', marginBottom: '40px' }}>Resident Feedback</h2>
                   {reviews.length > 0 ? (
                     reviews.map(r => (
                       <div key={r.id} className="review-card">
                          <div className="rating-stars">
                             {[...Array(r.rating)].map((_, i) => <Star key={i} size={16} fill="#c29a5b" />)}
                          </div>
                          <p className="review-author">{r.author}</p>
                          <p className="review-date">{new Date(r.createdAt).toLocaleDateString()}</p>
                          <p className="review-text">"{r.comment}"</p>
                       </div>
                     ))
                   ) : (
                     <p style={{ opacity: 0.4, fontStyle: 'italic' }}>No reviews yet for this primary estate.</p>
                   )}
                </section>
              </div>
            </section>
          </div>
        )}
      </main>

      <section className="newsletter-section">
         <div className="container">
            <h2 className="serif" style={{ fontSize: '42px' }}>Curated Insights</h2>
            <p style={{ opacity: 0.5, marginTop: '10px', fontSize: '14px' }}>Join our exclusive list for off-market previews and architectural trends.</p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
               <input type="email" placeholder="EMAIL ADDRESS" className="newsletter-input" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} required />
               <button type="submit" className="btn-primary" style={{ padding: '15px 35px' }}>SUBSCRIBE</button>
            </form>
         </div>
      </section>
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
