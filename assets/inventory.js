/**
 * SARO MOTORS & SERVICES - Inventory Central Data Layer
 * Handles loading, saving, updating and cloud-ready sync for motorcycles
 */

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
    status: "disponible", // "disponible" | "vendida"
    financeTitle: "Financiada con MAXIKASH",
    financeSubtitle: "Pagos semanales disponibles",
    image: "assets/images/1.png",
    whatsappText: "Hola, me interesa la Vento Hyper Sport 300"
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
    financeTitle: "Financiada con MAXIKASH",
    financeSubtitle: "Enganche mínimo",
    image: "assets/images/2.png",
    whatsappText: "Hola, me interesa la Bajaj Dominar 400"
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
    financeTitle: "Financiada con MAXIKASH",
    financeSubtitle: "Aprobación rápida",
    image: "assets/images/3.png",
    whatsappText: "Hola, me interesa la TRK 502 Adventure"
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
    financeTitle: "Financiada con MAXIKASH",
    financeSubtitle: "Mínimo enganche",
    image: "assets/images/4.png",
    whatsappText: "Hola, me interesa la Vento GTS 300 Cross"
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
    financeTitle: "Financiada con MAXIKASH",
    financeSubtitle: "Entrega inmediata",
    image: "assets/images/5.webp",
    whatsappText: "Hola, me interesa la CFMOTO 675 NK"
  }
];

const STORAGE_KEY = 'saro_motors_inventory_v1';

class InventoryManager {
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
    // Si no hay datos previos, inicializar con el catálogo de fábrica
    this.saveInventory(DEFAULT_INVENTORY);
    return DEFAULT_INVENTORY;
  }

  static saveInventory(bikes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bikes));
      window.dispatchEvent(new CustomEvent('saro_inventory_changed', { detail: bikes }));
      return true;
    } catch (e) {
      console.error('Error saving inventory:', e);
      return false;
    }
  }

  static addBike(bike) {
    const list = this.getInventory();
    if (!bike.id) {
      bike.id = 'moto-' + Date.now();
    }
    list.unshift(bike); // Agregar al inicio para que aparezca primero
    this.saveInventory(list);
    return bike;
  }

  static updateBike(id, updatedFields) {
    const list = this.getInventory();
    const index = list.findIndex(b => b.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.saveInventory(list);
      return list[index];
    }
    return null;
  }

  static deleteBike(id) {
    let list = this.getInventory();
    list = list.filter(b => b.id !== id);
    this.saveInventory(list);
    return list;
  }

  static toggleStatus(id) {
    const list = this.getInventory();
    const bike = list.find(b => b.id === id);
    if (bike) {
      bike.status = bike.status === 'vendida' ? 'disponible' : 'vendida';
      this.saveInventory(list);
      return bike;
    }
    return null;
  }

  static resetToDefaults() {
    this.saveInventory(DEFAULT_INVENTORY);
    return DEFAULT_INVENTORY;
  }

  static exportJSON() {
    return JSON.stringify(this.getInventory(), null, 2);
  }

  static importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.saveInventory(parsed);
        return true;
      }
    } catch (e) {
      console.error('JSON Inválido:', e);
    }
    return false;
  }
}

// Exponer globalmente
window.InventoryManager = InventoryManager;
window.DEFAULT_INVENTORY = DEFAULT_INVENTORY;
