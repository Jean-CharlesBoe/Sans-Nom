import { describe, expect, it } from 'vitest'
import { createCharacter } from '../model/character'
import { moveItem, removeById } from './lists'
import { normalizeCharacter } from './normalize'
import {
  addLoreSection,
  addSession,
  formatSessionDate,
  isIsoDate,
  sessionsByDate,
  todayIso,
  updateLoreSection,
  updateSession,
} from './notebook'

const PNG = 'data:image/png;base64,iVBORw0KGgo='
const JPG = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='

describe('Lore', () => {
  it('ajoute, modifie, réordonne et supprime des sections', () => {
    const c = createCharacter('Aldric')
    const a = addLoreSection(c, 'Origines')
    const b = addLoreSection(c, 'Famille')
    updateLoreSection(a, { texte: 'Né à Varhal.\nLa foudre frappa sept fois.' })
    expect(a.texte).toContain('\n')
    expect(moveItem(c.lore, 1, -1)).toBe(true)
    expect(c.lore.map(s => s.titre)).toEqual(['Famille', 'Origines'])
    removeById(c.lore, b.id)
    expect(c.lore.map(s => s.titre)).toEqual(['Origines'])
  })
})

describe('Histoire', () => {
  it('crée une séance datée du jour', () => {
    const c = createCharacter('Aldric')
    expect(addSession(c).date).toBe(todayIso())
  })

  it('trie les séances de la plus récente à la plus ancienne', () => {
    const c = createCharacter('Aldric')
    const s1 = addSession(c, '2026-08-31')
    const s2 = addSession(c, '2026-10-12')
    const s3 = addSession(c, '2026-09-14')
    const s4 = addSession(c, '2026-10-12')
    expect(sessionsByDate(c.histoire).map(s => s.id)).toEqual([s4.id, s2.id, s3.id, s1.id])
    expect(c.histoire[0]).toBe(s1) // l'ordre stocké n'est pas modifié
  })

  it('refuse une date invalide', () => {
    const c = createCharacter('Aldric')
    const s = addSession(c, '2026-10-12')
    updateSession(s, { date: '2026-02-30' })
    expect(s.date).toBe('2026-10-12')
    updateSession(s, { date: '2026-11-02', titre: 'Le marché noir' })
    expect(s).toMatchObject({ date: '2026-11-02', titre: 'Le marché noir' })
    expect(isIsoDate('12/10/2026')).toBe(false)
  })

  it('affiche la date en français', () => {
    expect(formatSessionDate('2026-10-12')).toBe('12 oct. 2026')
  })
})

describe('normalizeCharacter (format v2)', () => {
  it('charge une fiche v1 sans photo, Lore ni Histoire', () => {
    const v1 = JSON.parse(JSON.stringify(createCharacter('Eloy')))
    delete v1.photo
    delete v1.lore
    delete v1.histoire
    v1.schemaVersion = 1
    const { character, warnings } = normalizeCharacter(v1)
    expect(warnings).toEqual([])
    expect(character).toMatchObject({ schemaVersion: 2, photo: null, lore: [], histoire: [] })
  })

  it('garde une photo valide et ignore une photo invalide', () => {
    const c = createCharacter('Aldric')
    c.photo = { image: JPG, miniature: PNG }
    const ok = normalizeCharacter(JSON.parse(JSON.stringify(c)))
    expect(ok.character.photo).toEqual({ image: JPG, miniature: PNG })

    const bad = normalizeCharacter({ ...c, photo: { image: 'javascript:alert(1)', miniature: PNG } })
    expect(bad.character.photo).toBeNull()
    expect(bad.warnings[0]).toMatch(/photo/)
  })

  it('remplace une date de séance invalide et le signale', () => {
    const { character, warnings } = normalizeCharacter({
      ...createCharacter('Aldric'),
      histoire: [{ date: 'hier', titre: 'Embuscade', texte: '…' }],
    })
    expect(character.histoire[0].date).toBe(todayIso())
    expect(warnings[0]).toMatch(/Embuscade/)
  })
})
