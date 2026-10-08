<script lang="ts">
  import type { Character } from '../model/character'
  import { addCreature, moveItem, removeById } from '../rules/lists'
  import { onBack } from '../ui/back'
  import Sheet from '../ui/Sheet.svelte'
  import CreatureView from './CreatureView.svelte'

  // Liste des créatures (animaux totem, invocations, compagnons) → tap = fiche, + = nouvelle créature.
  let { character, editing }: { character: Character; editing: boolean } = $props()

  let openId = $state<string | null>(null)
  let addOpen = $state(false)
  let newName = $state('')

  const current = $derived(character.creatures.find(c => c.id === openId) ?? null)

  // Bouton retour Android : depuis une fiche de créature, revenir à la liste des créatures.
  $effect(() => {
    if (!current) return
    return onBack(() => (openId = null))
  })

  function create(event: SubmitEvent) {
    event.preventDefault()
    const nom = newName.trim()
    if (!nom) return
    const c = addCreature(character, nom)
    newName = ''
    addOpen = false
    openId = c.id
  }

  function remove(id: string) {
    removeById(character.creatures, id)
    openId = null
  }
</script>

{#if current}
  <div class="sub-head">
    <button class="back" onclick={() => (openId = null)}>← Invocations</button>
    <h2>{current.nom || 'Sans nom'}</h2>
  </div>
  <CreatureView creature={current} {editing} onDelete={() => remove(current.id)} />
{:else}
  <div class="head">
    <span class="label">{character.creatures.length} créature{character.creatures.length > 1 ? 's' : ''}</span>
    <button class="primary" onclick={() => (addOpen = true)}>+ Ajouter</button>
  </div>

  {#if character.creatures.length === 0}
    <p class="empty">Aucune invocation, animal totem ou compagnon pour l'instant.</p>
  {:else}
    <ul>
      {#each character.creatures as cr, i (cr.id)}
        <li>
          <button class="card item" onclick={() => (openId = cr.id)}>
            <span class="name">{cr.nom || 'Sans nom'}</span>
            {#if cr.type || cr.race}
              <span class="meta">{[cr.type, cr.race].filter(Boolean).join(' · ')}</span>
            {/if}
            <span class="res">
              <span class="vie">Vie {cr.ressources.vie.cur}/{cr.ressources.vie.max}</span>
              <span class="pp">PP {cr.ressources.pp.cur}/{cr.ressources.pp.max}</span>
            </span>
          </button>
          {#if editing}
            <div class="order">
              <button onclick={() => moveItem(character.creatures, i, -1)} disabled={i === 0} aria-label="Monter {cr.nom}">↑</button>
              <button onclick={() => moveItem(character.creatures, i, 1)} disabled={i === character.creatures.length - 1} aria-label="Descendre {cr.nom}">↓</button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
{/if}

<Sheet bind:open={addOpen} title="Nouvelle créature">
  <form onsubmit={create}>
    <label class="visually-hidden" for="new-creature">Nom de la créature</label>
    <input id="new-creature" bind:value={newName} maxlength="120" placeholder="Nom (ex. Blob)" autocomplete="off" />
    <button class="primary" type="submit" disabled={!newName.trim()}>Créer</button>
  </form>
</Sheet>

<style>
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .empty {
    color: var(--muted);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  li {
    display: flex;
    gap: 8px;
  }
  .item {
    flex: 1;
    min-width: 0;
    display: grid;
    gap: 2px;
    text-align: left;
    padding: 10px 14px;
  }
  .name {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .meta {
    color: var(--muted);
    font-size: 0.9rem;
  }
  .res {
    display: flex;
    gap: 14px;
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }
  .vie {
    color: var(--vie);
  }
  .pp {
    color: var(--pp);
  }
  .order {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .order button {
    flex: 1;
    min-height: 36px;
    padding: 0 12px;
  }
  .sub-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: -4px 0 16px;
  }
  .back {
    min-height: 36px;
    font-size: 0.9rem;
  }
  h2 {
    margin: 0;
    font-size: 1.2rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  form {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    margin-top: 16px;
  }
</style>
