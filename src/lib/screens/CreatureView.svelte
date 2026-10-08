<script lang="ts">
  import ResourceDiamond from '../components/ResourceDiamond.svelte'
  import SkillList from '../components/SkillList.svelte'
  import StatGrid from '../components/StatGrid.svelte'
  import TempBonuses from '../components/TempBonuses.svelte'
  import type { Creature } from '../model/character'

  // Fiche d'une créature (croquis 1) : animal totem, invocation ou animal de compagnie.
  let {
    creature,
    editing,
    onDelete,
  }: { creature: Creature; editing: boolean; onDelete: () => void } = $props()

  let confirmDelete = $state(false)

  function remove() {
    if (!confirmDelete) {
      confirmDelete = true
      setTimeout(() => (confirmDelete = false), 4000)
      return
    }
    onDelete()
  }

  const summary = $derived([creature.type, creature.race].filter(Boolean).join(' · '))
</script>

<div class="view">
  {#if editing}
    <div class="form">
      <label class="wide">
        <span class="label">Nom</span>
        <input bind:value={creature.nom} maxlength="120" autocomplete="off" />
      </label>
      <label>
        <span class="label">Type</span>
        <input bind:value={creature.type} list="creature-types" maxlength="120" placeholder="ex. Animal totem" autocomplete="off" />
        <datalist id="creature-types">
          <option value="Animal totem"></option>
          <option value="Invocation"></option>
          <option value="Animal de compagnie"></option>
        </datalist>
      </label>
      <label>
        <span class="label">Race</span>
        <input bind:value={creature.race} maxlength="120" placeholder="ex. Cheval" autocomplete="off" />
      </label>
    </div>
  {:else}
    <p class="summary">{summary || 'Type et race : touche le crayon pour remplir.'}</p>
  {/if}

  <section aria-label="Caractéristiques de {creature.nom}">
    <StatGrid owner={creature} {editing} />
  </section>

  <TempBonuses owner={creature} />

  <section class="resources" aria-label="Ressources de {creature.nom}">
    <ResourceDiamond label="Vie" res={creature.ressources.vie} color="--vie" {editing} />
    <ResourceDiamond label="PP" res={creature.ressources.pp} color="--pp" {editing} />
  </section>

  <section class="card">
    <label class="label" for="cr-equipement">Équipement</label>
    <textarea id="cr-equipement" bind:value={creature.equipement} maxlength="20000"></textarea>
  </section>

  <section class="card">
    <label class="label" for="cr-inventaire">Inventaire</label>
    <textarea id="cr-inventaire" bind:value={creature.inventaire} maxlength="20000"></textarea>
  </section>

  <section aria-label="Compétences de {creature.nom}">
    <SkillList owner={creature} {editing} unit="PP" color="--pp" />
  </section>

  {#if editing}
    <button class="danger delete" onclick={remove}>
      {confirmDelete ? `Confirmer : supprimer ${creature.nom || 'cette créature'}` : 'Supprimer cette créature'}
    </button>
  {/if}
</div>

<style>
  .view {
    display: grid;
    gap: 20px;
  }
  .form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .form label {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .wide {
    grid-column: 1 / -1;
  }
  .summary {
    margin: 0;
    color: var(--muted);
  }
  .resources {
    display: flex;
    justify-content: space-around;
  }
  .card label {
    display: block;
    margin-bottom: 6px;
  }
  .delete {
    width: 100%;
  }
</style>
