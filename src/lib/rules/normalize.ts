import {
  createCharacter,
  createCreature,
  emptyStats,
  newId,
  SCHEMA_VERSION,
  STATS,
  type Character,
  type Creature,
  type Resource,
  type Skill,
  type StatKey,
  type Stats,
  type TempBonus,
} from '../model/character'
import { isRace } from './identity'
import { normalizeCost } from './lists'
import { clampInt, LIMITS } from './numbers'

/**
 * Remet d'aplomb un personnage lu en base ou importé depuis un fichier : champs manquants complétés,
 * valeurs hors bornes ramenées dans les bornes, champs inconnus ignorés. Ne lève jamais d'exception.
 * Les `warnings` décrivent en français ce qui a été corrigé.
 *
 * Évolution du format : quand SCHEMA_VERSION augmente, ajouter ici la conversion depuis l'ancienne version.
 */
export function normalizeCharacter(raw: unknown): { character: Character; warnings: string[] } {
  const w: string[] = []
  const r = obj(raw)
  const c = createCharacter('')
  if (!raw || typeof raw !== 'object') w.push('données illisibles, personnage vierge créé')

  const version = typeof r.schemaVersion === 'number' ? r.schemaVersion : 0
  if (version > SCHEMA_VERSION) w.push(`fiche créée par une version plus récente de l'app (format ${version})`)

  c.id = typeof r.id === 'string' && r.id ? r.id : newId()
  c.createdAt = date(r.createdAt) ?? c.createdAt
  c.updatedAt = date(r.updatedAt) ?? c.updatedAt
  c.nom = str(r.nom, LIMITS.textShort)
  c.titre = str(r.titre, LIMITS.textShort)
  c.age = str(r.age, 40)
  if (isRace(r.race)) c.race = r.race
  else if (r.race) w.push(`race inconnue « ${String(r.race)} » ignorée`)
  c.element = str(r.element, 80)
  c.pratiques = dedupe(arr(r.pratiques).map(p => str(p, LIMITS.textShort).trim()).filter(Boolean))
  c.stats = stats(r.stats, w, '')
  c.bonusTemporaires = bonuses(r.bonusTemporaires)
  const res = obj(r.ressources)
  c.ressources = {
    vie: resource(res.vie, 'Vie', w, ''),
    ame: resource(res.ame, 'Âme', w, ''),
    mana: resource(res.mana, 'Mana', w, ''),
  }
  c.xp = clampInt(num(r.xp, 0), 0, LIMITS.xpMax)
  c.equipement = str(r.equipement, LIMITS.textLong)
  c.inventaire = str(r.inventaire, LIMITS.textLong)
  c.competences = skills(r.competences)
  c.creatures = arr(r.creatures).map(x => creature(x, w))
  c.schemaVersion = SCHEMA_VERSION
  return { character: c, warnings: w }
}

function creature(raw: unknown, w: string[]): Creature {
  const r = obj(raw)
  const cr = createCreature(str(r.nom, LIMITS.textShort))
  const who = `créature « ${cr.nom || 'sans nom'} » : `
  cr.id = typeof r.id === 'string' && r.id ? r.id : newId()
  cr.race = str(r.race, LIMITS.textShort)
  cr.type = str(r.type, LIMITS.textShort)
  cr.stats = stats(r.stats, w, who)
  cr.bonusTemporaires = bonuses(r.bonusTemporaires)
  const res = obj(r.ressources)
  cr.ressources = { vie: resource(res.vie, 'Vie', w, who), pp: resource(res.pp, 'PP', w, who) }
  cr.equipement = str(r.equipement, LIMITS.textLong)
  cr.inventaire = str(r.inventaire, LIMITS.textLong)
  cr.competences = skills(r.competences)
  return cr
}

function stats(raw: unknown, w: string[], who: string): Stats {
  const r = obj(raw)
  const s = emptyStats()
  for (const [k, label] of STATS) {
    const st = obj(r[k])
    const v = clampInt(num(st.valeur, 1), 0, LIMITS.statMax)
    if (st.valeur !== undefined && st.valeur !== v) w.push(`${who}${label} « ${String(st.valeur)} » ramenée à ${v}`)
    s[k] = { valeur: v, avantages: clampInt(num(st.avantages, 0), LIMITS.avantagesMin, LIMITS.avantagesMax) }
  }
  return s
}

function bonuses(raw: unknown): TempBonus[] {
  const keys = STATS.map(([k]) => k) as string[]
  return arr(raw)
    .map(obj)
    .filter(b => keys.includes(b.carac as string))
    .map(b => ({
      id: typeof b.id === 'string' && b.id ? b.id : newId(),
      carac: b.carac as StatKey,
      valeur: clampInt(num(b.valeur, 0), LIMITS.bonusMin, LIMITS.bonusMax),
      origine: str(b.origine, LIMITS.textShort),
    }))
    .filter(b => b.valeur !== 0)
}

function resource(raw: unknown, label: string, w: string[], who: string): Resource {
  const r = obj(raw)
  const max = clampInt(num(r.max, 0), 0, LIMITS.resourceMax)
  const cur0 = clampInt(num(r.cur, max), 0, LIMITS.resourceMax)
  const cur = Math.min(cur0, max)
  if (cur !== cur0) w.push(`${who}${label} actuelle (${cur0}) ramenée au maximum (${max})`)
  return { cur, max, regeneration: str(r.regeneration, LIMITS.textShort) }
}

function skills(raw: unknown): Skill[] {
  return arr(raw)
    .map(obj)
    .map(s => ({
      id: typeof s.id === 'string' && s.id ? s.id : newId(),
      titre: str(s.titre, LIMITS.textShort),
      cout: normalizeCost(typeof s.cout === 'number' ? s.cout : null),
      description: str(s.description, LIMITS.textLong),
    }))
}

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '')
const num = (v: unknown, def: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : def)
const date = (v: unknown): string | null => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : null)
const dedupe = (list: string[]): string[] =>
  list.filter((p, i) => list.findIndex(q => q.toLocaleLowerCase('fr') === p.toLocaleLowerCase('fr')) === i)
