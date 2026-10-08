<script lang="ts">
  import { tick } from 'svelte'
  import type { Skill } from '../model/character'
  import { addSkill, moveItem, removeById, updateSkill } from '../rules/lists'
  import { parseIntInput } from '../rules/numbers'

  // Liste de compétences (croquis 2). Sert au personnage (coût en mana) et aux créatures (coût en PP).
  let {
    owner,
    editing,
    unit,
    color = '--mana',
  }: { owner: { competences: Skill[] }; editing: boolean; unit: string; color?: string } = $props()

  let expanded = $state<Record<string, boolean>>({})
  let confirmDelete = $state<string | null>(null)
  let confirmTimer: ReturnType<typeof setTimeout> | undefined
  let listEl: HTMLElement

  const allOpen = $derived(owner.competences.length > 0 && owner.competences.every(s => expanded[s.id]))

  function toggleAll() {
    const open = !allOpen
    expanded = Object.fromEntries(owner.competences.map(s => [s.id, open]))
  }

  async function add() {
    const s = addSkill(owner)
    await tick()
    listEl.querySelector<HTMLInputElement>(`[data-id="${s.id}"] input`)?.focus()
  }

  function commitCost(skill: Skill, input: HTMLInputElement) {
    const t = input.value.trim()
    if (t === '') updateSkill(skill, { cout: null })
    else {
      const n = parseIntInput(t)
      if (n !== null) updateSkill(skill, { cout: n })
    }
    input.value = skill.cout === null ? '' : String(skill.cout)
  }

  function remove(id: string) {
    if (confirmDelete !== id) {
      confirmDelete = id
      clearTimeout(confirmTimer)
      confirmTimer = setTimeout(() => (confirmDelete = null), 4000)
      return
    }
    confirmDelete = null
    removeById(owner.competences, id)
  }

  const firstLine = (t: string) => t.split('\n').find(l => l.trim()) ?? ''
</script>

<div class="head">
  <span class="label">{owner.competences.length} compétence{owner.competences.length > 1 ? 's' : ''}</span>
  {#if !editing && owner.competences.length > 1}
    <button class="small" onclick={toggleAll}>{allOpen ? 'Tout replier' : 'Tout déplier'}</button>
  {/if}
</div>

<ul bind:this={listEl} style="--cost: var({color})">
  {#each owner.competences as skill, i (skill.id)}
    <li class="card" data-id={skill.id}>
      {#if editing}
        <div class="edit-top">
          <input
            class="title-input"
            value={skill.titre}
            oninput={e => updateSkill(skill, { titre: e.currentTarget.value })}
            maxlength="120"
            placeholder="Titre"
            aria-label="Titre de la compétence {i + 1}"
            autocomplete="off"
          />
          <input
            class="cost-input"
            value={skill.cout ?? ''}
            onchange={e => commitCost(skill, e.currentTarget)}
            inputmode="numeric"
            placeholder="Coût"
            aria-label="Coût en {unit} de la compétence {i + 1}"
            autocomplete="off"
          />
        </div>
        <textarea
          value={skill.description}
          oninput={e => updateSkill(skill, { description: e.currentTarget.value })}
          maxlength="20000"
          placeholder="Description"
          aria-label="Description de la compétence {i + 1}"
        ></textarea>
        <div class="actions">
          <button class="small" onclick={() => moveItem(owner.competences, i, -1)} disabled={i === 0} aria-label="Monter {skill.titre || 'la compétence'}">↑</button>
          <button class="small" onclick={() => moveItem(owner.competences, i, 1)} disabled={i === owner.competences.length - 1} aria-label="Descendre {skill.titre || 'la compétence'}">↓</button>
          <span class="spacer"></span>
          <button class="small danger" onclick={() => remove(skill.id)}>
            {confirmDelete === skill.id ? 'Confirmer' : 'Supprimer'}
          </button>
        </div>
      {:else}
        <button
          class="summary"
          onclick={() => (expanded[skill.id] = !expanded[skill.id])}
          aria-expanded={!!expanded[skill.id]}
        >
          <span class="title">{skill.titre || 'Sans titre'}</span>
          {#if skill.cout !== null}
            <span class="cost">{skill.cout} {unit}</span>
          {/if}
          <span class="chevron" aria-hidden="true">{expanded[skill.id] ? '▴' : '▾'}</span>
        </button>
        {#if expanded[skill.id]}
          <p class="desc">{skill.description || 'Pas de description.'}</p>
        {:else if skill.description}
          <p class="preview">{firstLine(skill.description)}</p>
        {/if}
      {/if}
    </li>
  {/each}
</ul>

{#if owner.competences.length === 0}
  <p class="empty">
    Aucune compétence.{#if !editing} Touche le crayon pour en ajouter.{/if}
  </p>
{/if}

{#if editing}
  <button class="primary add" onclick={add}>+ Ajouter une compétence</button>
{/if}

<style>
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 36px;
    margin-bottom: 8px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .card {
    padding: 0;
    overflow: hidden;
  }
  .summary {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    border: none;
    border-radius: 0;
    background: none;
    padding: 10px 12px;
    text-align: left;
  }
  .title {
    flex: 1;
    min-width: 0;
    font-weight: 600;
  }
  .cost {
    flex: none;
    padding: 2px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--cost) 18%, transparent);
    color: var(--cost);
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }
  .chevron {
    color: var(--muted);
  }
  .desc,
  .preview {
    margin: 0;
    padding: 10px 12px 12px;
    border-top: 1px solid var(--line);
  }
  .desc {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .preview {
    padding-top: 0;
    border-top: none;
    margin-top: -4px;
    color: var(--muted);
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .edit-top {
    display: grid;
    grid-template-columns: 1fr 84px;
    gap: 8px;
    padding: 10px 10px 0;
  }
  .title-input {
    font-weight: 600;
  }
  .cost-input {
    text-align: center;
  }
  textarea {
    display: block;
    width: calc(100% - 20px);
    margin: 8px 10px 0;
  }
  .actions {
    display: flex;
    gap: 6px;
    padding: 8px 10px 10px;
  }
  .spacer {
    flex: 1;
  }
  .small {
    min-height: 36px;
    font-size: 0.9rem;
  }
  .empty {
    color: var(--muted);
  }
  .add {
    width: 100%;
    margin-top: 12px;
  }
</style>
