import type { Character, CharacterSummary } from '../model/character'
import type { CharacterRepository } from './repository'

// Stockage de développement uniquement (navigateur du PC) : sur téléphone, c'est SQLite.
const KEY = 'sansnom:dev:characters'

function readAll(): Record<string, Character> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeAll(all: Record<string, Character>): void {
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function createWebRepository(): CharacterRepository {
  return {
    async list(): Promise<CharacterSummary[]> {
      return Object.values(readAll())
        .map(c => ({ id: c.id, nom: c.nom, updatedAt: c.updatedAt }))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
    async get(id) {
      return readAll()[id] ?? null
    },
    async save(c) {
      const all = readAll()
      all[c.id] = JSON.parse(JSON.stringify(c))
      writeAll(all)
    },
    async remove(id) {
      const all = readAll()
      delete all[id]
      writeAll(all)
    },
  }
}
