/**
 * SARO MOTORS & SERVICES - Inventory Central Data Layer with Supabase Cloud Sync
 */

const SUPABASE_CONFIG = {
  url: 'https://iooiaxsqsubozywzdehl.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvb2lheHNxc3Vib3p5d3pkZWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMjY1MzUsImV4cCI6MjEwNzYwMjUzNX0.9nqscpElmhgIBaq-413tGPFyCHKWvY1s_60RuS16taM',
  bucket: 'motos-imagenes'
};

const DEFAULT_INVENTORY = [
  {
    id: "moto-1",
    title: "VENTO HYPER SPORT 300",
    category: "naked",
    meta: "300 CC • SEMINUEVA",
    km: "1,850 km",
    year: "2024",
    engine: "4T Monocilíndrico",
    badge: "MAXIKASH FINANCIABLE",
    status: "disponible",
    finance_title: "Financiada con MAXIKASH",
    finance_subtitle: "Pagos semanales disponibles",
    image: "assets/images/1.png",
    whatsapp_text: "Hola, me interesa la Vento Hyper Sport 300"
  },
  {
    id: "moto-2",
    title: "BAJAJ DOMINAR 400 ABS",
    category: "naked",
    meta: "400 CC • TOURING NAKED",
    km: "3,200 km",
    year: "2023",
    engine: "DOHC FI Líquido",
    badge: "MAXIKASH FINANCIABLE",
    status: "disponible",
    finance_title: "Financiada con MAXIKASH",
    finance_subtitle: "Enganche mínimo",
    image: "assets/images/2.png",
    whatsapp_text: "Hola, me interesa la Bajaj Dominar 400"
  },
  {
    id: "moto-3",
    title: "TRK 502 ADVENTURE EDITION",
    category: "adventure",
    meta: "500 CC • ADVENTURE TRAIL",
    km: "4,100 km",
    year: "2023",
    engine: "Bicilíndrico EFI",
    badge: "MAXIKASH FINANCIABLE",
    status: "disponible",
    finance_title: "Financiada con MAXIKASH",
    finance_subtitle: "Aprobación rápida",
    image: "assets/images/3.png",
    whatsapp_text: "Hola, me interesa la TRK 502 Adventure"
  },
  {
    id: "moto-4",
    title: "VENTO GTS 300 CROSS",
    category: "adventure",
    meta: "300 CC • ENDURO / TRAIL",
    km: "950 km",
    year: "2024",
    engine: "4T Monocilíndrico HP",
    badge: "MAXIKASH FINANCIABLE",
    status: "disponible",
    finance_title: "Financiada con MAXIKASH",
    finance_subtitle: "Mínimo enganche",
    image: "assets/images/4.png",
    whatsapp_text: "Hola, me interesa la Vento GTS 300 Cross"
  },
  {
    id: "moto-5",
    title: "CFMOTO 675 NK HYPER EDITION",
    category: "naked",
    meta: "675 CC • TRIPLE SPORT NAKED",
    km: "2,100 km",
    year: "2024",
    engine: "Tricilíndrico DOHC EFI",
    badge: "MAXIKASH FINANCIABLE",
    status: "disponible",
    finance_title: "Financiada con MAXIKASH",
    finance_subtitle: "Entrega inmediata",
    image: "assets/images/5.webp",
    whatsapp_text: "Hola, me interesa la CFMOTO 675 NK"
  }
];

const STORAGE_KEY = 'saro_motors_inventory_v1';

// Inicializar cliente de Supabase
let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
    } catch (e) {
      console.warn('Error inicializando Supabase:', e);
    }
  }
  return supabaseClient;
}

class InventoryManager {
  // Obtener inventario desde LocalStorage (sincrónico para render inicial instantáneo)
  static getInventory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    this.saveLocalStorage(DEFAULT_INVENTORY);
    return DEFAULT_INVENTORY;
  }

  static saveLocalStorage(bikes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bikes));
      window.dispatchEvent(new CustomEvent('saro_inventory_changed', { detail: bikes }));
      return true;
    } catch (e) {
      console.error('Error saving local storage:', e);
      return false;
    }
  }

  // Carga remota asíncrona desde Supabase
  static async fetchCloudInventory() {
    const sb = getSupabase();
    if (!sb) return this.getInventory();

    try {
      const { data, error } = await sb
        .from('motos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error:', error);
        return this.getInventory();
      }

      if (data && data.length > 0) {
        // Normalizar propiedades
        const mapped = data.map(item => ({
          ...item,
          financeTitle: item.finance_title || item.financeTitle,
          financeSubtitle: item.finance_subtitle || item.financeSubtitle,
          whatsappText: item.whatsapp_text || item.whatsappText
        }));
        this.saveLocalStorage(mapped);
        return mapped;
      } else {
        // Si la tabla en Supabase está vacía, sembrar las 5 motos por defecto
        console.log('Sembrando catálogo inicial en Supabase...');
        await this.seedDefaultsToCloud();
        return this.getInventory();
      }
    } catch (err) {
      console.error('Error fetching from Supabase:', err);
      return this.getInventory();
    }
  }

  static async seedDefaultsToCloud() {
    const sb = getSupabase();
    if (!sb) return;

    try {
      const payload = DEFAULT_INVENTORY.map(b => ({
        id: b.id,
        title: b.title,
        category: b.category,
        meta: b.meta,
        km: b.km,
        year: b.year,
        engine: b.engine,
        badge: b.badge,
        status: b.status,
        finance_title: b.finance_title,
        finance_subtitle: b.finance_subtitle,
        image: b.image,
        whatsapp_text: b.whatsapp_text
      }));
      await sb.from('motos').upsert(payload);
    } catch (e) {
      console.warn('Seed error:', e);
    }
  }

  // Subir imagen a Supabase Storage
  static async uploadImage(file) {
    const sb = getSupabase();
    if (!sb || !file) return null;

    try {
      const ext = file.name.split('.').pop();
      const fileName = `moto_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      
      const { data, error } = await sb.storage
        .from(SUPABASE_CONFIG.bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.warn('Error subiendo imagen a Supabase Storage:', error);
        return null;
      }

      const { data: publicData } = sb.storage
        .from(SUPABASE_CONFIG.bucket)
        .getPublicUrl(fileName);

      return publicData ? publicData.publicUrl : null;
    } catch (err) {
      console.error('Upload exception:', err);
      return null;
    }
  }

  // Agregar nueva moto
  static async addBike(bike) {
    if (!bike.id) {
      bike.id = 'moto-' + Date.now();
    }

    const payload = {
      id: bike.id,
      title: bike.title,
      category: bike.category || 'naked',
      meta: bike.meta || '',
      km: bike.km || '',
      year: bike.year || '',
      engine: bike.engine || '',
      badge: bike.badge || 'MAXIKASH FINANCIABLE',
      status: bike.status || 'disponible',
      finance_title: bike.financeTitle || bike.finance_title || 'Financiada con MAXIKASH',
      finance_subtitle: bike.financeSubtitle || bike.finance_subtitle || 'Pagos cómodos',
      image: bike.image || 'assets/images/1.png',
      whatsapp_text: bike.whatsappText || bike.whatsapp_text || `Hola, me interesa la ${bike.title}`
    };

    // 1. Guardar localmente
    const list = this.getInventory();
    list.unshift(bike);
    this.saveLocalStorage(list);

    // 2. Guardar en Supabase
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('motos').insert([payload]);
      } catch (e) {
        console.warn('Supabase add error:', e);
      }
    }

    return bike;
  }

  // Actualizar moto existente
  static async updateBike(id, updatedFields) {
    const list = this.getInventory();
    const index = list.findIndex(b => b.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.saveLocalStorage(list);
    }

    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          title: updatedFields.title,
          category: updatedFields.category,
          meta: updatedFields.meta,
          km: updatedFields.km,
          year: updatedFields.year,
          engine: updatedFields.engine,
          badge: updatedFields.badge,
          status: updatedFields.status,
          finance_title: updatedFields.financeTitle || updatedFields.finance_title,
          finance_subtitle: updatedFields.financeSubtitle || updatedFields.finance_subtitle,
          image: updatedFields.image,
          whatsapp_text: updatedFields.whatsappText || updatedFields.whatsapp_text
        };
        // Quitar campos undefined
        Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
        await sb.from('motos').update(payload).eq('id', id);
      } catch (e) {
        console.warn('Supabase update error:', e);
      }
    }

    return list[index] || null;
  }

  // Eliminar moto
  static async deleteBike(id) {
    let list = this.getInventory();
    list = list.filter(b => b.id !== id);
    this.saveLocalStorage(list);

    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('motos').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }

    return list;
  }

  // Alternar estado disponible / vendida
  static async toggleStatus(id) {
    const list = this.getInventory();
    const bike = list.find(b => b.id === id);
    if (bike) {
      const nextStatus = bike.status === 'vendida' ? 'disponible' : 'vendida';
      return await this.updateBike(id, { status: nextStatus });
    }
    return null;
  }

  // Restablecer valores de fábrica
  static async resetToDefaults() {
    this.saveLocalStorage(DEFAULT_INVENTORY);
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.from('motos').delete().neq('id', 'placeholder_never_match');
        await this.seedDefaultsToCloud();
      } catch (e) {
        console.warn('Supabase reset error:', e);
      }
    }
    return DEFAULT_INVENTORY;
  }

  static exportJSON() {
    return JSON.stringify(this.getInventory(), null, 2);
  }

  static importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.saveLocalStorage(parsed);
        return true;
      }
    } catch (e) {
      console.error('JSON Inválido:', e);
    }
    return false;
  }

  // Suscribirse a cambios en tiempo real desde cualquier dispositivo
  static subscribeRealtime(callback) {
    const sb = getSupabase();
    if (!sb) return;

    try {
      sb.channel('motos_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'motos' }, async () => {
          const fresh = await this.fetchCloudInventory();
          if (callback) callback(fresh);
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }
}

// Exponer globalmente
window.InventoryManager = InventoryManager;
window.DEFAULT_INVENTORY = DEFAULT_INVENTORY;
