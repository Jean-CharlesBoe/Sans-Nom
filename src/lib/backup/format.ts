import { newId, type Character, type CharacterSummary } from '../model/character'
import { normalizeCharacter } from '../rules/normalize'

/** Fichier de sauvegarde : un ou plusieurs personnages complets (avec leurs créatures). */
export const BACKUP_FORMAT = 'sansnom-sauvegarde'
export const BACKUP_VERSION = 1

export interface BackupFile {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: string
  appVersion: string
  characters: Character[]
}

export function buildBackup(characters: Character[], appVersion: string, now = new Date()): BackupFile {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now.toISOString(), appVersion, characters }
}

export function backupFileName(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `sansnom-sauvegarde-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`
}

/**
 * Lit un fichier de sauvegarde. Lève une Error au message lisible si le fichier n'en est pas un.
 * Chaque personnage passe par normalizeCharacter ; `warnings` regroupe les corrections faites.
 */
export function parseBackup(text: string): { characters: Character[]; warnings: string[] } {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error("Ce fichier n'est pas une sauvegarde Sans Nom (contenu illisible).")
  }
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  if (r.format !== BACKUP_FORMAT || !Array.isArray(r.characters)) {
    throw new Error("Ce fichier n'est pas une sauvegarde Sans Nom.")
  }
  if (typeof r.version === 'number' && r.version > BACKUP_VERSION) {
    throw new Error("Cette sauvegarde vient d'une version plus récente de l'app : mets l'app à jour avant de l'importer.")
  }
  const warnings: string[] = []
  const characters = r.characters.map(c => {
    const n = normalizeCharacter(c)
    const who = n.character.nom || 'sans nom'
    warnings.push(...n.warnings.map(w => `${who} : ${w}`))
    return n.character
  })
  if (characters.length === 0) throw new Error('Cette sauvegarde ne contient aucun personnage.')
  return { characters, warnings }
}

/** Copie importée à côté d'un personnage existant : nouvel identifiant, nom suffixé. */
export function asCopy(c: Character): Character {
  return { ...c, id: newId(), nom: `${c.nom} (copie)`.slice(0, 120) }
}

/** Rappel affiché à l'accueil. */
export function backupStatus(
  lastBackupAt: string | null,
  characters: CharacterSummary[],
  now = new Date(),
): { warn: boolean; text: string } {
  if (characters.length === 0) return { warn: false, text: '' }
  if (!lastBackupAt) return { warn: true, text: 'Aucune sauvegarde pour l’instant.' }
  const last = new Date(lastBackupAt)
  const days = Math.floor((startOfDay(now) - startOfDay(last)) / 86_400_000)
  const when = days <= 0 ? "aujourd'hui" : days === 1 ? 'hier' : `il y a ${days} jours`
  const changedSince = characters.some(c => c.updatedAt > lastBackupAt)
  return { warn: changedSince && days >= 7, text: `Dernière sauvegarde : ${when}.` }
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
