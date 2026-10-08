import { describe, expect, it } from 'vitest'
import { createCharacter, createCreature, STATS } from './character'

describe('createCharacter', () => {
  it('crée un personnage complet avec les 8 caracs', () => {
    const c = createCharacter('Eloy')
    expect(c.nom).toBe('Eloy')
    expect(Object.keys(c.stats)).toEqual(STATS.map(([k]) => k))
    expect(c.ressources.ame).toEqual({ cur: 100, max: 100, regeneration: '' })
    expect(c.creatures).toEqual([])
  })

  it('donne un identifiant différent à chaque personnage', () => {
    expect(createCharacter('A').id).not.toBe(createCharacter('B').id)
  })
})

describe('createCreature', () => {
  it('a Vie et PP comme ressources', () => {
    expect(Object.keys(createCreature('Blob').ressources)).toEqual(['vie', 'pp'])
  })
})
