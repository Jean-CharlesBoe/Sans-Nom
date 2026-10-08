<script lang="ts">
  import { RACES, type Character, type Race } from '../model/character'
  import { addPratique, availablePratiques, needsElement, removePratique, setRace } from '../rules/identity'

  let { character, editing }: { character: Character; editing: boolean } = $props()

  const OTHER = '__autre__'
  let otherName = $state('')
  let showOther = $state(false)

  function pick(e: Event & { currentTarget: HTMLSelectElement }) {
    const v = e.currentTarget.value
    e.currentTarget.value = ''
    if (v === OTHER) showOther = true
    else if (v) addPratique(character, v)
  }

  function addOther(event: SubmitEvent) {
    event.preventDefault()
    if (addPratique(character, otherName)) {
      otherName = ''
      showOther = false
    }
  }

  const summary = $derived(
    [character.race, needsElement(character) ? character.element : '', character.age ? `${character.age} ans` : '']
      .filter(Boolean)
      .join(' · '),
  )
</script>

{#if editing}
  <div class="form">
    <label class="wide">
      <span class="label">Nom</span>
      <input bind:value={character.nom} maxlength="120" autocomplete="off" />
    </label>
    <label class="wide">
      <span class="label">Titre</span>
      <input bind:value={character.titre} maxlength="120" placeholder="ex. le Doré" autocomplete="off" />
    </label>
    <label>
      <span class="label">Race</span>
      <select value={character.race} onchange={e => setRace(character, e.currentTarget.value as Race | '')}>
        <option value="">—</option>
        {#each RACES as r (r)}
          <option value={r}>{r}</option>
        {/each}
      </select>
    </label>
    <label>
      <span class="label">Âge</span>
      <input bind:value={character.age} maxlength="40" inputmode="numeric" autocomplete="off" />
    </label>
    {#if needsElement(character)}
      <label class="wide">
        <span class="label">Élément</span>
        <input bind:value={character.element} maxlength="80" placeholder="ex. Or" autocomplete="off" />
      </label>
    {/if}
    <div class="wide">
      <span class="label">Pratiques immatérielles</span>
      <div class="chips">
        {#each character.pratiques as p (p)}
          <span class="chip">
            {p}
            <button onclick={() => removePratique(character, p)} aria-label="Retirer {p}">✕</button>
          </span>
        {/each}
      </div>
      <select onchange={pick} aria-label="Ajouter une pratique">
        <option value="">+ Ajouter une pratique</option>
        {#each availablePratiques(character) as p (p)}
          <option value={p}>{p}</option>
        {/each}
        <option value={OTHER}>Autre…</option>
      </select>
      {#if showOther}
        <form class="other" onsubmit={addOther}>
          <input bind:value={otherName} maxlength="120" placeholder="Nom de la pratique" aria-label="Nom de la pratique" />
          <button type="submit" disabled={!otherName.trim()}>Ajouter</button>
        </form>
      {/if}
    </div>
  </div>
{:else}
  <div class="view">
    {#if character.titre}<p class="titre">{character.titre}</p>{/if}
    {#if summary}<p class="summary">{summary}</p>{/if}
    {#if character.pratiques.length}
      <div class="chips">
        {#each character.pratiques as p (p)}
          <span class="chip">{p}</span>
        {/each}
      </div>
    {/if}
    {#if !character.titre && !summary && !character.pratiques.length}
      <p class="summary muted">Race, âge, pratiques… : touche le crayon pour remplir.</p>
    {/if}
  </div>
{/if}

<style>
  .form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .form label,
  .form > div {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .wide {
    grid-column: 1 / -1;
  }
  .view p {
    margin: 0;
  }
  .titre {
    font-style: italic;
    font-size: 1.05rem;
  }
  .summary {
    color: var(--muted);
  }
  .muted {
    font-size: 0.9rem;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 6px 0;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 10px;
    border: 1px solid var(--accent);
    border-radius: 999px;
    color: var(--accent);
    font-size: 0.85rem;
  }
  .chip button {
    border: none;
    background: none;
    min-height: 28px;
    padding: 0 0 0 6px;
    color: inherit;
  }
  .other {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 6px;
  }
</style>
