import { getPortfolioData, savePortfolioData, getLeads, deleteLead } from '../data/db';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('hero');

  // Temporary States for Adding Items
  const [newPhoto, setNewPhoto] = useState({ url: '', title: '', category: 'Portrait' });
  const [newService, setNewService] = useState({ icon: 'bi-camera', num: '', title: '', desc: '', price: '' });
  const [newTestimonial, setNewTestimonial] = useState({ rating: 5, text: '', author: '', role: '', img: '' });

  // Local edit draft states (only committed to db on explicit Save button click)
  const [heroDraft, setHeroDraft] = useState(null);
  const [aboutDraft, setAboutDraft] = useState(null);
  const [contactDraft, setContactDraft] = useState(null);
  const [statsDraft, setStatsDraft] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const refreshData = () => {
    getPortfolioData().then(freshData => {
      setData(freshData);
      setHeroDraft(freshData.hero);
      setAboutDraft(freshData.about);
      setContactDraft(freshData.contact);
      setStatsDraft(freshData.stats);
    });

    getLeads().then(leadsList => {
      setData(prev => prev ? { ...prev, leads: leadsList } : { leads: leadsList });
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleSaveToDB = async (sectionKey, draftValue) => {
    const freshData = await getPortfolioData();
    const updated = { ...freshData, [sectionKey]: draftValue };
    setData(updated);
    await savePortfolioData(updated);
    
    setSaveSuccessMsg(`${sectionKey.toUpperCase()} settings saved successfully!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Hero updates
  const handleHeroDraftChange = (field, val) => {
    setHeroDraft(prev => ({ ...prev, [field]: val }));
  };

  // Profile details updates
  const handleAboutDraftChange = (field, val) => {
    setAboutDraft(prev => ({ ...prev, [field]: val }));
  };

  const handleAboutDetailDraftChange = (idx, field, val) => {
    const detailsCopy = [...aboutDraft.details];
    detailsCopy[idx] = { ...detailsCopy[idx], [field]: val };
    setAboutDraft(prev => ({ ...prev, details: detailsCopy }));
  };

  // Stats updates
  const handleStatDraftChange = (idx, field, val) => {
    const statsCopy = [...statsDraft];
    statsCopy[idx] = { ...statsCopy[idx], [field]: val };
    setStatsDraft(statsCopy);
  };

  // Photo updates (saved immediately on submission list edit)
  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newPhoto.url) return;
    const galleryCopy = [...data.gallery, { ...newPhoto, id: 'g' + (Date.now()) }];
    const updated = { ...data, gallery: galleryCopy };
    setData(updated);
    savePortfolioData(updated);
    setNewPhoto({ url: '', title: '', category: 'Portrait' });
  };

  const handleDeletePhoto = (id) => {
    const galleryCopy = data.gallery.filter(item => item.id !== id);
    const updated = { ...data, gallery: galleryCopy };
    setData(updated);
    savePortfolioData(updated);
  };

  // Service updates
  const handleAddService = (e) => {
    e.preventDefault();
    const servicesCopy = [...data.services, { ...newService, num: '0' + (data.services.length + 1) }];
    const updated = { ...data, services: servicesCopy };
    setData(updated);
    savePortfolioData(updated);
    setNewService({ icon: 'bi-camera', num: '', title: '', desc: '', price: '' });
  };

  const handleDeleteService = (idx) => {
    const servicesCopy = data.services.filter((_, i) => i !== idx).map((srv, index) => ({
      ...srv,
      num: '0' + (index + 1)
    }));
    const updated = { ...data, services: servicesCopy };
    setData(updated);
    savePortfolioData(updated);
  };

  // Testimonials updates
  const handleAddTestimonial = (e) => {
    e.preventDefault();
    const testimonialsCopy = [...data.testimonials, { ...newTestimonial, id: 't' + (Date.now()) }];
    const updated = { ...data, testimonials: testimonialsCopy };
    setData(updated);
    savePortfolioData(updated);
    setNewTestimonial({ rating: 5, text: '', author: '', role: '', img: '' });
  };

  const handleDeleteTestimonial = (id) => {
    const testimonialsCopy = data.testimonials.filter(t => t.id !== id);
    const updated = { ...data, testimonials: testimonialsCopy };
    setData(updated);
    savePortfolioData(updated);
  };

  // Contact updates
  const handleContactDraftChange = (field, val) => {
    setContactDraft(prev => ({ ...prev, [field]: val }));
  };

  const handleDeleteLead = async (id) => {
    await deleteLead(id);
    refreshData();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid password. Try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-dark text-light" style={{ cursor: 'default' }}>
        <div className="card p-5 bg-secondary text-white rounded-0 border border-warning" style={{ width: '420px', boxShadow: '0 0 30px rgba(201, 169, 110, 0.15)', background: 'rgba(26,26,26,0.85)', backdropFilter: 'blur(10px)' }}>
          <h2 className="text-center font-serif text-warning mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.05em' }}>Photographer Access</h2>
          <p className="text-muted small text-center mb-4">Enter your passcode to manage updates and gallery pictures</p>
          <form onSubmit={handleLogin}>
            {loginError && <div className="alert alert-danger text-center py-2 rounded-0 small bg-danger-subtle border-0 text-danger">{loginError}</div>}
            <div className="mb-4">
              <label className="form-label text-uppercase small" style={{ letterSpacing: '0.1em', fontSize: '0.65rem' }}>Access Key Password</label>
              <input 
                type="password" 
                className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                style={{ fontSize: '0.85rem' }}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <small className="text-muted mt-2 d-block text-center">Demo Key: <strong>admin123</strong></small>
            </div>
            <button type="submit" className="btn btn-warning w-100 rounded-0 py-3 text-uppercase font-weight-bold" style={{ letterSpacing: '0.15em', fontSize: '0.75rem' }}>Authorize Session</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-dark text-light p-4" style={{ fontFamily: "'Outfit', sans-serif", cursor: 'default' }}>
      <div className="container">
        <header className="d-flex justify-content-between align-items-center pb-4 mb-4 border-bottom border-secondary">
          <div>
            <h1 className="h3 text-warning font-serif" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Photographer Studio Dashboard</h1>
            <p className="text-white-50 mb-0 small">Directly modify your live website settings and photos instantly.</p>
          </div>
          <div>
            <a href="/" className="btn btn-outline-warning rounded-0 px-4 me-3 btn-sm text-uppercase" style={{ letterSpacing: '0.1em' }}>View Site</a>
            <button className="btn btn-danger rounded-0 px-4 btn-sm text-uppercase" style={{ letterSpacing: '0.1em' }} onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="row mt-4">
          {/* Navigation Sidebar */}
          <div className="col-md-3 mb-4">
            <div className="list-group rounded-0 border-0">
              <button 
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'hero' ? 'active' : ''}`}
                onClick={() => setActiveTab('hero')}
              >
                Hero & Brand Settings
              </button>
              <button 
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                Gallery Photos
              </button>
              <button 
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                Bio & Profile Info
              </button>
              <button 
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Photography Packages
              </button>
              <button 
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'testimonials' ? 'active' : ''}`}
                onClick={() => setActiveTab('testimonials')}
              >
                Client Reviews
              </button>
              <button 
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                Contact Details
              </button>
              <button 
                className={`list-group-item list-group-item-action rounded-0 py-3 ${activeTab === 'leads' ? 'active' : ''}`}
                onClick={() => setActiveTab('leads')}
              >
                <i className="bi bi-people-fill me-2 text-warning"></i>Contacts Ledger
              </button>
            </div>
          </div>

          {/* Editor Content Area */}
          <div className="col-md-9">
            <div className="card p-4 bg-secondary text-white rounded-0 border-secondary">
              
              {/* HERO & STATS TAB */}
              {activeTab === 'hero' && heroDraft && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="text-warning mb-0">Edit Hero Section & Stats</h3>
                    <button 
                      onClick={() => {
                        handleSaveToDB('hero', heroDraft);
                        handleSaveToDB('stats', statsDraft);
                      }} 
                      className="btn btn-warning rounded-0 px-4 py-2 text-uppercase font-weight-bold"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                    >
                      Save Changes
                    </button>
                  </div>

                  {saveSuccessMsg && (
                    <div className="alert alert-success bg-transparent border-warning text-warning rounded-0 small py-2">
                      {saveSuccessMsg}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-muted">Eyebrow Title</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                      value={heroDraft.eyebrow} 
                      onChange={(e) => handleHeroDraftChange('eyebrow', e.target.value)} 
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Photographer First Name</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                        value={heroDraft.name} 
                        onChange={(e) => handleHeroDraftChange('name', e.target.value)} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">Title / Subtitle</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                        value={heroDraft.nameAccent} 
                        onChange={(e) => handleHeroDraftChange('nameAccent', e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted">Main Brand Tagline</label>
                    <textarea 
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                      rows="3" 
                      value={heroDraft.tagline} 
                      onChange={(e) => handleHeroDraftChange('tagline', e.target.value)}
                    ></textarea>
                  </div>

                  <hr className="border-secondary my-4" />
                  <h4 className="text-warning mb-3">Studio Metrics & Accomplishments</h4>
                  <div className="row">
                    {statsDraft && statsDraft.map((stat, idx) => (
                      <div key={idx} className="col-md-3 mb-3">
                        <label className="form-label text-muted">Stat {idx + 1} Number</label>
                        <input 
                          type="text" 
                          className="form-control bg-dark border border-secondary text-white rounded-0 p-2 mb-2" 
                          value={stat.number} 
                          onChange={(e) => handleStatDraftChange(idx, 'number', e.target.value)} 
                        />
                        <label className="form-label text-muted">Stat {idx + 1} Label</label>
                        <input 
                          type="text" 
                          className="form-control bg-dark border border-secondary text-white rounded-0 p-2" 
                          value={stat.label} 
                          onChange={(e) => handleStatDraftChange(idx, 'label', e.target.value)} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GALLERY MANAGER */}
              {activeTab === 'gallery' && (
                <div>
                  <h3 className="text-warning mb-4">Manage Gallery Photos</h3>
                  
                  {/* Add Photo Form */}
                  <form onSubmit={handleAddPhoto} className="mb-5 p-4 bg-dark border border-secondary">
                    <h5 className="text-warning mb-3">Add New Photo to Gallery</h5>
                    
                    {/* Drag and Drop Zone for Gallery File Upload */}
                    <div className="mb-4">
                      <label className="form-label text-muted d-block font-weight-bold">File Upload (Drag & Drop)</label>
                      <div 
                        className="border border-dashed border-secondary p-4 text-center bg-secondary"
                        style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setNewPhoto(prev => ({ ...prev, url: event.target.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setNewPhoto(prev => ({ ...prev, url: event.target.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        {newPhoto.url ? (
                          <div className="d-flex align-items-center justify-content-center gap-3">
                            <img src={newPhoto.url} alt="Upload Preview" style={{ height: '60px', width: '80px', objectFit: 'cover' }} className="border border-warning" />
                            <span className="small text-warning">Image loaded successfully! Drop or click again to change.</span>
                          </div>
                        ) : (
                          <>
                            <i className="bi bi-images text-warning fs-3 mb-2 d-block"></i>
                            <span className="small text-white-50">Drag & drop image file here, or click to upload</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-8">
                        <label className="form-label text-muted">Or Link Image URL directly</label>
                        <input 
                          type="url" 
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                          placeholder="https://..." 
                          value={newPhoto.url} 
                          onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })} 
                          required 
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted">Photo Category</label>
                        <input 
                          type="text" 
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                          placeholder="e.g. Portrait, Landscape" 
                          value={newPhoto.category} 
                          onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Photo Title / Caption</label>
                      <input 
                        type="text" 
                        className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                        placeholder="Visual Caption Title..." 
                        value={newPhoto.title} 
                        onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })} 
                        required 
                      />
                    </div>
                    <button type="submit" className="btn btn-warning rounded-0 px-4 py-2">Add Photo</button>
                  </form>

                  {/* List existing photos */}
                  <h5 className="text-warning mb-3">Existing Gallery Items</h5>
                  <div className="row">
                    {data.gallery.map((photo) => (
                      <div key={photo.id} className="col-md-4 mb-4">
                        <div className="card bg-dark border-0 rounded-0 overflow-hidden h-100">
                          <img src={photo.url} alt={photo.title} style={{ height: '180px', objectFit: 'cover' }} />
                          <div className="p-3">
                            <h6 className="mb-1">{photo.title}</h6>
                            <span className="badge bg-secondary mb-3">{photo.category}</span>
                            <button 
                              onClick={() => handleDeletePhoto(photo.id)} 
                              className="btn btn-outline-danger btn-sm rounded-0 w-100"
                            >
                              Delete Photo
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABOUT SECTION TAB */}
              {activeTab === 'about' && aboutDraft && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="text-warning mb-0">Bio & Profile Settings</h3>
                    <button 
                      onClick={() => handleSaveToDB('about', aboutDraft)} 
                      className="btn btn-warning rounded-0 px-4 py-2 text-uppercase font-weight-bold"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                    >
                      Save Changes
                    </button>
                  </div>

                  {saveSuccessMsg && (
                    <div className="alert alert-success bg-transparent border-warning text-warning rounded-0 small py-2">
                      {saveSuccessMsg}
                    </div>
                  )}
                  
                  {/* Profile Pic Drag and Drop Uploader */}
                  <div className="mb-4">
                    <label className="form-label text-muted d-block">Profile Photo</label>
                    <div className="d-flex align-items-center gap-4 flex-wrap">
                      <img 
                        src={aboutDraft.profilePhoto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200'} 
                        alt="Profile Preview" 
                        className="border border-warning"
                        style={{ width: '120px', height: '150px', objectFit: 'cover' }}
                      />
                      <div 
                        className="flex-grow-1 border border-dashed border-secondary p-4 text-center bg-dark"
                        style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              handleAboutDraftChange('profilePhoto', event.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                handleAboutDraftChange('profilePhoto', event.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        <i className="bi bi-cloud-arrow-up text-warning fs-3 mb-2 d-block"></i>
                        <span className="small text-white-50">Drag & drop profile picture here, or click to upload</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted">Eyebrow Tag</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                      value={aboutDraft.eyebrow} 
                      onChange={(e) => handleAboutDraftChange('eyebrow', e.target.value)} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">About Title</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                      value={aboutDraft.title} 
                      onChange={(e) => handleAboutDraftChange('title', e.target.value)} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Biography Paragraph 1</label>
                    <textarea 
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                      rows="3" 
                      value={aboutDraft.bio1} 
                      onChange={(e) => handleAboutDraftChange('bio1', e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted">Biography Paragraph 2</label>
                    <textarea 
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                      rows="3" 
                      value={aboutDraft.bio2} 
                      onChange={(e) => handleAboutDraftChange('bio2', e.target.value)}
                    ></textarea>
                  </div>

                  <hr className="border-secondary my-4" />
                  <h4 className="text-warning mb-3">Gear Specs & Details</h4>
                  <div className="row">
                    {aboutDraft.details.map((detail, idx) => (
                      <div key={idx} className="col-md-6 mb-3">
                        <label className="form-label text-muted">{detail.label}</label>
                        <input 
                          type="text" 
                          className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                          value={detail.value} 
                          onChange={(e) => handleAboutDetailDraftChange(idx, 'value', e.target.value)} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SERVICES TAB */}
              {activeTab === 'services' && (
                <div>
                  <h3 className="text-warning mb-4">Photography Packages</h3>
                  
                  {/* Add Service Form */}
                  <form onSubmit={handleAddService} className="mb-5 p-4 bg-dark border border-secondary">
                    <h5 className="text-warning mb-3">Create New Package</h5>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted">Package Title</label>
                        <input 
                          type="text" 
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                          placeholder="e.g. Portrait Session" 
                          value={newService.title} 
                          onChange={(e) => setNewService({ ...newService, title: e.target.value })} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted">Package Starting Price</label>
                        <input 
                          type="text" 
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                          placeholder="e.g. Starts at $300" 
                          value={newService.price} 
                          onChange={(e) => setNewService({ ...newService, price: e.target.value })} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Description of details</label>
                      <textarea 
                        className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                        placeholder="Package details and sessions..." 
                        rows="2" 
                        value={newService.desc} 
                        onChange={(e) => setNewService({ ...newService, desc: e.target.value })} 
                        required 
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-warning rounded-0 px-4 py-2">Add Package</button>
                  </form>

                  {/* List existing services */}
                  <h5 className="text-warning mb-3">Current Packages</h5>
                  <div className="row">
                    {data.services.map((srv, idx) => (
                      <div key={idx} className="col-md-6 mb-3">
                        <div className="p-3 bg-dark border border-secondary">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 text-warning">{srv.title}</h6>
                            <button 
                              onClick={() => handleDeleteService(idx)} 
                              className="btn btn-link text-danger p-0 text-decoration-none"
                            >
                              Remove
                            </button>
                          </div>
                          <p className="small text-muted mb-2">{srv.desc}</p>
                          <span className="text-warning small">{srv.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TESTIMONIALS TAB */}
              {activeTab === 'testimonials' && (
                <div>
                  <h3 className="text-warning mb-4">Manage Client Endorsements</h3>
                  
                  {/* Add Testimonial Form */}
                  <form onSubmit={handleAddTestimonial} className="mb-5 p-4 bg-dark border border-secondary">
                    <h5 className="text-warning mb-3">Add Client Review</h5>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted">Client Name</label>
                        <input 
                          type="text" 
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                          placeholder="e.g. John Doe" 
                          value={newTestimonial.author} 
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, author: e.target.value })} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted">Client Category / Project</label>
                        <input 
                          type="text" 
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                          placeholder="e.g. Fashion Shoot" 
                          value={newTestimonial.role} 
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-8">
                        <label className="form-label text-muted">Client Profile Picture URL</label>
                        <input 
                          type="url" 
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                          placeholder="https://images.unsplash.com/..." 
                          value={newTestimonial.img} 
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, img: e.target.value })} 
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted">Star Rating (1 - 5)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="5" 
                          className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                          value={newTestimonial.rating} 
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted">Review Content Quote</label>
                      <textarea 
                        className="form-control bg-secondary border-0 text-white rounded-0 p-3" 
                        placeholder="What did they say..." 
                        rows="3" 
                        value={newTestimonial.text} 
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })} 
                        required 
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-warning rounded-0 px-4 py-2">Add Review</button>
                  </form>

                  {/* List Testimonials */}
                  <h5 className="text-warning mb-3">Approved Testimonials</h5>
                  <div className="row">
                    {data.testimonials.map((test) => (
                      <div key={test.id} className="col-md-6 mb-3">
                        <div className="p-3 bg-dark border border-secondary h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>{"★".repeat(test.rating)}</span>
                              <button onClick={() => handleDeleteTestimonial(test.id)} className="btn btn-link text-danger p-0 text-decoration-none">Delete</button>
                            </div>
                            <p className="small italic text-white-50">"{test.text}"</p>
                          </div>
                          <div className="d-flex align-items-center mt-3">
                            <img src={test.img || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'} alt={test.author} className="rounded-circle me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
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

              {/* CONTACT DETAILS TAB */}
              {activeTab === 'contact' && contactDraft && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="text-warning mb-0">Contact Info & Studio Coordinates</h3>
                    <button 
                      onClick={() => handleSaveToDB('contact', contactDraft)} 
                      className="btn btn-warning rounded-0 px-4 py-2 text-uppercase font-weight-bold"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                    >
                      Save Changes
                    </button>
                  </div>

                  {saveSuccessMsg && (
                    <div className="alert alert-success bg-transparent border-warning text-warning rounded-0 small py-2">
                      {saveSuccessMsg}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-muted">Studio Email</label>
                    <input 
                      type="email" 
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                      value={contactDraft.email} 
                      onChange={(e) => handleContactDraftChange('email', e.target.value)} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Phone Line / Mobile</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                      value={contactDraft.phone} 
                      onChange={(e) => handleContactDraftChange('phone', e.target.value)} 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Physical Studio Location Address</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                      value={contactDraft.address} 
                      onChange={(e) => handleContactDraftChange('address', e.target.value)} 
                    />
                  </div>

                  <hr className="border-secondary my-4" />
                  <h4 className="text-warning mb-3">Social Media Integrations</h4>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Instagram Link</label>
                      <input 
                        type="url" 
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                        value={contactDraft.instagram} 
                        onChange={(e) => handleContactDraftChange('instagram', e.target.value)} 
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Twitter (X) Link</label>
                      <input 
                        type="url" 
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                        value={contactDraft.twitter} 
                        onChange={(e) => handleContactDraftChange('twitter', e.target.value)} 
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-muted">Facebook Link</label>
                      <input 
                        type="url" 
                        className="form-control bg-dark border border-secondary text-white rounded-0 p-3" 
                        value={contactDraft.facebook} 
                        onChange={(e) => handleContactDraftChange('facebook', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CONTACTS LEDGER TAB */}
              {activeTab === 'leads' && (
                <div>
                  <h3 className="text-warning mb-4">Contacts Inquiry Ledger</h3>
                  <p className="text-white mb-4" style={{ fontSize: '0.9rem' }}>Below are the details of people who have filled out the contact form on your portfolio website.</p>
                  
                  {(!data.leads || data.leads.length === 0) ? (
                    <div className="text-center py-5 text-white" style={{ fontSize: '1rem', fontWeight: '400' }}>No contact inquiries recorded yet.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle border border-secondary" style={{ backgroundColor: '#111111', color: '#ffffff' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#0a0a0a', borderBottom: '2px solid #c9a96e' }}>
                            <th className="py-3 px-3 text-warning border-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#c9a96e !important' }}>Date & Time</th>
                            <th className="py-3 text-warning border-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#c9a96e !important' }}>Sender Name</th>
                            <th className="py-3 text-warning border-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#c9a96e !important' }}>Email Address</th>
                            <th className="py-3 text-warning border-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#c9a96e !important' }}>Subject</th>
                            <th className="py-3 text-warning border-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#c9a96e !important' }}>Inquiry Message</th>
                            <th className="py-3 text-warning border-secondary text-end px-3" style={{ fontSize: '0.8rem', letterSpacing: '0.1em', color: '#c9a96e !important' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.leads.map((lead) => (
                            <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', backgroundColor: '#1a1a1a' }}>
                              <td className="py-3 px-3 border-0" style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#ffffff' }}>
                                <strong>{new Date(lead.date).toLocaleDateString()}</strong> <br />
                                <span style={{ color: '#e8c98a' }}>{new Date(lead.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </td>
                              <td className="py-3 border-0" style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '500' }}>{lead.name}</td>
                              <td className="py-3 border-0" style={{ fontSize: '0.9rem', color: '#e8c98a' }}>{lead.email}</td>
                              <td className="py-3 border-0" style={{ fontSize: '0.9rem', color: '#cccccc', fontStyle: 'italic' }}>{lead.subject}</td>
                              <td className="py-3 border-0" style={{ maxWidth: '300px', wordBreak: 'break-word', fontSize: '0.9rem', lineHeight: '1.5', color: '#ffffff' }}>{lead.message}</td>
                              <td className="py-3 border-0 text-end px-3">
                                <button 
                                  onClick={() => handleDeleteLead(lead.id)} 
                                  className="btn btn-outline-danger btn-sm rounded-0"
                                  title="Delete Lead"
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
