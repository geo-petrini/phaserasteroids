const CATEGORY_DEFS = [
  { key: 'hull',       url: 'js/components/hull.json',       name: 'HULL',       color: 0xf0d060 },
  { key: 'generators', url: 'js/components/generators.json', name: 'GENERATOR',  color: 0x4488ff },
  { key: 'thrusters',  url: 'js/components/thrusters.json',  name: 'THRUSTERS',  color: 0xff6644 },
  { key: 'shields',    url: 'js/components/shields.json',    name: 'SHIELDS',    color: 0x44ffcc },
  { key: 'weapons',    url: 'js/components/weapons.json',    name: 'WEAPONS',    color: 0xffaa44 },
]

/**
 * ComponentRegistry — single source of truth for ship component definitions.
 * Loads JSON files via fetch() on boot then provides synchronous access.
 * The boot scene awaits registry.load() before transitioning to ShipConfigScene.
 */
class ComponentRegistry {
  constructor() {
    this.categories = []
    this.byId = new Map()
    this._ready = false
  }

  get ready() { return this._ready }

  async load() {
    for (const def of CATEGORY_DEFS) {
      const res = await fetch(def.url)
      const rawItems = await res.json()
      const items = rawItems.map(item => ({
        ...item,
        color: typeof item.color === 'string' ? Number(item.color) : item.color,
        particleColor: typeof item.particleColor === 'string' ? Number(item.particleColor) : item.particleColor,
      }))
      for (const item of items) this.byId.set(item.id, item)
      this.categories.push({ name: def.name, color: def.color, items })
    }
    this._ready = true
  }

  getItem(id) { return this.byId.get(id) || null }
  getCategory(index) { return this.categories[index] || null }

  /** Linear search fallback (for grid layout entries). */
  findItem(id) {
    for (const cat of this.categories) {
      for (const item of cat.items) if (item.id === id) return item
    }
    return null
  }
}

export const registry = new ComponentRegistry()
