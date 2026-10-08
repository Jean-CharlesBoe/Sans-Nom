import { PRATIQUES, RACES, type Character, type Race } from '../model/character'
import { LIMITS } from './numbers'

export const isRace = (v: unknown): v is Race => typeof v === 'string' && (RACES as readonly string[]).includes(v)

/** Le champ « élément lié » n'a de sens que pour un Élémentalien. */
export const needsElement = (c: Pick<Character, 'race'>): boolean => c.race === 'Élémentalien'

/**
 * Change la race. Les valeurs propres à l'ancienne race (élément, mana) ne sont pas effacées :
 * elles sont seulement masquées, pour qu'une erreur de sélection soit sans conséquence.
 */
export function setRace(c: Character, race: Race | ''): void {
  c.race = race
}

/** Accepte une pratique de la liste ou un nom libre. Refuse les doublons (sans tenir compte de la casse). */
export function addPratique(c: Character, name: string): boolean {
  const n = name.trim().slice(0, LIMITS.textShort)
  if (!n) return false
  if (c.pratiques.some(p => p.toLocaleLowerCase('fr') === n.toLocaleLowerCase('fr'))) return false
  const known = PRATIQUES.find(p => p.toLocaleLowerCase('fr') === n.toLocaleLowerCase('fr'))
  c.pratiques.push(known ?? n)
  return true
}

export function removePratique(c: Character, name: string): void {
  const i = c.pratiques.indexOf(name)
  if (i >= 0) c.pratiques.splice(i, 1)
}

/** Pratiques de la liste pas encore choisies (pour le sélecteur). */
export function availablePratiques(c: Character): string[] {
  return PRATIQUES.filter(p => !c.pratiques.includes(p))
}
