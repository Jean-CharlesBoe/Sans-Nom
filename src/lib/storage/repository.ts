import { Capacitor } from '@capacitor/core'
import type { Character, CharacterSummary } from '../model/character'

/**
 * Accès aux personnages. L'interface ne parle qu'à ce contrat, jamais à SQLite directement (D5).
 */
export interface CharacterRepository {
  list(): Promise<CharacterSummary[]>
  get(id: string): Promise<Character | null>
  save(character: Character): Promise<void>
  remove(id: string): Promise<void>
}

let instance: Promise<CharacterRepository> | null = null

/** SQLite sur Android ; stockage du navigateur en développement web (`npm run dev`). */
export function getRepository(): Promise<CharacterRepository> {
  instance ??= Capacitor.isNativePlatform()
    ? import('./sqliteRepository').then(m => m.openSqliteRepository())
    : import('./webRepository').then(m => m.createWebRepository())
  return instance
}
