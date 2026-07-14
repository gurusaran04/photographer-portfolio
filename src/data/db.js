import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fnglpkmehsxrlzubdtcl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jylyuRiPQwpAoeKzNGyWyA_Tq9Hcc15';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const defaultData = {
  hero: {
    eyebrow: 'Visual Storyteller',
    name: 'Muthukumaran',
    nameAccent: 'Photographer',
    tagline: 'Capturing the raw essence of human emotions, the sublime grandeur of natural landscapes, and the timeless magic of life\'s fleeting moments through an artistic lens.',
    ctaText: 'View Portfolio',
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
    profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
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
      url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop',
      title: 'Through the Looking Glass',
      category: 'Fine Art'
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
    instagram: 'https://instagram.com/muthu.visuals',
    twitter: 'https://twitter.com/muthuvisuals',
    facebook: 'https://facebook.com/muthuvisuals'
  }
};

export const getPortfolioData = async () => {
  try {
    const { data: dbData, error } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('id', 'main_settings')
      .single();

    if (error || !dbData) {
      // Seed first time
      await savePortfolioData(defaultData);
      return defaultData;
    }
    return dbData;
  } catch (err) {
    console.warn('Supabase read failed, falling back to local storage', err);
    const local = localStorage.getItem('muthu_portfolio_db');
    return local ? JSON.parse(local) : defaultData;
  }
};

export const savePortfolioData = async (data) => {
  try {
    localStorage.setItem('muthu_portfolio_db', JSON.stringify(data));
    const { error } = await supabase
      .from('portfolio_settings')
      .upsert({
        id: 'main_settings',
        hero: data.hero,
        stats: data.stats,
        about: data.about,
        services: data.services,
        gallery: data.gallery,
        testimonials: data.testimonials,
        contact: data.contact,
        updated_at: new Date().toISOString()
      });
    if (error) throw error;
  } catch (err) {
    console.error('Supabase write failed', err);
  }
};

export const getLeads = async () => {
  try {
    const { data: leads, error } = await supabase
      .from('portfolio_leads')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return leads || [];
  } catch (err) {
    console.warn('Supabase leads read failed, falling back to local storage');
    const local = localStorage.getItem('muthu_portfolio_db');
    const parsed = local ? JSON.parse(local) : { leads: [] };
    return parsed.leads || [];
  }
};

export const addLead = async (lead) => {
  try {
    // Save locally
    const local = localStorage.getItem('muthu_portfolio_db');
    const parsed = local ? JSON.parse(local) : { ...defaultData, leads: [] };
    parsed.leads = [...(parsed.leads || []), lead];
    localStorage.setItem('muthu_portfolio_db', JSON.stringify(parsed));

    // Save to Supabase
    const { error } = await supabase
      .from('portfolio_leads')
      .insert(lead);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to add lead to Supabase', err);
  }
};

export const deleteLead = async (id) => {
  try {
    // Delete locally
    const local = localStorage.getItem('muthu_portfolio_db');
    if (local) {
      const parsed = JSON.parse(local);
      parsed.leads = (parsed.leads || []).filter(l => l.id !== id);
      localStorage.setItem('muthu_portfolio_db', JSON.stringify(parsed));
    }

    // Delete in Supabase
    const { error } = await supabase
      .from('portfolio_leads')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('Failed to delete lead in Supabase', err);
  }
};
