import type { Character } from '../model/character'
import { clampInt, LIMITS } from './numbers'

/** Rappel affiché sous le compteur. La dépense reste manuelle (le joueur ajuste lui-même caracs et maximums). */
export const XP_RULE = '1 XP = +1 sur une carac, ou +2 au maximum d’une ressource'

export function setXp(c: Character, value: number): number {
  c.xp = clampInt(value, 0, LIMITS.xpMax)
  return c.xp
}

export function adjustXp(c: Character, delta: number): number {
  return setXp(c, c.xp + delta)
}
