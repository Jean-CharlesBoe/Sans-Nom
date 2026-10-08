import { createCreature, newId, type Character, type Creature, type Skill } from '../model/character'
import { clampInt, LIMITS } from './numbers'

/** Déplace l'élément d'index `from` de `delta` positions (−1 = monter). Renvoie false hors limites. */
export function moveItem<T>(list: T[], from: number, delta: number): boolean {
  const to = from + delta
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return false
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
  return true
}

export function removeById<T extends { id: string }>(list: T[], id: string): void {
  const i = list.findIndex(x => x.id === id)
  if (i >= 0) list.splice(i, 1)
}

/** Coût en mana (personnage) ou en PP (créature). Vide ou invalide = pas de coût. */
export function normalizeCost(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  return clampInt(value, 0, LIMITS.costMax)
}

export function addSkill(owner: { competences: Skill[] }, titre = ''): Skill {
  const skill: Skill = { id: newId(), titre: titre.slice(0, LIMITS.textShort), cout: null, description: '' }
  owner.competences.push(skill)
  return skill
}

export function updateSkill(skill: Skill, patch: Partial<Omit<Skill, 'id'>>): void {
  if (patch.titre !== undefined) skill.titre = patch.titre.slice(0, LIMITS.textShort)
  if (patch.description !== undefined) skill.description = patch.description.slice(0, LIMITS.textLong)
  if ('cout' in patch) skill.cout = normalizeCost(patch.cout)
}

export function addCreature(c: Character, nom: string): Creature {
  const creature = createCreature(nom.trim().slice(0, LIMITS.textShort))
  c.creatures.push(creature)
  return creature
}
