import { describe, expect, it } from 'vitest'
import { createCharacter } from '../model/character'
import { addCreature, addSkill } from '../rules/lists'
import { asCopy, backupFileName, backupStatus, buildBackup, parseBackup } from './format'

describe('sauvegarde', () => {
  it('fait un aller-retour sans perte', () => {
    const eloy = createCharacter('Eloy')
    addSkill(eloy, 'Voix de puissance')
    addCreature(eloy, 'Blob')
    const text = JSON.stringify(buildBackup([eloy, createCharacter('Norae')], '0.2.0'))
    const { characters, warnings } = parseBackup(text)
    expect(warnings).toEqual([])
    expect(characters[0]).toEqual(eloy)
    expect(characters).toHaveLength(2)
  })

  it('refuse un fichier qui n’est pas une sauvegarde', () => {
    expect(() => parseBackup('pas du json')).toThrow(/illisible/)
    expect(() => parseBackup('{"nom":"Eloy"}')).toThrow(/pas une sauvegarde/)
    expect(() => parseBackup(JSON.stringify({ ...buildBackup([], '1'), characters: [] }))).toThrow(/aucun/)
    expect(() => parseBackup(JSON.stringify({ ...buildBackup([createCharacter('A')], '9'), version: 99 }))).toThrow(
      /plus récente/,
    )
  })

  it('répare les personnages abîmés et le signale', () => {
    const bad = { ...createCharacter('Eloy'), ressources: { mana: { cur: 130, max: 110 } } }
    const { characters, warnings } = parseBackup(JSON.stringify(buildBackup([bad as never], '0.1.0')))
    expect(characters[0].ressources.mana.cur).toBe(110)
    expect(warnings[0]).toMatch(/^Eloy : /)
  })

  it('crée une copie avec un nouvel identifiant', () => {
    const c = createCharacter('Eloy')
    const copy = asCopy(c)
    expect(copy.id).not.toBe(c.id)
    expect(copy.nom).toBe('Eloy (copie)')
  })

  it('nomme le fichier avec la date', () => {
    expect(backupFileName(new Date(2026, 9, 8))).toBe('sansnom-sauvegarde-2026-10-08.json')
  })
})

describe('rappel de sauvegarde', () => {
  const now = new Date(2026, 9, 20, 12)
  const summary = (updatedAt: string) => [{ id: '1', nom: 'Eloy', updatedAt }]

  it('ne dit rien sans personnage', () => {
    expect(backupStatus(null, [], now)).toEqual({ warn: false, text: '' })
  })

  it('alerte si aucune sauvegarde', () => {
    expect(backupStatus(null, summary('2026-10-01T00:00:00Z'), now).warn).toBe(true)
  })

  it("alerte après 7 jours seulement s'il y a eu des modifications", () => {
    const last = new Date(2026, 9, 10).toISOString()
    expect(backupStatus(last, summary(new Date(2026, 9, 15).toISOString()), now)).toEqual({
      warn: true,
      text: 'Dernière sauvegarde : il y a 10 jours.',
    })
    expect(backupStatus(last, summary(new Date(2026, 9, 9).toISOString()), now).warn).toBe(false)
  })

  it("dit aujourd'hui / hier", () => {
    const s = summary('2026-10-01T00:00:00Z')
    expect(backupStatus(new Date(2026, 9, 20, 8).toISOString(), s, now).text).toMatch(/aujourd'hui/)
    expect(backupStatus(new Date(2026, 9, 19, 23).toISOString(), s, now).text).toMatch(/hier/)
  })
})
