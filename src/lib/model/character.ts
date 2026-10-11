// Modèle de données d'un personnage (voir docs/CAHIER_DES_CHARGES.md §5).
// Un personnage, avec ses créatures, est stocké comme un seul document JSON.

// v2 : photo, lore, histoire
export const SCHEMA_VERSION = 2

export const STATS = [
  ['robustesse', 'Robustesse'],
  ['adresse', 'Adresse'],
  ['finesse', 'Finesse'],
  ['intellect', 'Intellect'],
  ['volonte', 'Volonté'],
  ['savoirfaire', 'Savoir-faire'],
  ['expression', 'Expression'],
  ['perception', 'Perception'],
] as const

export type StatKey = (typeof STATS)[number][0]

export const RACES = [
  'Humain',
  'Elfe',
  'Cendré',
  'Huwa',
  'Siranel',
  'Élémentalien',
  'Béli-in',
  'Dulfling',
  'Nain',
] as const

export type Race = (typeof RACES)[number]

export const PRATIQUES = [
  'Pyromancie',
  'Aquamancie',
  'Magie',
  'Sorcellerie',
  'Druidisme',
  'Shamanisme',
  'Spiritisme',
  'Canalisme',
] as const

export interface Stat {
  valeur: number
  /** Positif : nombre de relances. Négatif : désavantages. */
  avantages: number
}

export type Stats = Record<StatKey, Stat>

export interface TempBonus {
  id: string
  carac: StatKey
  valeur: number
  origine: string
}

export interface Resource {
  cur: number
  max: number
  regeneration: string
}

export interface Skill {
  id: string
  titre: string
  /** Mana pour un personnage, PP pour une créature. Absent = pas de coût. */
  cout: number | null
  description: string
}

/** Photo recadrée en carré (JPEG en data URL) et sa miniature pour les listes. */
export interface Photo {
  image: string
  miniature: string
}

/** Section du Lore (Origines, Famille…). */
export interface LoreSection {
  id: string
  titre: string
  texte: string
}

/** Entrée de l'Histoire : une séance de jeu. */
export interface SessionEntry {
  id: string
  /** AAAA-MM-JJ */
  date: string
  titre: string
  texte: string
}

export interface Creature {
  id: string
  nom: string
  race: string
  type: string
  photo: Photo | null
  stats: Stats
  bonusTemporaires: TempBonus[]
  ressources: { vie: Resource; pp: Resource }
  equipement: string
  inventaire: string
  competences: Skill[]
}

export interface Character {
  id: string
  schemaVersion: number
  createdAt: string
  updatedAt: string
  nom: string
  titre: string
  age: string
  race: Race | ''
  element: string
  pratiques: string[]
  stats: Stats
  bonusTemporaires: TempBonus[]
  ressources: { vie: Resource; ame: Resource; mana: Resource }
  xp: number
  equipement: string
  inventaire: string
  competences: Skill[]
  creatures: Creature[]
  photo: Photo | null
  lore: LoreSection[]
  histoire: SessionEntry[]
}

/** Résumé affiché dans la liste d'accueil. */
export interface CharacterSummary {
  id: string
  nom: string
  updatedAt: string
  /** Miniature de la photo (data URL), ou null. */
  thumb: string | null
}

export function newId(): string {
  return crypto.randomUUID()
}

export function emptyStats(): Stats {
  return Object.fromEntries(STATS.map(([k]) => [k, { valeur: 1, avantages: 0 }])) as Stats
}

const resource = (max = 0): Resource => ({ cur: max, max, regeneration: '' })

export function createCharacter(nom: string): Character {
  const now = new Date().toISOString()
  return {
    id: newId(),
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    nom,
    titre: '',
    age: '',
    race: '',
    element: '',
    pratiques: [],
    stats: emptyStats(),
    bonusTemporaires: [],
    ressources: { vie: resource(), ame: resource(100), mana: resource() },
    xp: 0,
    equipement: '',
    inventaire: '',
    competences: [],
    creatures: [],
    photo: null,
    lore: [],
    histoire: [],
  }
}

export function createCreature(nom: string): Creature {
  return {
    id: newId(),
    nom,
    race: '',
    type: '',
    photo: null,
    stats: emptyStats(),
    bonusTemporaires: [],
    ressources: { vie: resource(), pp: resource() },
    equipement: '',
    inventaire: '',
    competences: [],
  }
}
