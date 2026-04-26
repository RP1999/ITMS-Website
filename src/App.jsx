import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import logoUrl from './assets/itms-logo1.png';
import logoIcon from './assets/logo-icon.png';
import imgGunarathna from './assets/team/gunarathna.png';
import imgRandima from './assets/team/randima.png';
import imgTennakoon from './assets/team/tennakoon.jpg';
import imgPalihakkara from './assets/team/palihakkara.png';
import imgSamantha from './assets/team/samantha.png';
import imgAdya from './assets/team/adya.jpg';
import {
  ShieldAlert, Car, Map, User, Users, Download, FileText, MonitorPlay, Video,
  Mail, ArrowRight, Activity, Zap, Rocket, Code, Database,
  Smartphone, Cloud, Lock, MousePointer2, Link, AtSign, Eye
} from 'lucide-react';

const Linkedin = ({ size = 24, ...props }) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const Spline = lazy(() => import('@splinetool/react-spline'));

// --- Global Particle Background ---

const PARTICLE_DENSITY = 0.00015;
const BG_PARTICLE_DENSITY = 0.00005;
const MOUSE_RADIUS = 180;
const RETURN_SPEED = 0.08;
const DAMPING = 0.90;
const REPULSION_STRENGTH = 1.2;

const randomRange = (min, max) => Math.random() * (max - min) + min;

const AntiGravityCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState({ count: 0, fps: 0 });

  const particlesRef = useRef([]);
  const backgroundParticlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, isActive: false });
  const frameIdRef = useRef(0);
  const lastTimeRef = useRef(0);

  const initParticles = useCallback((width, height) => {
    const particleCount = Math.floor(width * height * PARTICLE_DENSITY);
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      newParticles.push({
        x: x, y: y, originX: x, originY: y, vx: 0, vy: 0,
        size: randomRange(1, 2.5),
        color: Math.random() > 0.9 ? 'var(--primary-color)' : '#ffffff',
        angle: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = newParticles;

    const bgCount = Math.floor(width * height * BG_PARTICLE_DENSITY);
    const newBgParticles = [];
    for (let i = 0; i < bgCount; i++) {
      newBgParticles.push({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        size: randomRange(0.5, 1.5), alpha: randomRange(0.1, 0.4),
        phase: Math.random() * Math.PI * 2
      });
    }
    backgroundParticlesRef.current = newBgParticles;
    setDebugInfo(prev => ({ ...prev, count: particleCount + bgCount }));
  }, []);

  const animate = useCallback((time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;
    if (delta > 0) {
      setDebugInfo(prev => ({ ...prev, fps: Math.round(1000 / delta) }));
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pulseSpeed = 0.0008;
    const pulseOpacity = Math.sin(time * pulseSpeed) * 0.035 + 0.085;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(canvas.width, canvas.height) * 0.7
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${pulseOpacity})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgParticles = backgroundParticlesRef.current;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < bgParticles.length; i++) {
      const p = bgParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
      const currentAlpha = p.alpha * (0.3 + 0.7 * twinkle);
      ctx.globalAlpha = currentAlpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (mouse.isActive && distance < MOUSE_RADIUS) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
        const repulsion = force * REPULSION_STRENGTH;
        p.vx -= forceDirectionX * repulsion * 5;
        p.vy -= forceDirectionY * repulsion * 5;
      }
      p.vx += (p.originX - p.x) * RETURN_SPEED;
      p.vy += (p.originY - p.y) * RETURN_SPEED;
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSq = dx * dx + dy * dy;
        const minDist = p1.size + p2.size;

        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.01) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            const pushX = nx * overlap * 0.5;
            const pushY = ny * overlap * 0.5;
            p1.x -= pushX; p1.y -= pushY;
            p2.x += pushX; p2.y += pushY;
            const dvx = p1.vx - p2.vx;
            const dvy = p1.vy - p2.vy;
            const velocityAlongNormal = dvx * nx + dvy * ny;
            if (velocityAlongNormal > 0) {
              const restitution = 0.85;
              const impulseMagnitude = (-(1 + restitution) * velocityAlongNormal) / (1 / p1.size + 1 / p2.size);
              const impulseX = impulseMagnitude * nx;
              const impulseY = impulseMagnitude * ny;
              p1.vx += impulseX / p1.size;
              p1.vy += impulseY / p1.size;
              p2.vx -= impulseX / p2.size;
              p2.vy -= impulseY / p2.size;
            }
          }
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x += p.vx;
      p.y += p.vy;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const opacity = Math.min(0.3 + velocity * 0.1, 1);
      ctx.fillStyle = p.color === '#ffffff' ? `rgba(255, 255, 255, ${opacity})` : p.color;
      ctx.fill();
    }

    frameIdRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        initParticles(width, height);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [initParticles]);

  useEffect(() => {
    frameIdRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [animate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, isActive: true };
    };
    const handleMouseLeave = () => { mouseRef.current.isActive = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -2, background: '#050505', overflow: 'hidden' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};

// --- Shared Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeUpHeroVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

// --- Components ---
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="navbar" style={{ padding: scrolled ? '0' : '10px 0', background: scrolled ? 'rgba(5, 5, 5, 0.9)' : 'transparent', boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.5)' : 'none' }}>
      <div className="container nav-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={logoIcon} alt="ITMS Icon" style={{ height: '45px', objectFit: 'contain' }} />
          <img src={logoUrl} alt="ITMS Logo" style={{ height: '100px', objectFit: 'contain', mixBlendMode: 'lighten' }} />
        </div>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#domain">Domain</a></li>
          <li><a href="#milestones">Milestones</a></li>
          <li><a href="#documents">Documents</a></li>
          <li><a href="#presentations">Presentations</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>
    </nav>
  );
};

const SectionHeading = ({ children, subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      style={{ fontSize: '3rem', marginBottom: '0.5rem' }}
      className="text-gradient"
    >
      {children}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const HeroSection = () => (
  <section id="home" className="hero-wrapper" style={{ backgroundColor: 'transparent' }}>

    <div className="top-glow"></div>
    <div className="grid-lines">
      <div className="grid-line left"></div>
      <div className="grid-line right"></div>
      <div className="grid-line left-inner"></div>
      <div className="grid-line right-inner"></div>
    </div>

    <div className="container" style={{ zIndex: 10, paddingTop: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>

      {/* Left content */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: '1.5rem', flex: '1 1 500px' }}>

        <motion.a href="#domain" variants={fadeUpHeroVariant} className="pill-badge" style={{ textDecoration: 'none' }}>
          <Rocket size={14} color="var(--primary-color)" />
          <span>v2.0 Model Deployed</span>
          <div className="divider"></div>
          <ArrowRight size={14} />
        </motion.a>

        <motion.h1 variants={fadeUpHeroVariant} className="hero-title" style={{ textAlign: 'left' }}>
          Intelligent <br />
          <span className="text-gradient">Traffic Management</span> System
        </motion.h1>

        <motion.p variants={fadeUpHeroVariant} className="hero-subtitle" style={{ margin: '0', textAlign: 'left', maxWidth: '100%' }}>
          Connecting AI-driven anomaly detection with real-time adaptive signaling to innovate, scale, and lead road safety.
        </motion.p>

        <motion.div variants={fadeUpHeroVariant} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <a href="#documents" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Get Started <ArrowRight size={18} /></button>
          </a>
          <a href="#about" style={{ textDecoration: 'none' }}>
            <button className="btn-outline"><Users size={18} /> Our Team</button>
          </a>
        </motion.div>
      </motion.div>

      {/* Right content: 3D Robot Spline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        style={{ flex: '1 1 400px', height: '550px', position: 'relative' }}
      >
        <div style={{ width: '100%', height: '100%', transform: 'scale(1.25)', transformOrigin: 'center center' }}>
          <Suspense fallback={<div className="glass-card" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'var(--text-secondary)' }}>Loading 3D Engine...</span></div>}>
            <Spline scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" style={{ width: '100%', height: '100%' }} />
          </Suspense>
        </div>
      </motion.div>
    </div>

    {/* Mouse Interaction Hint (Moved to absolute bottom middle of screen) */}
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
      style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', zIndex: 20 }}
    >
      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Interact</span>
      <MousePointer2 size={16} />
    </motion.div>
  </section>
);

const LogosSection = () => {
  const logos = [
    { icon: <Code />, name: "FastAPI" },
    { icon: <Smartphone />, name: "Flutter" },
    { icon: <Activity />, name: "YOLOv8" },
    { icon: <Cloud />, name: "Firebase" },
    { icon: <Database />, name: "Firestore" },
    { icon: <Lock />, name: "DeepSORT" },
  ];

  return (
    <section className="logo-ticker-wrapper">
      <h2 style={{ textAlign: 'center', fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem', fontWeight: 500, letterSpacing: '1px' }}>
        POWERED BY <span style={{ color: '#fff' }}>MODERN TECHNOLOGIES</span>
      </h2>
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <div className="logo-ticker">
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="icon-wrap">
              {logo.icon} <span>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Domain = () => (
  <section id="domain" className="section bg-domain">
    <div className="bg-overlay"></div>
    <div className="container">
      <SectionHeading subtitle="Understanding the foundation, problem, and the intelligent solution behind ITMS.">
        Project Domain
      </SectionHeading>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}
      >
        <motion.div variants={fadeUpVariant} className="glass-card glass-card-hover">
          <Activity size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Literature Survey</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Urban traffic congestion and road accidents are escalating globally. Traditional systems rely on fixed timers and manual enforcement, failing to adapt to real-time anomalies.
          </p>
        </motion.div>

        <motion.div variants={fadeUpVariant} className="glass-card glass-card-hover">
          <Map size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Research Gap</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Current systems lack an integrated approach. The disconnect between violation tracking, dynamic signals, and driver behavior prevents a unified law enforcement platform.
          </p>
        </motion.div>

        <motion.div variants={fadeUpVariant} className="glass-card glass-card-hover" style={{ gridColumn: '1 / -1', background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--primary-color)' }}>
          <Zap size={40} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Research Problem & Solution</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1rem' }}>
            <strong>Problem:</strong> How can we create an automated, AI-driven traffic ecosystem that penalizes bad driving while optimizing flow?
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            <strong>Solution:</strong> ITMS integrates YOLOv8 vision for real-time violation tracking (parking, lane weaving, redline), fuzzy logic for adaptive signals, and a LiveSafe scoring system.
          </p>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

const Milestones = () => {
  const milestones = [
    { title: "Proposal Presentation & Report", date: "DATE TBD", marks: "12%", status: "COMPLETED", desc: "Initial proposal presentation and report submission covering the project idea, scope, and planned approach." },
    { title: "Progress Presentation I", date: "MAY 1, 2025", marks: "15%", status: "COMPLETED", desc: "First progress review covering the initial implementation stage and overall project development status." },
    { title: "Progress Presentation II", date: "MARCH 9, 2026", marks: "18%", status: "COMPLETED", desc: "Second progress review focused on advanced implementation progress, refinements, and readiness for completion." },
    { title: "Final Presentation and VIVA", date: "DATE TBD", marks: "20%", status: "PLANNED", desc: "Final presentation and viva assessment demonstrating the completed solution and evaluating each member's understanding." },
    { title: "Final Report", date: "DATE TBD", marks: "19%", status: "PLANNED", desc: "Comprehensive final project report documenting the full research, implementation, evaluation, and outcomes." },
    { title: "Research Paper (published)", date: "DATE TBD", marks: "10%", status: "PLANNED", desc: "Published research paper presenting the project's contribution, findings, and academic value." },
    { title: "Website", date: "DATE TBD", marks: "2%", status: "PLANNED", desc: "Project website submission showcasing the research, implementation details, milestones, and downloadable resources." },
    { title: "Research Logbook, Status Document 1 & 2", date: "DATE TBD", marks: "4%", status: "PLANNED", desc: "Continuous assessment based on research logbook maintenance and the submission of status documents 1 and 2." }
  ];

  return (
    <section id="milestones" className="section" style={{ background: 'transparent' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <SectionHeading subtitle="A research timeline that highlights the assessment structure, project progression, and expected academic outputs.">Timeline in Brief</SectionHeading>

        <div style={{ position: 'relative', paddingLeft: '40px', marginTop: '2rem' }}>
          {/* Vertical Line */}
          <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', background: 'rgba(255, 255, 255, 0.1)' }}></div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {milestones.map((m, i) => (
              <motion.div key={i} variants={fadeUpVariant} style={{ position: 'relative' }}>
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute', left: '-36px', top: '32px', width: '16px', height: '16px',
                  borderRadius: '50%', background: '#050505',
                  border: m.status === 'COMPLETED' ? '3px solid #4CAF50' : '3px solid rgba(255, 255, 255, 0.3)',
                  zIndex: 2,
                  boxShadow: m.status === 'COMPLETED' ? '0 0 10px rgba(76, 175, 80, 0.3)' : 'none'
                }}></div>

                <div className="glass-card glass-card-hover" style={{ padding: '2rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {m.date}
                    </span>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px',
                      background: m.status === 'COMPLETED' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: m.status === 'COMPLETED' ? '#4CAF50' : 'var(--text-secondary)',
                      border: m.status === 'COMPLETED' ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255,255,255,0.1)'
                    }}>
                      {m.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{m.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                    {m.desc}
                  </p>

                  <span style={{
                    display: 'inline-block', padding: '6px 14px', background: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.5px', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    MARKS ALLOCATED: {m.marks}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Documents = () => {
  const docs = [
    { title: "Project Charter", status: "Available", file: "/ITMS-Website/docs/project_charter.pdf" },
    { title: "Proposal Document", status: "Available", file: "/ITMS-Website/docs/proposal.pdf" },
    { title: "Check List documents", status: "Coming Soon", file: "/ITMS-Website/docs/checklist.pdf" },
    { title: "Final Document (Main)", status: "Coming Soon", file: "/ITMS-Website/docs/final_main.pdf" },
    { title: "Final Document (IT22925572)", status: "Coming Soon", file: "/ITMS-Website/docs/final_annex1.pdf" },
    { title: "Final Document (IT22900890)", status: "Coming Soon", file: "/ITMS-Website/docs/final_annex2.pdf" },
    { title: "Final Document (IT22824338)", status: "Coming Soon", file: "/ITMS-Website/docs/final_annex3.pdf" },
    { title: "Final Document (IT22919374)", status: "Coming Soon", file: "/ITMS-Website/docs/final_annex4.pdf" }
  ];

  return (
    <section id="documents" className="section" style={{ background: 'transparent' }}>
      <div className="container">
        <SectionHeading subtitle="Download official project documentations and reports.">Documents</SectionHeading>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}
        >
          {docs.map((doc, i) => (
            <motion.div key={i} variants={fadeUpVariant} className="glass-card glass-card-hover" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '50%', marginBottom: '1.5rem' }}>
                <FileText size={40} color="var(--primary-color)" />
              </div>
              <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{doc.title}</h4>

              {doc.status === 'Available' ? (
                <a href={doc.file} target="_blank" rel="noopener noreferrer" style={{ width: '100%', textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}><Eye size={18} /> View Document</button>
                </a>
              ) : (
                <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }} disabled>Coming Soon</button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Presentations = () => {
  const slides = [
    { title: "Proposal Presentation", status: "Available", file: "/ITMS-Website/docs/proposal_presentation.pptx" },
    { title: "Progress Presentation 1 (PP1)", status: "Available", file: "/ITMS-Website/docs/pp1_presentation.pptx" },
    { title: "Progress Presentation 2", status: "Available", file: "/ITMS-Website/docs/pp2_presentation.pptx" },
    { title: "Final Presentation", status: "Pending", file: "#" }
  ];

  return (
    <section id="presentations" className="section" style={{ background: 'transparent' }}>
      <div className="container">
        <SectionHeading subtitle="View and download our presentation slides.">Presentations</SectionHeading>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}
        >
          {slides.map((slide, i) => (
            <motion.div key={i} variants={fadeUpVariant} className="glass-card glass-card-hover" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '50%', marginBottom: '1.5rem' }}>
                <MonitorPlay size={40} color="var(--primary-color)" />
              </div>
              <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>{slide.title}</h4>

              {slide.status === 'Available' ? (
                <a href={slide.file} download style={{ width: '100%' }}>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}><Download size={18} /> Download PPT</button>
                </a>
              ) : (
                <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }} disabled>Coming Soon</button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Supervisors = () => {
  const supervisors = [
    { name: "Prof. Samantha Rajapaksha", role: "Sri Lanka Institute of Information Technology", badge: "SUPERVISOR", image: imgSamantha, position: "center", linkedin: "https://www.linkedin.com/in/samantha-rajapaksha-528657b/", email: "samantha.r@sliit.lk" },
    { name: "Mrs. Kaushika Kahatapitiya", role: "Sri Lanka Institute of Information Technology", badge: "CO-SUPERVISOR", image: imgAdya, position: "center 10%", linkedin: "https://www.linkedin.com/in/kaushi/", email: "kaushika.k@sliit.lk" }
  ];

  return (
    <section className="section" style={{ background: 'transparent' }}>
      <div className="container">
        <SectionHeading subtitle="Academic Guidance">Supervisors</SectionHeading>
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}
          style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2.5rem' }}
        >
          {supervisors.map((member, i) => (
            <motion.div key={i} variants={fadeUpVariant} className="glass-card glass-card-hover" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '320px' }}>
              <div style={{ width: '140px', height: '140px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1.5rem', border: '3px solid rgba(255,255,255,0.1)', background: '#fff' }}>
                {member.image ? <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: member.position }} /> : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #222, #111)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={50} color="var(--primary-color)" /></div>}
              </div>

              <span style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--primary-color)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                {member.badge}
              </span>

              <h4 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{member.name}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '1.5rem', flexGrow: 1 }}>{member.role}</p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.a whileHover={{ y: -2, backgroundColor: 'var(--primary-color)', color: '#000' }} href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.3s' }}>
                  <Linkedin size={16} />
                </motion.a>
                <motion.a whileHover={{ y: -2, backgroundColor: 'var(--primary-color)', color: '#000' }} href={`mailto:${member.email}`} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.3s' }}>
                  <AtSign size={16} />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const AboutUs = () => {
  const members = [
    { name: "Gunarathna R.P", role: "Parking Behaviour & Traffic Impact Analysis", badge: "GROUP LEADER", image: imgGunarathna, position: "center top", linkedin: "https://www.linkedin.com/in/ranindu-pramod/", email: "it22925572@my.sliit.lk" },
    { name: "Randima K.M.G.D", role: "Smart Traffic Violation Detection", badge: "GROUP MEMBER", image: imgRandima, position: "center", linkedin: "https://www.linkedin.com/in/dilina-randima-3375bb230/", email: "it22900890@my.sliit.lk" },
    { name: "Tennakoon I.M.S.R", role: "Fuzzy Logic Controller", badge: "GROUP MEMBER", image: imgTennakoon, position: "center", linkedin: "https://www.linkedin.com/in/siluni-ransadi-a0a4a231b/", email: "it22363848@my.sliit.lk" },
    { name: "Palihakkara P.I", role: "Accident Risk Prediction & Dashboard", badge: "GROUP MEMBER", image: imgPalihakkara, position: "center", linkedin: "https://www.linkedin.com/in/piyumi-palihakkara-811004344/", email: "it22337580@my.sliit.lk" }
  ];

  return (
    <section id="about" className="section" style={{ background: 'transparent' }}>
      <div className="container" style={{ maxWidth: '1300px' }}>
        <SectionHeading subtitle="The research team behind the Intelligent Traffic Management System.">About Us</SectionHeading>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}
        >
          {members.map((member, i) => (
            <motion.div key={i} variants={fadeUpVariant} className="glass-card glass-card-hover" style={{ textAlign: 'center', padding: '2rem 1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '280px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1.5rem', border: '3px solid rgba(255,255,255,0.1)' }}>
                <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: member.position }} />
              </div>

              <span style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--primary-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                {member.badge}
              </span>

              <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{member.name}</h4>
              <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1.5rem', flexGrow: 1 }}>{member.role}</p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.a whileHover={{ y: -2, backgroundColor: 'var(--primary-color)', color: '#000' }} href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.3s' }}>
                  <Linkedin size={14} />
                </motion.a>
                <motion.a whileHover={{ y: -2, backgroundColor: 'var(--primary-color)', color: '#000' }} href={`mailto:${member.email}`} style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.3s' }}>
                  <AtSign size={14} />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoLink = `mailto:research-itms@example.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`;
    window.location.href = mailtoLink;
  };

  return (
    <section id="contact" className="section" style={{ background: 'transparent' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <SectionHeading subtitle="Reach out for inquiries or collaboration.">Contact Us</SectionHeading>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '3rem' }}>

          {/* Left Column: Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card"
            style={{ flex: '1 1 350px', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column' }}
          >
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold' }}>Contact Details</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              Use the details below to reach the research team directly. The form on this page will open your email app with your message prepared.
            </p>

            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Group Email</span>
              <span style={{ fontSize: '1.05rem', color: '#fff' }}>research-itms@example.com</span>
            </div>

            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>University</span>
              <span style={{ fontSize: '1.05rem', color: '#fff' }}>Sri Lanka Institute of Information Technology</span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>AVAILABILITY</span>
              <span style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 'bold', lineHeight: '1.4', display: 'block' }}>Academic project communication and research queries</span>
            </div>
          </motion.div>

          {/* Right Column: Send a Message */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card"
            style={{ flex: '2 1 500px', padding: '3rem 2.5rem' }}
          >
            <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Send a Message</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Fill out the form below to prepare an email to the team.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Message subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Message</label>
                <textarea
                  required
                  placeholder="Write your message here"
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s', resize: 'vertical' }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                ></textarea>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ padding: '14px 40px' }}>
                  Send Message
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const MagneticButton = React.forwardRef(({ className, children, as: Component = "button", style, ...props }, forwardedRef) => {
  const localRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const element = localRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      const handleMouseMove = (e) => {
        const rect = element.getBoundingClientRect();
        const h = rect.width / 2;
        const w = rect.height / 2;
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - w;

        gsap.to(element, {
          x: x * 0.4,
          y: y * 0.4,
          rotationX: -y * 0.15,
          rotationY: x * 0.15,
          scale: 1.05,
          ease: "power2.out",
          duration: 0.4,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          ease: "elastic.out(1, 0.3)",
          duration: 1.2,
        });
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, element);

    return () => ctx.revert();
  }, []);

  return (
    <Component
      ref={(node) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={className}
      style={{ cursor: "pointer", ...style }}
      {...props}
    >
      {children}
    </Component>
  );
});
MagneticButton.displayName = "MagneticButton";

const MarqueeItem = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', padding: '0 1.5rem', whiteSpace: 'nowrap' }}>
    <span>Safety First</span> <span style={{ color: 'rgba(255,255,255,0.6)' }}>✦</span>
    <span>Traffic Intelligence</span> <span style={{ color: 'rgba(255,255,255,0.4)' }}>✦</span>
    <span>Real-time Adaptivity</span> <span style={{ color: 'rgba(255,255,255,0.6)' }}>✦</span>
    <span>AI Detection</span> <span style={{ color: 'rgba(255,255,255,0.4)' }}>✦</span>
    <span>Secure Data</span> <span style={{ color: 'rgba(255,255,255,0.6)' }}>✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef(null);
  const giantTextRef = useRef(null);
  const headingRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', height: '100vh', width: '100%', clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)", zIndex: 0 }}
    >
      <footer className="cinematic-footer-wrapper" style={{ position: 'fixed', bottom: 0, left: 0, display: 'flex', height: '100vh', width: '100%', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', background: '#050505', color: '#fff' }}>

        <div className="footer-aurora animate-footer-breathe" style={{ position: 'absolute', left: '50%', top: '50%', height: '60vh', width: '80vw', transform: 'translate(-50%, -50%)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
        <div className="footer-bg-grid" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

        <div
          ref={giantTextRef}
          className="footer-giant-bg-text"
          style={{ position: 'absolute', bottom: '-5vh', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', zIndex: 0, pointerEvents: 'none', userSelect: 'none' }}
        >
          ITMS
        </div>

        <div style={{ position: 'absolute', top: '3rem', left: 0, width: '100%', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '1rem 0', zIndex: 10, transform: 'rotate(-2deg) scale(1.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div className="animate-footer-scroll-marquee" style={{ color: 'var(--secondary)' }}>
            <MarqueeItem />
            <MarqueeItem />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 1.5rem', marginTop: '5rem', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          <h2
            ref={headingRef}
            className="footer-text-glow"
            style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '3rem', textAlign: 'center' }}
          >
            Ready to deploy?
          </h2>

          <div ref={linksRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', width: '100%' }}>
              <MagneticButton as="a" href="#documents" className="footer-glass-pill" style={{ padding: '1.25rem 2.5rem', borderRadius: '9999px', fontWeight: 'bold', fontSize: '1rem', gap: '0.75rem' }}>
                <FileText size={24} /> Download Reports
              </MagneticButton>

              <MagneticButton as="a" href="#presentations" className="footer-glass-pill" style={{ padding: '1.25rem 2.5rem', borderRadius: '9999px', fontWeight: 'bold', fontSize: '1rem', gap: '0.75rem' }}>
                <Video size={24} /> View Presentations
              </MagneticButton>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
              <MagneticButton as="a" href="#" className="footer-glass-pill" style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: 500, fontSize: '0.85rem' }}>
                Research Policy
              </MagneticButton>
              <MagneticButton as="a" href="#" className="footer-glass-pill" style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: 500, fontSize: '0.85rem' }}>
                Methodology
              </MagneticButton>
              <MagneticButton as="a" href="#contact" className="footer-glass-pill" style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: 500, fontSize: '0.85rem' }}>
                Contact Team
              </MagneticButton>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 20, width: '100%', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>

          <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            © 2026 ITMS. All rights reserved.
          </div>

          <div className="footer-glass-pill" style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Crafted with</span>
            <span className="animate-footer-heartbeat" style={{ color: '#fff', fontSize: '1rem' }}>❤</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>by</span>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: '0.85rem' }}>Group 25-26J-330</span>
          </div>

          <MagneticButton
            as="button"
            onClick={scrollToTop}
            className="footer-glass-pill"
            style={{ width: '3rem', height: '3rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowRight size={20} style={{ transform: 'rotate(-90deg)' }} />
          </MagneticButton>

        </div>
      </footer>
    </div>
  );
}

const App = () => {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Global Interactive Background */}
      <AntiGravityCanvas />

      {/* MAIN CONTENT AREA */}
      <main style={{ position: 'relative', zIndex: 10, width: '100%', minHeight: '100vh', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)', borderBottomLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Navbar />
          <HeroSection />
          <LogosSection />
          <Domain />
          <Milestones />
          <Documents />
          <Presentations />
          <Supervisors />
          <AboutUs />
          <ContactUs />
        </div>
      </main>

      {/* The Cinematic Footer is injected here */}
      <CinematicFooter />

    </div>
  );
};

export default App;
