import { describe, expect, it } from 'vitest'
import { createCharacter, createCreature } from '../model/character'
import { addPratique, availablePratiques, needsElement, removePratique, setRace } from './identity'
import { addCreature, addSkill, moveItem, removeById, updateSkill } from './lists'
import { normalizeCharacter } from './normalize'
import { parseIntInput } from './numbers'
import { adjustResource, hasMana, setResourceCur, setResourceMax } from './resources'
import {
  addTempBonus,
  bonusTotal,
  finalStat,
  removeTempBonus,
  setAvantages,
  setStatValue,
  stepStat,
} from './stats'
import { adjustXp, setXp } from './xp'

describe('caracs', () => {
  it("n'ont pas de plafond de jeu (Eloy a 40 en Expression) mais restent positives", () => {
    const c = createCharacter('Eloy')
    expect(setStatValue(c, 'expression', 40)).toBe(40)
    expect(setStatValue(c, 'robustesse', -3)).toBe(0)
    expect(stepStat(c, 'robustesse', -1)).toBe(0)
    expect(stepStat(c, 'robustesse', 1)).toBe(1)
  })

  it('ne contrôlent plus la règle des 40 points', () => {
    const c = createCharacter('A')
    for (const k of Object.keys(c.stats) as (keyof typeof c.stats)[]) setStatValue(c, k, 30)
    expect(c.stats.perception.valeur).toBe(30)
  })

  it('acceptent des avantages positifs et des désavantages négatifs', () => {
    const c = createCharacter('A')
    expect(setAvantages(c, 'intellect', 2)).toBe(2)
    expect(setAvantages(c, 'intellect', -1)).toBe(-1)
    expect(setAvantages(c, 'intellect', 500)).toBe(20)
  })
})

describe('bonus temporaires', () => {
  it("s'ajoutent à la valeur finale et se retirent", () => {
    const c = createCharacter('A')
    setStatValue(c, 'expression', 10)
    const b1 = addTempBonus(c, 'expression', 5, '  Mélodie libératrice ')!
    addTempBonus(c, 'expression', -2, 'Blessé')
    expect(b1.origine).toBe('Mélodie libératrice')
    expect(bonusTotal(c, 'expression')).toBe(3)
    expect(finalStat(c, 'expression')).toBe(13)
    removeTempBonus(c, b1.id)
    expect(finalStat(c, 'expression')).toBe(8)
  })

  it('ignorent un bonus nul et ne rendent jamais la valeur finale négative', () => {
    const c = createCharacter('A')
    expect(addTempBonus(c, 'adresse', 0, 'rien')).toBeNull()
    setStatValue(c, 'adresse', 2)
    addTempBonus(c, 'adresse', -5, 'malus')
    expect(finalStat(c, 'adresse')).toBe(0)
  })

  it('fonctionnent aussi pour une créature', () => {
    const blob = createCreature('Blob')
    addTempBonus(blob, 'volonte', 3, 'Totem')
    expect(finalStat(blob, 'volonte')).toBe(4)
  })
})

describe('ressources', () => {
  it("l'actuel ne dépasse jamais le max ni ne passe sous 0", () => {
    const c = createCharacter('A')
    setResourceMax(c.ressources.mana, 110)
    expect(setResourceCur(c.ressources.mana, 130)).toBe(110)
    expect(adjustResource(c.ressources.mana, -200)).toBe(0)
    expect(adjustResource(c.ressources.mana, 15)).toBe(15)
  })

  it("baisser le max ramène l'actuel", () => {
    const c = createCharacter('A')
    setResourceMax(c.ressources.vie, 40)
    setResourceCur(c.ressources.vie, 40)
    setResourceMax(c.ressources.vie, 30)
    expect(c.ressources.vie).toMatchObject({ cur: 30, max: 30 })
  })

  it("l'Âme démarre à 100 / 100", () => {
    expect(createCharacter('A').ressources.ame).toMatchObject({ cur: 100, max: 100 })
  })
})

describe('race et pratiques', () => {
  it("un Nain n'a pas de mana, et changer de race ne perd pas les valeurs", () => {
    const c = createCharacter('A')
    setResourceMax(c.ressources.mana, 50)
    setRace(c, 'Nain')
    expect(hasMana(c)).toBe(false)
    setRace(c, 'Humain')
    expect(hasMana(c)).toBe(true)
    expect(c.ressources.mana.max).toBe(50)
  })

  it("l'élément n'est demandé qu'à un Élémentalien", () => {
    const c = createCharacter('A')
    setRace(c, 'Élémentalien')
    expect(needsElement(c)).toBe(true)
    setRace(c, 'Elfe')
    expect(needsElement(c)).toBe(false)
  })

  it('pratiques : plusieurs, sans doublon, noms libres acceptés', () => {
    const c = createCharacter('Eloy')
    expect(addPratique(c, 'canalisme')).toBe(true)
    expect(addPratique(c, 'Magie')).toBe(true)
    expect(addPratique(c, 'CANALISME')).toBe(false)
    expect(addPratique(c, 'Runologie')).toBe(true)
    expect(c.pratiques).toEqual(['Canalisme', 'Magie', 'Runologie'])
    expect(availablePratiques(c)).not.toContain('Magie')
    removePratique(c, 'Magie')
    expect(c.pratiques).toEqual(['Canalisme', 'Runologie'])
  })
})

describe('XP', () => {
  it('reste positive', () => {
    const c = createCharacter('A')
    expect(setXp(c, 3)).toBe(3)
    expect(adjustXp(c, -5)).toBe(0)
  })
})

describe('listes', () => {
  it('compétences : ajout, coût optionnel, tri, suppression', () => {
    const c = createCharacter('A')
    const a = addSkill(c, 'Voix de puissance')
    const b = addSkill(c, 'Auto guérison')
    updateSkill(b, { cout: 10, description: 'Récupération 2D6 + 4 de vie' })
    updateSkill(a, { cout: -3 })
    expect(a.cout).toBe(0)
    updateSkill(a, { cout: null })
    expect(a.cout).toBeNull()
    expect(moveItem(c.competences, 1, -1)).toBe(true)
    expect(c.competences.map(s => s.titre)).toEqual(['Auto guérison', 'Voix de puissance'])
    expect(moveItem(c.competences, 0, -1)).toBe(false)
    removeById(c.competences, a.id)
    expect(c.competences).toHaveLength(1)
  })

  it('créatures : pas de limite de nombre', () => {
    const c = createCharacter('A')
    addCreature(c, 'Blob')
    addCreature(c, 'Arnold')
    addCreature(c, 'Esprit du loup')
    expect(c.creatures.map(x => x.nom)).toEqual(['Blob', 'Arnold', 'Esprit du loup'])
  })
})

describe('parseIntInput', () => {
  it('lit les entiers saisis, refuse le reste', () => {
    expect(parseIntInput(' 12 ')).toBe(12)
    expect(parseIntInput('+2')).toBe(2)
    expect(parseIntInput('-3')).toBe(-3)
    expect(parseIntInput('')).toBeNull()
    expect(parseIntInput('1.5')).toBeNull()
    expect(parseIntInput('abc')).toBeNull()
  })
})

describe('normalizeCharacter', () => {
  it("renvoie un personnage identique s'il est déjà valide", () => {
    const c = createCharacter('Eloy')
    addSkill(c, 'Projection de brume')
    addCreature(c, 'Blob')
    const { character, warnings } = normalizeCharacter(JSON.parse(JSON.stringify(c)))
    expect(warnings).toEqual([])
    expect(character).toEqual(c)
  })

  it('corrige les données abîmées sans planter', () => {
    const { character, warnings } = normalizeCharacter({
      nom: 'X',
      race: 'Dragon',
      stats: { expression: { valeur: -4 } },
      ressources: { mana: { cur: 130, max: 110 } },
      bonusTemporaires: [{ carac: 'inconnue', valeur: 2 }, { carac: 'adresse', valeur: 0 }],
      pratiques: ['Magie', 'magie', 42],
      creatures: [{ nom: 'Blob', ressources: { pp: { cur: 5, max: 3 } } }],
    })
    expect(character.race).toBe('')
    expect(character.stats.expression.valeur).toBe(0)
    expect(character.ressources.mana).toMatchObject({ cur: 110, max: 110 })
    expect(character.bonusTemporaires).toEqual([])
    expect(character.pratiques).toEqual(['Magie'])
    expect(character.creatures[0].ressources.pp).toMatchObject({ cur: 3, max: 3 })
    expect(warnings.length).toBeGreaterThanOrEqual(4)
  })

  it('accepte des données illisibles', () => {
    expect(normalizeCharacter(null).warnings).toHaveLength(1)
    expect(normalizeCharacter('texte').character.nom).toBe('')
  })
})
