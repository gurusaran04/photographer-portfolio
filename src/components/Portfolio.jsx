import React, { useState, useEffect } from 'react';
import { getPortfolioData, addLead, getLeads } from '../data/db';

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null); // active image object or null
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  
  // Contact Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Load and listen to live data updates
  useEffect(() => {
    let isMounted = true;

    const loadData = () => {
      getPortfolioData().then(dbData => {
        if (isMounted && dbData) {
          setData(dbData);
        }
      });
    };

    loadData();

    // Re-fetch or update state when Admin updates data in this window or another tab
    const handleDataUpdate = (e) => {
      if (e.detail) {
        setData(e.detail);
      } else {
        loadData();
      }
    };

    const handleStorageUpdate = (e) => {
      if (e.key === 'muthu_portfolio_db') {
        loadData();
      }
    };

    window.addEventListener('portfolio_data_updated', handleDataUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 40);
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setRingPos({ x: e.clientX, y: e.clientY });
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightbox(null);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('portfolio_data_updated', handleDataUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!data) {
    return (
      <div className="client-portfolio-body min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
        <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#c9a96e', letterSpacing: '0.1em' }}>
          Loading Muthukumaran's Visual Portfolio...
        </div>
      </div>
    );
  }

  const galleryList = Array.isArray(data.gallery) ? data.gallery : [];
  
  const cleanCategory = (cat) => {
    if (!cat) return 'General';
    const trimmed = String(cat).trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const categories = ['All', ...new Set(galleryList.map(item => cleanCategory(item.category)))];
  const filteredGallery = filter === 'All' 
    ? galleryList 
    : galleryList.filter(item => cleanCategory(item.category) === filter);

  // Open Lightbox at specific index
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightbox(filteredGallery[index]);
  };

  const prevLightbox = (e) => {
    e?.stopPropagation();
    if (filteredGallery.length === 0) return;
    const newIdx = (lightboxIndex - 1 + filteredGallery.length) % filteredGallery.length;
    setLightboxIndex(newIdx);
    setLightbox(filteredGallery[newIdx]);
  };

  const nextLightbox = (e) => {
    e?.stopPropagation();
    if (filteredGallery.length === 0) return;
    const newIdx = (lightboxIndex + 1) % filteredGallery.length;
    setLightboxIndex(newIdx);
    setLightbox(filteredGallery[newIdx]);
  };

  // Determine images for hero grid (first 8 photos, or repeats if fewer)
  const heroGridPhotos = galleryList.length > 0 
    ? [...galleryList, ...galleryList, ...galleryList].slice(0, 8) 
    : [];

  // Form Submit Handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setContactError('');

    const newLead = {
      id: 'l_' + Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      date: new Date().toISOString()
    };

    if (!newLead.name || !newLead.email || !newLead.message) {
      setContactError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Check duplicate submissions against recorded leads
      const existingLeads = await getLeads();
      const isDuplicate = existingLeads.some(
        lead => lead.email?.toLowerCase() === newLead.email.toLowerCase() &&
                lead.message?.trim().toLowerCase() === newLead.message.toLowerCase()
      );

      if (isDuplicate) {
        setContactError('You have already submitted this inquiry. I will get back to you shortly.');
        setIsSubmitting(false);
        return;
      }

      // 2. Persist to Leads Database (LocalStorage + Supabase)
      await addLead(newLead);

      // 3. Dispatch EmailJS notification asynchronously
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (serviceId && templateId && publicKey) {
          const emailjs = await import('@emailjs/browser');
          await emailjs.send(
            serviceId,
            templateId,
            {
              to_email: data.contact?.email || 'muthumarisham@gmail.com',
              from_name: newLead.name,
              name: newLead.name,
              from_email: newLead.email,
              email: newLead.email,
              subject: newLead.subject || 'Portfolio Inquiry',
              message: newLead.message
            },
            publicKey
          );
        }
      } catch (emailErr) {
        console.warn('EmailJS service notice (lead safely stored in database):', emailErr);
      }

      // Success
      setContactSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form submission error:', err);
      setContactError('An unexpected error occurred while saving your inquiry. Please try again or reach out directly via email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="client-portfolio-body">
      {/* Custom Desktop Cursor */}
      <div className="cursor d-none d-md-block" style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}></div>
      <div className="cursor-ring d-none d-md-block" style={{ left: `${ringPos.x}px`, top: `${ringPos.y}px` }}></div>

      {/* Header */}
      <header className={`client-portfolio-header ${headerScrolled ? 'scrolled' : ''}`}>
        <a href="#hero" className="logo">
          {data.hero?.name || 'Muthukumaran'} <span>{data.hero?.nameAccent || 'Photographer'}</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="d-none d-md-flex align-items-center">
          <a href="#hero">Home</a>
          <a href="#gallery">Gallery</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#testimonials">Reviews</a>
          <a href="/admin" className="btn btn-link text-warning text-uppercase text-decoration-none small" style={{ fontSize: '0.72rem', letterSpacing: '0.15em' }}>
            <i className="bi bi-shield-lock-fill me-1"></i>Admin
          </a>
          <a href="#contact" className="nav-cta">Get In Touch</a>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <div className="d-flex align-items-center gap-2 d-md-none">
          <a href="/admin" className="text-warning text-decoration-none px-2 py-1 small" title="Admin Access">
            <i className="bi bi-shield-lock-fill"></i>
          </a>
          <button 
            className="btn btn-outline-warning btn-sm border-0 fs-3 p-1 text-warning"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          className="d-md-none position-fixed top-0 start-0 w-100 vh-100 bg-black bg-opacity-95 p-5 d-flex flex-column justify-content-center align-items-center"
          style={{ zIndex: 1050, backdropFilter: 'blur(10px)' }}
        >
          <button 
            className="btn btn-close btn-close-white position-absolute top-0 end-0 m-4 fs-5"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          ></button>
          
          <div className="text-center mb-4">
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: '#f5f0eb' }}>
              {data.hero?.name} <span style={{ color: '#c9a96e' }}>{data.hero?.nameAccent}</span>
            </span>
          </div>

          <nav className="d-flex flex-column align-items-center gap-4 text-uppercase" style={{ letterSpacing: '0.2em', fontSize: '1rem' }}>
            <a href="#hero" className="text-white text-decoration-none" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#gallery" className="text-white text-decoration-none" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
            <a href="#about" className="text-white text-decoration-none" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#services" className="text-white text-decoration-none" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#testimonials" className="text-white text-decoration-none" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
            <a href="/admin" className="text-warning text-decoration-none" onClick={() => setMobileMenuOpen(false)}>
              <i className="bi bi-shield-lock-fill me-2"></i>Admin Dashboard
            </a>
            <a href="#contact" className="btn btn-warning rounded-0 px-4 py-2 mt-2 text-dark font-weight-bold" onClick={() => setMobileMenuOpen(false)}>
              Get In Touch
            </a>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid">
          {heroGridPhotos.slice(0, 4).map((item, idx) => (
            <div key={`h1_${item.id || idx}`} className="hero-grid-item">
              <img src={item.url} alt={item.title || 'Portfolio Visual'} />
            </div>
          ))}
          {heroGridPhotos.slice(4, 8).map((item, idx) => (
            <div key={`h2_${item.id || idx}`} className="hero-grid-item">
              <img src={item.url} alt={item.title || 'Portfolio Visual'} />
            </div>
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">{data.hero?.eyebrow}</div>
          <h1 className="hero-name">
            {data.hero?.name} <br />
            <em>{data.hero?.nameAccent}</em>
          </h1>
          <p className="hero-tagline">{data.hero?.tagline}</p>
          <div className="hero-actions">
            <a href="#gallery" className="btn-primary-gold">{data.hero?.ctaText || 'View Portfolio'}</a>
            <a href="#contact" className="btn-ghost">
              <span>Let's Collaborate</span>
              <i className="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
        <div className="hero-scroll">
          <span>Scroll Down</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="stats-bar">
        {Array.isArray(data.stats) && data.stats.map((stat, idx) => (
          <div key={idx} className="stat-item">
            <span className="stat-number">{stat.number}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Gallery Section */}
      <section id="gallery">
        <div className="section-header">
          <div>
            <div className="section-tag">Gallery</div>
            <h2 className="section-title">Selected <em>Visuals</em></h2>
          </div>
          <div className="gallery-filters d-flex gap-2 gap-md-3 flex-wrap">
            {categories.map((cat) => (
              <button 
                key={cat} 
                className={`btn btn-link text-uppercase text-decoration-none py-1 px-3 ${filter === cat ? 'text-white border-bottom border-warning' : 'text-secondary'}`}
                style={{ fontSize: '0.72rem', letterSpacing: '0.15em' }}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredGallery.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>No photos found in this category.</p>
          </div>
        ) : (
          <div className="gallery-masonry">
            {filteredGallery.map((item, idx) => (
              <div key={item.id || idx} className={`g-item g-item-${(idx % 8) + 1}`}>
                <img src={item.url} alt={item.title} loading="lazy" />
                <div className="g-overlay">
                  <div className="g-overlay-content">
                    <button 
                      onClick={() => openLightbox(idx)}
                      className="g-expand btn border border-secondary rounded-0 text-white"
                      title="Expand View"
                    >
                      <i className="bi bi-arrows-fullscreen"></i>
                    </button>
                    <div>
                      <div className="g-label">{item.title}</div>
                      <small className="text-muted text-uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.1em' }}>
                        {item.category}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about">
        <div className="about-image-wrap">
          <img 
            src={data.about?.profilePhoto || galleryList[0]?.url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800'} 
            alt={data.hero?.name || 'Photographer'} 
          />
        </div>
        <div className="about-content">
          <div className="section-tag">{data.about?.eyebrow}</div>
          <h2 className="section-title">{data.about?.title}</h2>
          <p className="about-bio">{data.about?.bio1}</p>
          <p className="about-bio">{data.about?.bio2}</p>
          
          <div className="about-details">
            {Array.isArray(data.about?.details) && data.about.details.map((detail, idx) => (
              <div key={idx} className="detail-item">
                <div className="detail-label">{detail.label}</div>
                <div className="detail-value">{detail.value}</div>
              </div>
            ))}
          </div>

          {Array.isArray(data.about?.skills) && data.about.skills.length > 0 && (
            <div className="skills-list mt-4">
              {data.about.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>
          )}

          {/* Visit My Social Media Page - Instagram Redirect Link */}
          <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
            <div className="d-flex align-items-center gap-3">
              <span className="text-uppercase small text-white" style={{ letterSpacing: '0.15em', fontSize: '0.75rem', fontWeight: '500' }}>
                Visit My Social Media Page
              </span>
              <a 
                href={data.contact?.instagram || 'https://instagram.com/muthu.visuals'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="d-inline-flex align-items-center justify-content-center text-decoration-none"
                style={{
                  width: '38px',
                  height: '38px',
                  border: '1px solid rgba(201,169,110,0.5)',
                  color: '#c9a96e',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'rgba(201, 169, 110, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#c9a96e';
                  e.currentTarget.style.backgroundColor = '#c9a96e';
                  e.currentTarget.style.color = '#121212';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(201,169,110,0.5)';
                  e.currentTarget.style.backgroundColor = 'rgba(201, 169, 110, 0.08)';
                  e.currentTarget.style.color = '#c9a96e';
                }}
                title="Visit Instagram Page"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services">
        <div className="section-header justify-content-center text-center py-5">
          <div>
            <div className="section-tag justify-content-center">Services</div>
            <h2 className="section-title">What I <em>Offer</em></h2>
          </div>
        </div>
        <div className="services-grid">
          {Array.isArray(data.services) && data.services.map((service, idx) => (
            <div key={idx} className="service-card">
              <div className="service-num">{service.num || `0${idx + 1}`}</div>
              <i className={`bi ${service.icon || 'bi-camera'} service-icon`}></i>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.desc}</p>
              <div className="service-price">{service.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials">
        <div className="section-header">
          <div>
            <div className="section-tag">Testimonials</div>
            <h2 className="section-title">Client <em>Endorsements</em></h2>
          </div>
        </div>
        <div className="testimonials-grid">
          {Array.isArray(data.testimonials) && data.testimonials.map((test, idx) => (
            <div key={test.id || idx} className="testimonial-card">
              <div className="stars">
                {Array.from({ length: test.rating || 5 }).map((_, i) => (
                  <i key={i} className="bi bi-star-fill"></i>
                ))}
              </div>
              <span className="quote-mark">“</span>
              <p className="testimonial-text">{test.text}</p>
              <div className="testimonial-author">
                <img 
                  src={test.img || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'} 
                  alt={test.author} 
                />
                <div>
                  <div className="author-name">{test.author}</div>
                  <div className="author-role">{test.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section — Matches design from user screenshot */}
      <section id="contact">
        <div className="contact-info">
          <div className="section-tag">Contact</div>
          <h2 className="section-title">Let's Create <em>Together</em></h2>
          <p className="contact-tagline">
            Have a project in mind, want to inquire about wedding bookings, or buy fine-art prints? Feel free to reach out using the form or direct channels.
          </p>
          <div className="contact-details">
            <div className="contact-detail">
              <div className="contact-detail-icon"><i className="bi bi-envelope"></i></div>
              <div>
                <div className="contact-detail-label">Email Me</div>
                <div className="contact-detail-value">{data.contact?.email || 'muthu@visualstoryteller.com'}</div>
              </div>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon"><i className="bi bi-telephone"></i></div>
              <div>
                <div className="contact-detail-label">Call / WhatsApp</div>
                <div className="contact-detail-value">{data.contact?.phone || '+91 98765 43210'}</div>
              </div>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon"><i className="bi bi-geo-alt"></i></div>
              <div>
                <div className="contact-detail-label">Studio Address</div>
                <div className="contact-detail-value">{data.contact?.address || 'Studio 45, Golden Beach Road, ECR, Chennai, India'}</div>
              </div>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleContactSubmit}>
          {contactError && (
            <div className="alert alert-danger bg-danger-subtle border-0 text-danger rounded-0 p-3 mb-3 small">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {contactError}
            </div>
          )}

          {contactSuccess ? (
            <div className="p-4 border border-warning text-center" style={{ backgroundColor: 'rgba(201, 169, 110, 0.08)' }}>
              <i className="bi bi-check-circle-fill text-warning fs-1 mb-3 d-block"></i>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#c9a96e' }} className="mb-2">
                Inquiry Received!
              </h4>
              <p className="text-white-50 small mb-4" style={{ lineHeight: '1.7' }}>
                Thank you for reaching out. Your message has been logged in the studio inquiry ledger, and an instant notification has been dispatched to <strong>{data.contact?.email}</strong>. I will get back to you shortly.
              </p>
              <button 
                type="button" 
                className="btn btn-outline-warning rounded-0 px-4 py-2 small text-uppercase"
                style={{ letterSpacing: '0.15em', fontSize: '0.72rem' }}
                onClick={() => setContactSuccess(false)}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Your Name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Your Email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  name="subject" 
                  placeholder="Subject" 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <textarea 
                  name="message" 
                  placeholder="Tell me about your project or vision..." 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="form-submit btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending Message...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </>
          )}
        </form>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          {data.hero?.name} <span>{data.hero?.nameAccent}</span>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} {data.hero?.name || 'Muthukumaran'}. All rights reserved.
        </div>
      </footer>

      {/* Lightbox Modal with Next / Prev */}
      {lightbox && (
        <div 
          className="modal fade show d-block" 
          style={{ background: 'rgba(0,0,0,0.96)', zIndex: 1200 }}
          onClick={() => setLightbox(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl position-relative">
            <div className="modal-content bg-transparent border-0 position-relative p-2" onClick={(e) => e.stopPropagation()}>
              <button 
                className="btn btn-close btn-close-white position-absolute top-0 end-0 m-3"
                style={{ zIndex: 1300 }}
                onClick={() => setLightbox(null)}
                aria-label="Close Lightbox"
              ></button>

              <div className="text-center position-relative">
                <img 
                  src={lightbox.url} 
                  className="img-fluid mx-auto" 
                  alt={lightbox.title || 'Expanded Visual'} 
                  style={{ maxHeight: '82vh', objectFit: 'contain' }}
                />

                {filteredGallery.length > 1 && (
                  <>
                    <button 
                      className="btn position-absolute top-50 start-0 translate-middle-y text-white fs-2 px-3 border-0"
                      onClick={prevLightbox}
                      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1250 }}
                      aria-label="Previous image"
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <button 
                      className="btn position-absolute top-50 end-0 translate-middle-y text-white fs-2 px-3 border-0"
                      onClick={nextLightbox}
                      style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1250 }}
                      aria-label="Next image"
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>

              <div className="text-center mt-3 text-white">
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#c9a96e' }}>
                  {lightbox.title}
                </div>
                <small className="text-muted text-uppercase" style={{ letterSpacing: '0.15em', fontSize: '0.65rem' }}>
                  {lightbox.category} &bull; Image {lightboxIndex + 1} of {filteredGallery.length}
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
