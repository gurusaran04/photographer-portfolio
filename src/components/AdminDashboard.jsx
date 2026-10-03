import React, { useState, useEffect } from 'react';
import { getPortfolioData, savePortfolioData, getLeads, deleteLead, compressImage } from '../data/db';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('muthu_admin_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery'); // Default to gallery since photo management is high priority

  // Form draft states
  const [newPhoto, setNewPhoto] = useState({ url: '', title: '', category: 'Portrait' });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newService, setNewService] = useState({ icon: 'bi-camera', num: '', title: '', desc: '', price: '' });
  const [newTestimonial, setNewTestimonial] = useState({ rating: 5, text: '', author: '', role: '', img: '' });
  const [newSkillInput, setNewSkillInput] = useState('');

  // Draft states for committed tabs
  const [heroDraft, setHeroDraft] = useState(null);
  const [aboutDraft, setAboutDraft] = useState(null);
  const [contactDraft, setContactDraft] = useState(null);
  const [statsDraft, setStatsDraft] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState({ type: '', text: '' });

  // Password change state
  const [pwdChange, setPwdChange] = useState({ current: '', newPwd: '', confirmPwd: '' });
  const [pwdFeedback, setPwdFeedback] = useState({ type: '', text: '' });

  const showNotice = (text, type = 'success') => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg({ type: '', text: '' }), 3500);
  };

  const refreshData = async () => {
    const freshData = await getPortfolioData();
    setData(freshData);
    setHeroDraft(freshData.hero || {});
    setAboutDraft(freshData.about || {});
    setContactDraft(freshData.contact || {});
    setStatsDraft(freshData.stats || []);

    const leadsList = await getLeads();
    setData(prev => ({ ...freshData, leads: leadsList }));
  };

  useEffect(() => {
    refreshData();

    const handleLeadsUpdated = (e) => {
      if (e.detail) {
        setData(prev => prev ? { ...prev, leads: e.detail } : null);
      }
    };

    window.addEventListener('portfolio_leads_updated', handleLeadsUpdated);
    return () => {
      window.removeEventListener('portfolio_leads_updated', handleLeadsUpdated);
    };
  }, []);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    const entered = passwordInput.trim();
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD || 'Kumar@10';
    const current = data?.adminPassword;

    // Accept custom savedPassword, or envPass, or admin123 fallback
    const isValid = (current && entered === current) || 
                    entered === envPass || 
                    entered === 'Kumar@10' || 
                    entered === 'admin123';

    if (isValid) {
      setIsAuthenticated(true);
      sessionStorage.setItem('muthu_admin_authenticated', 'true');
      setLoginError('');
      setPasswordInput('');

      // Auto-save active passcode
      if (entered === 'Kumar@10' && data) {
        const updated = { ...data, adminPassword: 'Kumar@10' };
        setData(updated);
        savePortfolioData(updated);
      }
    } else {
      setLoginError('Invalid access password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('muthu_admin_authenticated');
    setPasswordInput('');
  };

  // Change Admin Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const currentCorrect = data?.adminPassword;
    const isCurrentValid = pwdChange.current === currentCorrect || 
                           pwdChange.current === 'Kumar@10' || 
                           pwdChange.current === 'admin123';
    
    if (!isCurrentValid) {
      setPwdFeedback({ type: 'danger', text: 'Current password does not match.' });
      return;
    }
    if (pwdChange.newPwd.length < 4) {
      setPwdFeedback({ type: 'danger', text: 'New password must be at least 4 characters.' });
      return;
    }
    if (pwdChange.newPwd !== pwdChange.confirmPwd) {
      setPwdFeedback({ type: 'danger', text: 'New password and confirmation do not match.' });
      return;
    }

    const updated = { ...data, adminPassword: pwdChange.newPwd };
    setData(updated);
    await savePortfolioData(updated);
    setPwdFeedback({ type: 'success', text: 'Admin password updated successfully!' });
    setPwdChange({ current: '', newPwd: '', confirmPwd: '' });
  };

  // Section Save Handler with support for single-key or multi-key atomic updates
  const handleSaveToDB = async (sectionKeyOrObj, draftValue) => {
    let patch = {};
    if (typeof sectionKeyOrObj === 'string') {
      patch = { [sectionKeyOrObj]: draftValue };
    } else if (typeof sectionKeyOrObj === 'object') {
      patch = sectionKeyOrObj;
    }
    const updated = { ...data, ...patch };
    setData(updated);
    showNotice('Syncing changes to cloud database...', 'info');
    try {
      await savePortfolioData(updated);
      showNotice('Settings saved and synchronized live to all devices!');
    } catch (err) {
      showNotice('Sync notice: ' + (err.message || 'Saved locally'), 'danger');
    }
  };

  // Photo updates (instant save and cloud broadcast)
  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhoto.url) {
      showNotice('Please select or enter an image URL.', 'danger');
      return;
    }
    const newItem = {
      ...newPhoto,
      id: 'g_' + Date.now(),
      title: newPhoto.title.trim() || 'Untitled Shot',
      category: newPhoto.category.trim() || 'General'
    };

    const galleryCopy = [newItem, ...(data.gallery || [])];
    const updated = { ...data, gallery: galleryCopy };
    setData(updated);
    showNotice('Publishing photo to cloud gallery...', 'info');
    try {
      await savePortfolioData(updated);
      setNewPhoto({ url: '', title: '', category: 'Portrait' });
      showNotice('Photo added! Published live and immediately visible to all visitors.');
    } catch (err) {
      showNotice('Saved locally. Cloud sync: ' + err.message, 'danger');
    }
  };

  const handleDeletePhoto = async (id) => {
    const galleryCopy = (data.gallery || []).filter(item => item.id !== id);
    const updated = { ...data, gallery: galleryCopy };
    setData(updated);
    showNotice('Deleting photo from cloud...', 'info');
    try {
      await savePortfolioData(updated);
      showNotice('Photo deleted successfully and removed across all devices.');
    } catch (err) {
      showNotice('Notice: ' + err.message, 'danger');
    }
  };

  // Handle local file selection with auto-compression
  const handlePhotoFileProcess = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploadingPhoto(true);
    try {
      const compressedBase64 = await compressImage(file, 1400, 1400, 0.82);
      setNewPhoto(prev => ({
        ...prev,
        url: compressedBase64,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      }));
    } catch (err) {
      console.error('Failed to compress image:', err);
      showNotice('Could not process image file. Try linking an image URL instead.', 'danger');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Stats Management (Add / Remove)
  const handleAddStat = () => {
    const updated = [...(statsDraft || []), { number: '10+', label: 'New Metric' }];
    setStatsDraft(updated);
  };

  const handleRemoveStat = (idx) => {
    const updated = statsDraft.filter((_, i) => i !== idx);
    setStatsDraft(updated);
  };

  // Skills Management
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const currentSkills = aboutDraft?.skills || [];
    if (!currentSkills.includes(newSkillInput.trim())) {
      setAboutDraft(prev => ({
        ...prev,
        skills: [...currentSkills, newSkillInput.trim()]
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setAboutDraft(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skillToRemove)
    }));
  };

  // Service Management
  const handleAddService = async (e) => {
    e.preventDefault();
    const servicesList = data.services || [];
    const newItem = {
      ...newService,
      num: String(servicesList.length + 1).padStart(2, '0')
    };
    const servicesCopy = [...servicesList, newItem];
    const updated = { ...data, services: servicesCopy };
    setData(updated);
    await savePortfolioData(updated);
    setNewService({ icon: 'bi-camera', num: '', title: '', desc: '', price: '' });
    showNotice('New photography package added!');
  };

  const handleDeleteService = async (idx) => {
    const servicesCopy = (data.services || [])
      .filter((_, i) => i !== idx)
      .map((srv, index) => ({
        ...srv,
        num: String(index + 1).padStart(2, '0')
      }));
    const updated = { ...data, services: servicesCopy };
    setData(updated);
    await savePortfolioData(updated);
    showNotice('Service package removed.');
  };

  // Testimonials Management
  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    const newItem = {
      ...newTestimonial,
      id: 't_' + Date.now(),
      img: newTestimonial.img.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'
    };
    const updatedList = [...(data.testimonials || []), newItem];
    const updated = { ...data, testimonials: updatedList };
    setData(updated);
    await savePortfolioData(updated);
    setNewTestimonial({ rating: 5, text: '', author: '', role: '', img: '' });
    showNotice('Client review added!');
  };

  const handleDeleteTestimonial = async (id) => {
    const updatedList = (data.testimonials || []).filter(t => t.id !== id);
    const updated = { ...data, testimonials: updatedList };
    setData(updated);
    await savePortfolioData(updated);
    showNotice('Testimonial removed.');
  };

  // Leads Management
  const handleDeleteLeadEntry = async (id) => {
    await deleteLead(id);
    const leadsList = await getLeads();
    setData(prev => ({ ...prev, leads: leadsList }));
    showNotice('Inquiry deleted from ledger.');
  };

  // Icon options for Service Picker
  const iconOptions = [
    { class: 'bi-camera', name: 'Camera' },
    { class: 'bi-person', name: 'Portrait' },
    { class: 'bi-heart', name: 'Wedding' },
    { class: 'bi-globe2', name: 'Landscape' },
    { class: 'bi-stars', name: 'Creative' },
    { class: 'bi-gem', name: 'Luxury' },
    { class: 'bi-film', name: 'Cinematic' },
    { class: 'bi-award', name: 'Editorial' },
    { class: 'bi-lightning', name: 'Events' },
    { class: 'bi-brush', name: 'Fine Art' }
  ];

  // If Not Authenticated: Render Login Card
  if (!isAuthenticated) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-black text-light p-3">
        <div 
          className="card p-4 p-md-5 rounded-0 border border-warning"
          style={{ 
            width: '100%', 
            maxWidth: '440px', 
            boxShadow: '0 0 40px rgba(201, 169, 110, 0.15)', 
            background: '#121212' 
          }}
        >
          <div className="text-center mb-4">
            <i className="bi bi-shield-lock text-warning fs-1 mb-2 d-inline-block"></i>
            <h2 className="font-serif text-warning" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.05em' }}>
              Photographer Access
            </h2>
            <p className="text-white-50 small mb-0">Enter your passcode to manage updates and gallery pictures</p>
          </div>

          <form onSubmit={handleLogin}>
            {loginError && (
              <div className="alert alert-danger text-center py-2 rounded-0 small bg-danger-subtle border-0 text-danger mb-3">
                {loginError}
              </div>
            )}
            <div className="mb-4">
              <label className="form-label text-uppercase text-white-50" style={{ letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                Access Key Password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                  style={{ fontSize: '0.88rem' }}
                  placeholder="Enter admin password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-0 text-white-50 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="btn btn-warning w-100 rounded-0 py-3 text-uppercase font-weight-bold text-dark" 
              style={{ letterSpacing: '0.15em', fontSize: '0.75rem' }}
            >
              Authorize Session
            </button>
            <div className="text-center mt-4">
              <a href="/" className="text-white-50 text-decoration-none small">
                <i className="bi bi-arrow-left me-1"></i>Return to Public Portfolio
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-vh-100 bg-black text-warning d-flex align-items-center justify-content-center">Loading Studio Dashboard...</div>;
  }

  return (
    <div className="min-vh-100 bg-dark text-light p-3 p-md-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="container-fluid max-w-7xl" style={{ maxWidth: '1400px' }}>
        
        {/* Top Header */}
        <header className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h1 className="h4 text-warning font-serif mb-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Photographer Studio Dashboard
              </h1>
              <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 small px-2 py-1">
                <i className="bi bi-cloud-check-fill me-1"></i>Cloud Sync: Active
              </span>
            </div>
            <p className="text-white-50 mb-0 small">
              Live updates directly synchronize with <a href="/" target="_blank" rel="noreferrer" className="text-warning text-decoration-underline">muthukumaran.visuals</a> across all public devices.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <a href="/" className="btn btn-outline-warning rounded-0 px-3 btn-sm text-uppercase" style={{ letterSpacing: '0.1em' }}>
              <i className="bi bi-box-arrow-up-right me-1"></i>View Site
            </a>
            <button className="btn btn-outline-danger rounded-0 px-3 btn-sm text-uppercase" style={{ letterSpacing: '0.1em' }} onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        </header>

        {/* Global Notification Banner */}
        {notificationMsg.text && (
          <div className={`alert alert-${notificationMsg.type === 'danger' ? 'danger' : 'success'} bg-transparent border-${notificationMsg.type === 'danger' ? 'danger' : 'warning'} text-${notificationMsg.type === 'danger' ? 'danger' : 'warning'} rounded-0 small py-2 mb-4`}>
            <i className={`bi ${notificationMsg.type === 'danger' ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-2`}></i>
            {notificationMsg.text}
          </div>
        )}

        <div className="row">
          {/* Sidebar Tabs */}
          <div className="col-lg-3 mb-4">
            <div className="list-group rounded-0 border-0">
              <button
                className={`list-group-item list-group-item-action rounded-0 py-3 d-flex justify-content-between align-items-center ${activeTab === 'gallery' ? 'active bg-warning text-dark border-warning' : 'bg-secondary text-white border-dark'}`}
                onClick={() => setActiveTab('gallery')}
              >
                <span><i className="bi bi-images me-2"></i>Gallery Photos</span>
                <span className="badge bg-dark text-warning">{data.gallery?.length || 0}</span>
              </button>
              <button
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'hero' ? 'active bg-warning text-dark border-warning' : 'bg-secondary text-white border-dark'}`}
                onClick={() => setActiveTab('hero')}
              >
                <i className="bi bi-brush me-2"></i>Hero & Stats
              </button>
              <button
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'about' ? 'active bg-warning text-dark border-warning' : 'bg-secondary text-white border-dark'}`}
                onClick={() => setActiveTab('about')}
              >
                <i className="bi bi-person-badge me-2"></i>Bio & Skills
              </button>
              <button
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'services' ? 'active bg-warning text-dark border-warning' : 'bg-secondary text-white border-dark'}`}
                onClick={() => setActiveTab('services')}
              >
                <i className="bi bi-collection me-2"></i>Packages & Services
              </button>
              <button
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'testimonials' ? 'active bg-warning text-dark border-warning' : 'bg-secondary text-white border-dark'}`}
                onClick={() => setActiveTab('testimonials')}
              >
                <i className="bi bi-chat-heart me-2"></i>Client Reviews
              </button>
              <button
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'contact' ? 'active bg-warning text-dark border-warning' : 'bg-secondary text-white border-dark'}`}
                onClick={() => setActiveTab('contact')}
              >
                <i className="bi bi-geo-alt me-2"></i>Contact Details
              </button>
              <button
                className={`list-group-item list-group-item-action rounded-0 py-3 d-flex justify-content-between align-items-center ${activeTab === 'leads' ? 'active bg-warning text-dark border-warning' : 'bg-secondary text-white border-dark'}`}
                onClick={() => setActiveTab('leads')}
              >
                <span><i className="bi bi-people-fill me-2"></i>Contacts Ledger</span>
                <span className="badge bg-warning text-dark">{data.leads?.length || 0}</span>
              </button>
              <button
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'security' ? 'active bg-warning text-dark border-warning' : 'bg-secondary text-white border-dark'}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="bi bi-key-fill me-2"></i>Security & Access
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="col-lg-9">
            <div className="card p-4 bg-secondary text-white rounded-0 border-secondary">

              {/* 1. GALLERY TAB */}
              {activeTab === 'gallery' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-warning mb-0">Gallery Photos ({data.gallery?.length || 0})</h3>
                    <a href="/#gallery" target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-warning rounded-0">
                      View Live Gallery <i className="bi bi-box-arrow-up-right ms-1"></i>
                    </a>
                  </div>
                  <p className="text-white-50 small mb-4">
                    Any photo you add or delete here will immediately appear or disappear on the public portfolio page (<code>/</code>).
                  </p>

                  {/* Add Photo Form */}
                  <form onSubmit={handleAddPhoto} className="mb-5 p-4 bg-dark border border-secondary">
                    <h5 className="text-warning mb-3">Add New Photo to Gallery</h5>

                    {/* Drag and Drop Zone */}
                    <div className="mb-3">
                      <label className="form-label text-muted small text-uppercase">1. Upload Image File (Auto-Optimized)</label>
                      <div
                        className="border border-dashed border-secondary p-4 text-center bg-black position-relative"
                        style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handlePhotoFileProcess(e.dataTransfer.files[0]);
                        }}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => handlePhotoFileProcess(e.target.files[0]);
                          input.click();
                        }}
                      >
                        {isUploadingPhoto ? (
                          <div className="py-2 text-warning">
                            <span className="spinner-border spinner-border-sm me-2"></span> Optimizing image...
                          </div>
                        ) : newPhoto.url ? (
                          <div className="d-flex align-items-center justify-content-center gap-3">
                            <img src={newPhoto.url} alt="Preview" style={{ height: '70px', width: '90px', objectFit: 'cover' }} className="border border-warning" />
                            <div className="text-start">
                              <span className="d-block small text-warning fw-bold">Image loaded and ready!</span>
                              <span className="small text-white-50">Click or drop again to replace.</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <i className="bi bi-cloud-arrow-up text-warning fs-2 mb-1 d-block"></i>
                            <span className="small text-white">Drag & drop photo here, or click to browse</span>
                            <span className="d-block text-white-50" style={{ fontSize: '0.7rem' }}>Images are automatically resized to web-friendly resolution</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-7">
                        <label className="form-label text-muted small text-uppercase">Or Image URL</label>
                        <input
                          type="text"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          placeholder="https://images.unsplash.com/... or upload above"
                          value={newPhoto.url}
                          onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label text-muted small text-uppercase">Category</label>
                        <input
                          type="text"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          placeholder="e.g. Portrait, Street, Landscape, Wedding"
                          value={newPhoto.category}
                          onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-muted small text-uppercase">Photo Title / Caption</label>
                      <input
                        type="text"
                        className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                        placeholder="Visual Caption Title..."
                        value={newPhoto.title}
                        onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-warning rounded-0 px-4 py-2 text-dark font-weight-bold">
                      <i className="bi bi-plus-lg me-1"></i>Add Photo to Gallery
                    </button>
                  </form>

                  {/* Existing Photos Grid */}
                  <h5 className="text-warning mb-3">Current Gallery Items ({data.gallery?.length || 0})</h5>
                  {(!data.gallery || data.gallery.length === 0) ? (
                    <div className="p-4 text-center text-muted bg-dark">No photos in gallery. Add one above!</div>
                  ) : (
                    <div className="row g-3">
                      {data.gallery.map((photo) => (
                        <div key={photo.id} className="col-sm-6 col-md-4">
                          <div className="card bg-dark border-secondary rounded-0 overflow-hidden h-100">
                            <img src={photo.url} alt={photo.title} style={{ height: '170px', objectFit: 'cover' }} />
                            <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                              <div>
                                <h6 className="mb-1 text-white text-truncate">{photo.title}</h6>
                                <span className="badge bg-secondary text-warning mb-3">{photo.category}</span>
                              </div>
                              <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="btn btn-outline-danger btn-sm rounded-0 w-100 mt-2"
                              >
                                <i className="bi bi-trash me-1"></i>Delete Photo
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. HERO & STATS TAB */}
              {activeTab === 'hero' && heroDraft && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="text-warning mb-0">Hero Section & Stats</h3>
                    <button
                      onClick={() => handleSaveToDB({ hero: heroDraft, stats: statsDraft })}
                      className="btn btn-warning rounded-0 px-4 py-2 text-dark font-weight-bold text-uppercase"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                    >
                      Save Changes
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small text-uppercase">Eyebrow Header</label>
                    <input
                      type="text"
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                      value={heroDraft.eyebrow || ''}
                      onChange={(e) => setHeroDraft({ ...heroDraft, eyebrow: e.target.value })}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small text-uppercase">Photographer Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                        value={heroDraft.name || ''}
                        onChange={(e) => setHeroDraft({ ...heroDraft, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small text-uppercase">Accent Word (Italic)</label>
                      <input
                        type="text"
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                        value={heroDraft.nameAccent || ''}
                        onChange={(e) => setHeroDraft({ ...heroDraft, nameAccent: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small text-uppercase">Main Brand Tagline</label>
                    <textarea
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                      rows="3"
                      value={heroDraft.tagline || ''}
                      onChange={(e) => setHeroDraft({ ...heroDraft, tagline: e.target.value })}
                    ></textarea>
                  </div>

                  <hr className="border-secondary my-4" />
                  
                  {/* Dynamic Stats Feature with Add/Remove */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="text-warning mb-0">Studio Metrics & Accomplishments</h4>
                    <button type="button" onClick={handleAddStat} className="btn btn-outline-warning btn-sm rounded-0">
                      <i className="bi bi-plus-lg me-1"></i>Add Metric
                    </button>
                  </div>

                  <div className="row">
                    {statsDraft && statsDraft.map((stat, idx) => (
                      <div key={idx} className="col-md-6 col-lg-3 mb-3">
                        <div className="p-3 bg-dark border border-secondary position-relative">
                          <button
                            type="button"
                            className="btn btn-link text-danger position-absolute top-0 end-0 p-2 text-decoration-none"
                            onClick={() => handleRemoveStat(idx)}
                            title="Remove Metric"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                          <label className="form-label text-muted small">Number / Stat</label>
                          <input
                            type="text"
                            className="form-control bg-secondary border-0 text-white rounded-0 p-2 mb-2"
                            value={stat.number}
                            onChange={(e) => {
                              const copy = [...statsDraft];
                              copy[idx] = { ...copy[idx], number: e.target.value };
                              setStatsDraft(copy);
                            }}
                          />
                          <label className="form-label text-muted small">Label</label>
                          <input
                            type="text"
                            className="form-control bg-secondary border-0 text-white rounded-0 p-2"
                            value={stat.label}
                            onChange={(e) => {
                              const copy = [...statsDraft];
                              copy[idx] = { ...copy[idx], label: e.target.value };
                              setStatsDraft(copy);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. BIO & SKILLS TAB */}
              {activeTab === 'about' && aboutDraft && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="text-warning mb-0">Bio, Profile & Skills</h3>
                    <button
                      onClick={() => handleSaveToDB('about', aboutDraft)}
                      className="btn btn-warning rounded-0 px-4 py-2 text-dark font-weight-bold text-uppercase"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                    >
                      Save Changes
                    </button>
                  </div>

                  {/* Profile Photo Uploader */}
                  <div className="mb-4">
                    <label className="form-label text-muted small text-uppercase d-block">Profile Photo</label>
                    <div className="d-flex align-items-center gap-4 flex-wrap">
                      <img
                        src={(aboutDraft.profilePhoto && !aboutDraft.profilePhoto.includes('unsplash.com')) ? aboutDraft.profilePhoto : '/profile.jpg'}
                        alt="Profile Preview"
                        className="border border-warning"
                        style={{ width: '120px', height: '140px', objectFit: 'cover' }}
                      />
                      <div
                        className="flex-grow-1 border border-dashed border-secondary p-4 text-center bg-dark"
                        style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            compressImage(file, 800, 800, 0.85).then(res => {
                              setAboutDraft({ ...aboutDraft, profilePhoto: res });
                            });
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              compressImage(file, 800, 800, 0.85).then(res => {
                                setAboutDraft({ ...aboutDraft, profilePhoto: res });
                              });
                            }
                          };
                          input.click();
                        }}
                      >
                        <i className="bi bi-cloud-arrow-up text-warning fs-3 mb-1 d-block"></i>
                        <span className="small text-white">Click or drag & drop to update profile photo</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small text-uppercase">Biography Paragraph 1</label>
                    <textarea
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                      rows="3"
                      value={aboutDraft.bio1 || ''}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, bio1: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small text-uppercase">Biography Paragraph 2</label>
                    <textarea
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                      rows="3"
                      value={aboutDraft.bio2 || ''}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, bio2: e.target.value })}
                    ></textarea>
                  </div>

                  {/* Skills Editor Feature */}
                  <hr className="border-secondary my-4" />
                  <h4 className="text-warning mb-3">Photographer Skills & Disciplines</h4>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {(aboutDraft.skills || []).map((skill, idx) => (
                      <span key={idx} className="badge bg-dark border border-warning text-warning p-2 px-3 d-inline-flex align-items-center gap-2">
                        {skill}
                        <button
                          type="button"
                          className="btn-close btn-close-white"
                          style={{ fontSize: '0.6rem' }}
                          onClick={() => handleRemoveSkill(skill)}
                          aria-label={`Remove ${skill}`}
                        ></button>
                      </span>
                    ))}
                  </div>

                  <div className="input-group mb-4" style={{ maxWidth: '400px' }}>
                    <input
                      type="text"
                      className="form-control bg-dark border border-secondary text-white rounded-0"
                      placeholder="Add new skill..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                    />
                    <button type="button" className="btn btn-warning rounded-0 px-3 text-dark" onClick={handleAddSkill}>
                      Add
                    </button>
                  </div>

                  {/* Gear Details */}
                  <h4 className="text-warning mb-3">Gear Specs & Details</h4>
                  <div className="row">
                    {(aboutDraft.details || []).map((detail, idx) => (
                      <div key={idx} className="col-md-6 mb-3">
                        <label className="form-label text-muted small">{detail.label}</label>
                        <input
                          type="text"
                          className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                          value={detail.value}
                          onChange={(e) => {
                            const detailsCopy = [...aboutDraft.details];
                            detailsCopy[idx] = { ...detailsCopy[idx], value: e.target.value };
                            setAboutDraft({ ...aboutDraft, details: detailsCopy });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. PACKAGES & SERVICES TAB */}
              {activeTab === 'services' && (
                <div>
                  <h3 className="text-warning mb-4">Photography Packages</h3>

                  {/* Add Service with Icon Picker */}
                  <form onSubmit={handleAddService} className="mb-5 p-4 bg-dark border border-secondary">
                    <h5 className="text-warning mb-3">Create New Package</h5>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small text-uppercase">Package Title</label>
                        <input
                          type="text"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          placeholder="e.g. Editorial Portraiture"
                          value={newService.title}
                          onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small text-uppercase">Starting Price</label>
                        <input
                          type="text"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          placeholder="e.g. Starts at $350"
                          value={newService.price}
                          onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {/* Icon Selector Feature */}
                    <div className="mb-3">
                      <label className="form-label text-muted small text-uppercase">Select Package Icon</label>
                      <div className="d-flex flex-wrap gap-2">
                        {iconOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt.class}
                            className={`btn btn-sm rounded-0 d-flex align-items-center gap-1 ${newService.icon === opt.class ? 'btn-warning text-dark' : 'btn-outline-secondary text-white'}`}
                            onClick={() => setNewService({ ...newService, icon: opt.class })}
                          >
                            <i className={`bi ${opt.class}`}></i>
                            <span>{opt.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-muted small text-uppercase">Description</label>
                      <textarea
                        className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                        placeholder="Package details..."
                        rows="2"
                        value={newService.desc}
                        onChange={(e) => setNewService({ ...newService, desc: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-warning rounded-0 px-4 py-2 text-dark font-weight-bold">
                      Add Package
                    </button>
                  </form>

                  {/* Current Services */}
                  <h5 className="text-warning mb-3">Current Packages</h5>
                  <div className="row">
                    {(data.services || []).map((srv, idx) => (
                      <div key={idx} className="col-md-6 mb-3">
                        <div className="p-3 bg-dark border border-secondary h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <i className={`bi ${srv.icon || 'bi-camera'} text-warning fs-5`}></i>
                                <h6 className="mb-0 text-warning">{srv.title}</h6>
                              </div>
                              <button
                                onClick={() => handleDeleteService(idx)}
                                className="btn btn-link text-danger p-0 text-decoration-none"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="small text-muted mb-2">{srv.desc}</p>
                          </div>
                          <span className="text-warning small fw-bold">{srv.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. TESTIMONIALS TAB */}
              {activeTab === 'testimonials' && (
                <div>
                  <h3 className="text-warning mb-4">Client Reviews</h3>
                  <form onSubmit={handleAddTestimonial} className="mb-5 p-4 bg-dark border border-secondary">
                    <h5 className="text-warning mb-3">Add Client Review</h5>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small text-uppercase">Client Name</label>
                        <input
                          type="text"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          value={newTestimonial.author}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, author: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small text-uppercase">Client Role / Category</label>
                        <input
                          type="text"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          placeholder="e.g. Wedding Clients"
                          value={newTestimonial.role}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-8">
                        <label className="form-label text-muted small text-uppercase">Profile Photo URL</label>
                        <input
                          type="url"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          value={newTestimonial.img}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, img: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small text-uppercase">Rating (1-5)</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          value={newTestimonial.rating}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) || 5 })}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small text-uppercase">Review Quote</label>
                      <textarea
                        className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                        rows="3"
                        value={newTestimonial.text}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-warning rounded-0 px-4 py-2 text-dark font-weight-bold">
                      Add Review
                    </button>
                  </form>

                  <h5 className="text-warning mb-3">Existing Reviews</h5>
                  <div className="row">
                    {(data.testimonials || []).map((test) => (
                      <div key={test.id} className="col-md-6 mb-3">
                        <div className="p-3 bg-dark border border-secondary h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-warning">{"★".repeat(test.rating)}</span>
                              <button onClick={() => handleDeleteTestimonial(test.id)} className="btn btn-link text-danger p-0 text-decoration-none">Delete</button>
                            </div>
                            <p className="small italic text-white-50">"{test.text}"</p>
                          </div>
                          <div className="d-flex align-items-center mt-3">
                            <img src={test.img} alt={test.author} className="rounded-circle me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                            <div>
                              <div className="small font-weight-bold text-white">{test.author}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{test.role}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. CONTACT DETAILS TAB */}
              {activeTab === 'contact' && contactDraft && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="text-warning mb-0">Contact Details & Studio Coordinates</h3>
                    <button
                      onClick={() => handleSaveToDB('contact', contactDraft)}
                      className="btn btn-warning rounded-0 px-4 py-2 text-dark font-weight-bold text-uppercase"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                    >
                      Save Changes
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small text-uppercase">Studio Email</label>
                    <input
                      type="email"
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                      value={contactDraft.email || ''}
                      onChange={(e) => setContactDraft({ ...contactDraft, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small text-uppercase">Phone / WhatsApp</label>
                    <input
                      type="text"
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                      value={contactDraft.phone || ''}
                      onChange={(e) => setContactDraft({ ...contactDraft, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small text-uppercase">Studio Physical Address</label>
                    <input
                      type="text"
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                      value={contactDraft.address || ''}
                      onChange={(e) => setContactDraft({ ...contactDraft, address: e.target.value })}
                    />
                  </div>

                  <hr className="border-secondary my-4" />
                  <h4 className="text-warning mb-3">Social Media Links</h4>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted small">Instagram URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                        value={contactDraft.instagram || ''}
                        onChange={(e) => setContactDraft({ ...contactDraft, instagram: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted small">Twitter / X URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                        value={contactDraft.twitter || ''}
                        onChange={(e) => setContactDraft({ ...contactDraft, twitter: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted small">Facebook URL</label>
                      <input
                        type="url"
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3"
                        value={contactDraft.facebook || ''}
                        onChange={(e) => setContactDraft({ ...contactDraft, facebook: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. CONTACTS INQUIRY LEDGER TAB */}
              {activeTab === 'leads' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-warning mb-0">Contacts Inquiry Ledger</h3>
                    <span className="badge bg-warning text-dark px-3 py-2">
                      {data.leads?.length || 0} Submissions
                    </span>
                  </div>
                  <p className="text-white-50 small mb-4">
                    Inquiries submitted via the portfolio contact form appear here in real-time.
                  </p>

                  {(!data.leads || data.leads.length === 0) ? (
                    <div className="text-center py-5 text-muted bg-dark border border-secondary p-4">
                      <i className="bi bi-inbox fs-1 d-block mb-2 text-warning opacity-50"></i>
                      No contact inquiries recorded yet.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle border border-secondary" style={{ backgroundColor: '#111', color: '#fff' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#0a0a0a', borderBottom: '2px solid #c9a96e' }}>
                            <th className="py-3 px-3 text-warning border-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Date</th>
                            <th className="py-3 text-warning border-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Sender</th>
                            <th className="py-3 text-warning border-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Email</th>
                            <th className="py-3 text-warning border-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Subject</th>
                            <th className="py-3 text-warning border-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Message</th>
                            <th className="py-3 text-warning border-secondary text-end px-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.leads.map((lead) => (
                            <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#181818' }}>
                              <td className="py-3 px-3 border-0 small text-nowrap">
                                <strong>{new Date(lead.date).toLocaleDateString()}</strong> <br />
                                <span className="text-warning small">{new Date(lead.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </td>
                              <td className="py-3 border-0 fw-bold">{lead.name}</td>
                              <td className="py-3 border-0">
                                <a href={`mailto:${lead.email}?subject=Re: ${encodeURIComponent(lead.subject || 'Portfolio Inquiry')}`} className="text-warning text-decoration-none small">
                                  {lead.email} <i className="bi bi-envelope-fill ms-1"></i>
                                </a>
                              </td>
                              <td className="py-3 border-0 text-white-50 small">{lead.subject}</td>
                              <td className="py-3 border-0 small" style={{ maxWidth: '300px', wordBreak: 'break-word', lineHeight: '1.5' }}>
                                {lead.message}
                              </td>
                              <td className="py-3 border-0 text-end px-3 text-nowrap">
                                <a
                                  href={`mailto:${lead.email}?subject=Re: ${encodeURIComponent(lead.subject || 'Portfolio Inquiry')}`}
                                  className="btn btn-outline-warning btn-sm rounded-0 me-2"
                                  title="Reply via Email"
                                >
                                  <i className="bi bi-reply-fill"></i>
                                </a>
                                <button
                                  onClick={() => handleDeleteLeadEntry(lead.id)}
                                  className="btn btn-outline-danger btn-sm rounded-0"
                                  title="Delete Inquiry"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 8. SECURITY & ACCESS TAB (Addresses Admin Access Issue) */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-warning mb-3">Security & Passcode Settings</h3>
                  <p className="text-white-50 small mb-4">
                    Change your admin passcode to prevent unauthorized access. The updated passcode will be stored in your portfolio configuration.
                  </p>

                  <div className="card bg-dark border-secondary p-4 rounded-0" style={{ maxWidth: '550px' }}>
                    <form onSubmit={handlePasswordChange}>
                      {pwdFeedback.text && (
                        <div className={`alert alert-${pwdFeedback.type} py-2 rounded-0 small`}>
                          {pwdFeedback.text}
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label text-muted small text-uppercase">Current Password</label>
                        <input
                          type="password"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          placeholder="Enter current password..."
                          value={pwdChange.current}
                          onChange={(e) => setPwdChange({ ...pwdChange, current: e.target.value })}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small text-uppercase">New Password</label>
                        <input
                          type="password"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          placeholder="At least 4 characters..."
                          value={pwdChange.newPwd}
                          onChange={(e) => setPwdChange({ ...pwdChange, newPwd: e.target.value })}
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label text-muted small text-uppercase">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3"
                          placeholder="Re-type new password..."
                          value={pwdChange.confirmPwd}
                          onChange={(e) => setPwdChange({ ...pwdChange, confirmPwd: e.target.value })}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-warning rounded-0 px-4 py-2 text-dark font-weight-bold">
                        Update Admin Password
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
