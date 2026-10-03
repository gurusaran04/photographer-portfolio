import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = (envUrl && !envUrl.includes('fnglpkmehsxrlzubdtcl')) 
  ? envUrl 
  : 'https://lhvklncwlcjoftgmolol.supabase.co';

const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseAnonKey = (envKey && !envKey.includes('jylyuRiPQwpAoeKzNGyWyA'))
  ? envKey
  : 'sb_publishable_cTL5KcawClTbUZeED2LDhg_zOiiEA6n';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const defaultData = {
  version: 2,
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || 'Kumar@10',
  hero: {
    eyebrow: 'Visual Storyteller',
    name: 'Muthukumaran',
    nameAccent: 'Photographer',
    tagline: 'Capturing the raw essence of human emotions, the sublime grandeur of natural landscapes, and the timeless magic of life\'s fleeting moments through an artistic lens.',
    ctaText: 'View Portfolio',
    heroImageIds: [] // optional specific gallery image IDs to showcase in hero
  },
  stats: [
    { number: '5+', label: 'Years Experience' },
    { number: '150+', label: 'Projects Completed' },
    { number: '30+', label: 'Awards Won' },
    { number: '100%', label: 'Happy Clients' }
  ],
  about: {
    eyebrow: 'The Storyteller',
    title: 'Behind the Lens',
    profilePhoto: '/profile.jpg',
    bio1: 'I am Muthukumaran, a visual storyteller based in Chennai, India. For over half a decade, I have dedicated myself to freezing moments in time that speak a universal language of emotion, elegance, and beauty. My approach is minimalist yet deeply expressive, focusing on light, shadows, and the genuine connections between my subjects and their environments.',
    bio2: 'Whether it is a candid glance at a bustling wedding, a pristine landscape bathed in golden light, or a bold commercial portrait, my goal is to craft images that resonate with authenticity and stay etched in your memory forever.',
    details: [
      { label: 'Camera Body', value: 'Sony A7R V / Sony FX3' },
      { label: 'Prime Lenses', value: '35mm f/1.4 GM / 85mm f/1.2 GM' },
      { label: 'My Style', value: 'Cinematic, Raw, Documentary' },
      { label: 'Availability', value: 'Worldwide / Commissions Open' }
    ],
    skills: ['Portraiture', 'Landscape', 'Fashion', 'Wedding', 'Street', 'Commercial', 'Post-processing']
  },
  services: [
    {
      icon: 'bi-person',
      num: '01',
      title: 'Editorial Portraiture',
      desc: 'High-end portraits tailored for editorials, artists, professionals, and corporate profiles, focusing on personality and unique identity.',
      price: 'Starts at $250'
    },
    {
      icon: 'bi-camera',
      num: '02',
      title: 'Commercial & Fashion',
      desc: 'Striking visuals designed to amplify brand stories, showcase clothing, and create impactful marketing campaigns.',
      price: 'Starts at $600'
    },
    {
      icon: 'bi-heart',
      num: '03',
      title: 'Luxury Weddings',
      desc: 'Cinematic, documentary-style wedding storytelling that preserves every teardrop, laughter, and magical glance forever.',
      price: 'Starts at $1500'
    },
    {
      icon: 'bi-globe2',
      num: '04',
      title: 'Fine Art Landscapes',
      desc: 'Stunning, high-resolution prints of landscapes from around the world, perfect for residential, commercial or gallery spaces.',
      price: 'Starts at $150'
    }
  ],
  gallery: [
    {
      id: 'g1',
      url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop',
      title: 'Golden Hour Silhouette',
      category: 'Portrait'
    },
    {
      id: 'g2',
      url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
      title: 'Monochrome Street',
      category: 'Street'
    },
    {
      id: 'g3',
      url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop',
      title: 'Mist in the Valley',
      category: 'Landscape'
    },
    {
      id: 'g4',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
      title: 'The Eternal Vow',
      category: 'Wedding'
    },
    {
      id: 'g5',
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      title: 'High Fashion Studio',
      category: 'Fashion'
    },
    {
      id: 'g6',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
      title: 'Summer Meadow Portrait',
      category: 'Portrait'
    },
    {
      id: 'g7',
      url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format&fit=crop',
      title: 'Forest Canopy Light',
      category: 'Landscape'
    },
    {
      id: 'g8',
      url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop',
      title: 'Dynamic Sprint',
      category: 'Sports'
    }
  ],
  testimonials: [
    {
      id: 't1',
      rating: 5,
      text: 'Muthu has a rare ability to capture not just what a moment looks like, but what it feels like. Our wedding album is a masterpiece that we will cherish for generations.',
      author: 'Aarav & Riya',
      role: 'Wedding Clients',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 't2',
      rating: 5,
      text: 'Working with Muthukumaran on our brand campaign was an absolute pleasure. He understood the brief perfectly and delivered visuals that elevated our brand presence.',
      author: 'Vikram Mehta',
      role: 'Creative Director, V-Mode',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: 't3',
      rating: 5,
      text: 'His fine-art landscape prints transformed our hotel lobby. The attention to detail, lighting, and composition is breathtaking. Highly professional service.',
      author: 'Samantha Ross',
      role: 'Interiors Director, Horizon Hotels',
      img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop'
    }
  ],
  contact: {
    email: 'muthu@visualstoryteller.com',
    phone: '+91 98765 43210',
    address: 'Studio 45, Golden Beach Road, ECR, Chennai, India',
    instagram: 'https://www.instagram.com/surreal7mmlens?stkn=ajA0M3YyYXpnbHRl',
    twitter: 'https://twitter.com/muthuvisuals',
    facebook: 'https://facebook.com/muthuvisuals'
  }
};

/**
 * Reads portfolio data with resilient multi-tier fallback:
 * 1. Checks Supabase cloud database
 * 2. Fallbacks to localStorage cache
 * 3. Fallbacks to defaultData if initial run
 */
export const getPortfolioData = async () => {
  let localData = null;
  try {
    const localStr = localStorage.getItem('muthu_portfolio_db');
    if (localStr) {
      localData = JSON.parse(localStr);
      // Migrate stale profile photo and instagram link from older versions without losing gallery
      if (localData) {
        let changed = false;
        if (!localData.version || localData.version < 2) {
          localData.version = 2;
          changed = true;
        }
        if (!localData.about?.profilePhoto || localData.about.profilePhoto.includes('unsplash.com')) {
          localData.about = { ...(localData.about || {}), profilePhoto: '/profile.jpg' };
          changed = true;
        }
        if (!localData.contact?.instagram || localData.contact.instagram.includes('muthu.visuals')) {
          localData.contact = { ...(localData.contact || {}), instagram: 'https://www.instagram.com/surreal7mmlens?stkn=ajA0M3YyYXpnbHRl' };
          changed = true;
        }
        if (changed) {
          try {
            localStorage.setItem('muthu_portfolio_db', JSON.stringify(localData));
          } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.warn('Could not read from local storage:', err);
  }

  if (supabase) {
    try {
      const { data: dbData, error } = await supabase
        .from('portfolio_settings')
        .select('*')
        .eq('id', 'main_settings')
        .maybeSingle();

      if (!error && dbData && Array.isArray(dbData.gallery)) {
        // Sanitize stale cloud data if needed
        if (dbData.about?.profilePhoto?.includes('unsplash.com')) {
          dbData.about.profilePhoto = '/profile.jpg';
        }
        if (dbData.contact?.instagram?.includes('muthu.visuals')) {
          dbData.contact.instagram = 'https://www.instagram.com/surreal7mmlens?stkn=ajA0M3YyYXpnbHRl';
        }

        // Auto-sync: If user previously uploaded custom photos locally that aren't in Supabase yet, push them to Supabase!
        let syncedGallery = [...dbData.gallery];
        if (localData && Array.isArray(localData.gallery)) {
          const cloudIds = new Set(syncedGallery.map(p => p.id));
          const localCustom = localData.gallery.filter(p => !cloudIds.has(p.id) && (String(p.id).startsWith('g_') || String(p.url).startsWith('data:')));
          if (localCustom.length > 0) {
            syncedGallery = [...localCustom, ...syncedGallery];
            supabase.from('portfolio_settings').upsert({
              ...dbData,
              gallery: syncedGallery,
              adminpassword: dbData.adminpassword || dbData.adminPassword || 'Kumar@10',
              updated_at: new Date().toISOString()
            }).then(() => {}).catch(() => {});
          }
        }

        const merged = {
          ...defaultData,
          ...dbData,
          gallery: syncedGallery,
          adminPassword: dbData.adminPassword || dbData.adminpassword || localData?.adminPassword || defaultData.adminPassword
        };
        // Keep localStorage in sync with cloud
        try {
          localStorage.setItem('muthu_portfolio_db', JSON.stringify(merged));
        } catch (e) {}
        return merged;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage cache:', err);
    }
  }

  // Fallback to local storage if available
  if (localData && Array.isArray(localData.gallery) && localData.gallery.length > 0) {
    return {
      ...defaultData,
      ...localData,
      adminPassword: localData.adminPassword || defaultData.adminPassword
    };
  }

  // First time initialization
  try {
    localStorage.setItem('muthu_portfolio_db', JSON.stringify(defaultData));
    savePortfolioData(defaultData).catch(() => {});
  } catch (e) {}

  return defaultData;
};

/**
 * Saves portfolio data to localStorage and Supabase simultaneously,
 * and notifies any active listeners via window event.
 */
export const savePortfolioData = async (data) => {
  const payload = {
    ...defaultData,
    ...data,
    updated_at: new Date().toISOString()
  };

  // 1. Immediately persist to localStorage for instant local responsiveness
  try {
    localStorage.setItem('muthu_portfolio_db', JSON.stringify(payload));
  } catch (err) {
    console.warn('localStorage write warning (could be quota exceeded):', err);
  }

  // 2. Broadcast local update event so open tabs/components re-render immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('portfolio_data_updated', { detail: payload }));
  }

  // 3. Persist to Supabase cloud if configured
  if (supabase) {
    try {
      const { error } = await supabase
        .from('portfolio_settings')
        .upsert({
          id: 'main_settings',
          hero: payload.hero,
          stats: payload.stats,
          about: payload.about,
          services: payload.services,
          gallery: payload.gallery,
          testimonials: payload.testimonials,
          contact: payload.contact,
          adminpassword: payload.adminPassword,
          updated_at: payload.updated_at
        });

      if (error) {
        console.warn('Supabase portfolio_settings sync notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase cloud write failed:', err);
    }
  }

  return payload;
};

/**
 * Fetches contact inquiries from Supabase or localStorage fallback
 */
export const getLeads = async () => {
  if (supabase) {
    try {
      const { data: leads, error } = await supabase
        .from('portfolio_leads')
        .select('*')
        .order('date', { ascending: false });

      if (!error && leads) {
        // Sync to local
        try {
          localStorage.setItem('muthu_portfolio_leads', JSON.stringify(leads));
        } catch (e) {}
        return leads;
      }
    } catch (err) {
      console.warn('Supabase leads read failed, falling back to local storage');
    }
  }

  try {
    const local = localStorage.getItem('muthu_portfolio_leads');
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {}

  return [];
};

/**
 * Adds a new contact inquiry to both localStorage and Supabase
 */
export const addLead = async (lead) => {
  // 1. Save to local storage first
  try {
    const local = localStorage.getItem('muthu_portfolio_leads');
    const list = local ? JSON.parse(local) : [];
    const updated = [lead, ...list];
    localStorage.setItem('muthu_portfolio_leads', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('portfolio_leads_updated', { detail: updated }));
    }
  } catch (err) {
    console.warn('Error saving lead locally:', err);
  }

  // 2. Save to Supabase if configured
  if (supabase) {
    try {
      const { error } = await supabase
        .from('portfolio_leads')
        .insert([lead]);
      if (error) {
        console.warn('Supabase portfolio_leads insert notice:', error.message);
      }
    } catch (err) {
      console.warn('Failed to add lead to Supabase cloud:', err);
    }
  }

  return lead;
};

/**
 * Deletes a lead inquiry by id
 */
export const deleteLead = async (id) => {
  try {
    const local = localStorage.getItem('muthu_portfolio_leads');
    if (local) {
      const list = JSON.parse(local);
      const filtered = list.filter(l => l.id !== id);
      localStorage.setItem('muthu_portfolio_leads', JSON.stringify(filtered));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('portfolio_leads_updated', { detail: filtered }));
      }
    }
  } catch (err) {}

  if (supabase) {
    try {
      const { error } = await supabase
        .from('portfolio_leads')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.warn('Failed to delete lead in Supabase:', err);
    }
  }
};

/**
 * Utility: Compresses uploaded image via Canvas to prevent large base64 strings
 * that blow localStorage limits or slow down page loads.
 */
export const compressImage = (file, maxWidth = 1400, maxHeight = 1400, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
