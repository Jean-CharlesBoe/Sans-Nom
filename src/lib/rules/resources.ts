import type { Character, Resource } from '../model/character'
import { clampInt, LIMITS } from './numbers'

/** Le max est saisi à la main ; l'actuel est ramené sous le nouveau max si besoin. */
export function setResourceMax(res: Resource, max: number): void {
  res.max = clampInt(max, 0, LIMITS.resourceMax)
  res.cur = Math.min(res.cur, res.max)
}

/** Une ressource reste toujours entre 0 et son max. */
export function setResourceCur(res: Resource, cur: number): number {
  res.cur = clampInt(cur, 0, res.max)
  return res.cur
}

/** Dépense (delta négatif) ou récupération (delta positif). */
export function adjustResource(res: Resource, delta: number): number {
  return setResourceCur(res, res.cur + delta)
}

export function setRegeneration(res: Resource, text: string): void {
  res.regeneration = text.trim().slice(0, LIMITS.textShort)
}

/** Un Nain ne peut pas avoir de mana : la ressource est masquée et non modifiable. */
export function hasMana(c: Pick<Character, 'race'>): boolean {
  return c.race !== 'Nain'
}
