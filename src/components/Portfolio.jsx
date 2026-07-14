import React, { useState, useEffect } from 'react';
import { getPortfolioData, savePortfolioData, addLead } from '../data/db';

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null); // Image URL or null
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [contactSuccess, setContactSuccess] = useState(false);
  
  // Track mouse coordinates directly
  useEffect(() => {
    getPortfolioData().then(dbData => {
      setData(dbData);
    });

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHeaderScrolled(true);
      } else {
        setHeaderScrolled(false);
      }
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setRingPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!data) return <div className="text-center py-5">Loading portfolio...</div>;

  const categories = ['All', ...new Set(data.gallery.map(item => item.category))];
  const filteredGallery = filter === 'All' 
    ? data.gallery 
    : data.gallery.filter(item => item.category === filter);

  return (
    <div className="client-portfolio-body">
      {/* Custom Cursor */}
      <div className="cursor d-none d-md-block" style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}></div>
      <div className="cursor-ring d-none d-md-block" style={{ left: `${ringPos.x}px`, top: `${ringPos.y}px` }}></div>

      {/* Header */}
      <header className={`client-portfolio-header ${headerScrolled ? 'scrolled' : ''}`}>
        <a href="#hero" className="logo">
          {data.hero.name} <span>{data.hero.nameAccent}</span>
        </a>
        <nav className="d-none d-md-flex align-items-center">
          <a href="#hero">Home</a>
          <a href="#gallery">Gallery</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#testimonials">Reviews</a>
          <a href="/admin" className="btn btn-link text-warning text-uppercase text-decoration-none small" style={{ fontSize: '0.72rem', letterSpacing: '0.15em' }}>
            <i className="bi bi-lock-fill me-1"></i>Admin
          </a>
          <a href="#contact" className="nav-cta">Get In Touch</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid">
          {data.gallery.slice(0, 4).map((item, idx) => (
            <div key={item.id || idx} className="hero-grid-item">
              <img src={item.url} alt={item.title} />
            </div>
          ))}
          {data.gallery.slice(4, 8).map((item, idx) => (
            <div key={item.id || idx} className="hero-grid-item">
              <img src={item.url} alt={item.title} />
            </div>
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">{data.hero.eyebrow}</div>
          <h1 className="hero-name">
            {data.hero.name} <br />
            <em>{data.hero.nameAccent}</em>
          </h1>
          <p className="hero-tagline">{data.hero.tagline}</p>
          <div className="hero-actions">
            <a href="#gallery" className="btn-primary-gold">{data.hero.ctaText}</a>
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
        {data.stats.map((stat, idx) => (
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
          <div className="gallery-filters d-flex gap-3 flex-wrap">
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

        <div className="gallery-masonry">
          {filteredGallery.map((item, idx) => (
            <div key={item.id || idx} className={`g-item g-item-${(idx % 8) + 1}`}>
              <img src={item.url} alt={item.title} />
              <div className="g-overlay">
                <div className="g-overlay-content">
                  <button 
                    onClick={() => setLightbox(item.url)}
                    className="g-expand btn border border-secondary rounded-0 text-white"
                  >
                    <i className="bi bi-arrows-fullscreen"></i>
                  </button>
                  <div>
                    <div className="g-label">{item.title}</div>
                    <small className="text-muted text-uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.1em' }}>{item.category}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about">
        <div className="about-image-wrap">
          <img src={data.about.profilePhoto || data.gallery[0]?.url || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800'} alt={data.hero.name} />
        </div>
        <div className="about-content">
          <div className="section-tag">{data.about.eyebrow}</div>
          <h2 className="section-title">{data.about.title}</h2>
          <p className="about-bio">{data.about.bio1}</p>
          <p className="about-bio">{data.about.bio2}</p>
          
          <div className="about-details">
            {data.about.details.map((detail, idx) => (
              <div key={idx} className="detail-item">
                <div className="detail-label">{detail.label}</div>
                <div className="detail-value">{detail.value}</div>
              </div>
            ))}
          </div>

          <div className="skills-list">
            {data.about.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
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
          {data.services.map((service, idx) => (
            <div key={idx} className="service-card">
              <div className="service-num">{service.num}</div>
              <i className={`bi ${service.icon} service-icon`}></i>
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
          {data.testimonials.map((test, idx) => (
            <div key={test.id || idx} className="testimonial-card">
              <div className="stars">
                {Array.from({ length: test.rating }).map((_, i) => (
                  <i key={i} className="bi bi-star-fill"></i>
                ))}
              </div>
              <span className="quote-mark">“</span>
              <p className="testimonial-text">{test.text}</p>
              <div className="testimonial-author">
                <img src={test.img} alt={test.author} />
                <div>
                  <div className="author-name">{test.author}</div>
                  <div className="author-role">{test.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
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
                <div className="contact-detail-value">{data.contact.email}</div>
              </div>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon"><i className="bi bi-telephone"></i></div>
              <div>
                <div className="contact-detail-label">Call / WhatsApp</div>
                <div className="contact-detail-value">{data.contact.phone}</div>
              </div>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon"><i className="bi bi-geo-alt"></i></div>
              <div>
                <div className="contact-detail-label">Studio Address</div>
                <div className="contact-detail-value">{data.contact.address}</div>
              </div>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const newLead = {
            id: 'l' + Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            date: new Date().toISOString()
          };

          // Prevent Duplicate Records
          const isDuplicate = (data.leads || []).some(
            lead => lead.email.toLowerCase() === newLead.email.toLowerCase() && 
                    lead.message.trim().toLowerCase() === newLead.message.trim().toLowerCase()
          );

          if (isDuplicate) {
            alert("This message has already been submitted.");
            return;
          }

          // Save to Supabase DB
          addLead(newLead).then(() => {
            getPortfolioData().then(updated => {
              setData(updated);
            });
          });

          // Real Email Notification Dispatch using EmailJS Service API
          import('@emailjs/browser').then((emailjs) => {
            emailjs.send(
              'service_280fbj4', 
              'template_wnt6888', 
              {
                to_email: 'muthumarisham@gmail.com', // Match template recipient explicitly
                from_name: newLead.name,
                name: newLead.name, // Matches {{name}} in template
                from_email: newLead.email,
                email: newLead.email, // Matches {{email}} in template
                subject: newLead.subject,
                message: newLead.message
              },
              'eHSTK7sPGtsiF8p0B' 
            ).then(() => {
              console.log('Email sent successfully!');
            }).catch((err) => {
              console.warn('EmailJS not configured yet or keys missing. Details:', err);
            });
          });

          alert(`Form submitted! A notification email has been dispatched to ${data.contact.email}.`);
          setContactSuccess(true);
        }}>
          {contactSuccess ? (
            <div className="alert alert-success bg-transparent border-warning text-warning rounded-0 p-4">
              Thank you! Your message has been sent successfully. I will get back to you shortly.
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <input type="text" name="name" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" name="email" placeholder="Your Email" required />
                </div>
              </div>
              <div className="form-group">
                <input type="text" name="subject" placeholder="Subject" required />
              </div>
              <div className="form-group">
                <textarea name="message" placeholder="Tell me about your project or vision..." required></textarea>
              </div>
              <button type="submit" className="form-submit btn">Send Message</button>
            </>
          )}
        </form>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          {data.hero.name} <span>{data.hero.nameAccent}</span>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Muthukumaran. All rights reserved. Created with dynamic controls.
        </div>
        <div className="footer-socials">
          <a href={data.contact.instagram} target="_blank" rel="noopener noreferrer"><i className="bi bi-instagram"></i></a>
          <a href={data.contact.twitter} target="_blank" rel="noopener noreferrer"><i className="bi bi-twitter"></i></a>
          <a href={data.contact.facebook} target="_blank" rel="noopener noreferrer"><i className="bi bi-facebook-f"></i></a>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightbox && (
        <div 
          className="modal fade show d-block" 
          style={{ background: 'rgba(0,0,0,0.95)', zIndex: 1100 }}
          onClick={() => setLightbox(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content bg-transparent border-0 position-relative">
              <button 
                className="btn btn-close btn-close-white position-absolute top-0 end-0 m-4"
                style={{ zIndex: 1200 }}
                onClick={() => setLightbox(null)}
              ></button>
              <img src={lightbox} className="img-fluid mx-auto max-vh-100" alt="Expanded Visual" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
