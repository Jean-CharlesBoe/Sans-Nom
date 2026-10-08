<script lang="ts">
  import IdentityBlock from '../components/IdentityBlock.svelte'
  import ResourceDiamond from '../components/ResourceDiamond.svelte'
  import StatGrid from '../components/StatGrid.svelte'
  import TempBonuses from '../components/TempBonuses.svelte'
  import type { Character } from '../model/character'
  import { hasMana } from '../rules/resources'
  import { adjustXp, setXp, XP_RULE } from '../rules/xp'
  import NumberInput from '../ui/NumberInput.svelte'

  let { character, editing }: { character: Character; editing: boolean } = $props()
</script>

<div class="tab">
  <IdentityBlock {character} {editing} />

  <section aria-label="Caractéristiques">
    <StatGrid owner={character} {editing} />
  </section>

  <TempBonuses owner={character} />

  <section class="resources" aria-label="Ressources">
    <ResourceDiamond label="Vie" res={character.ressources.vie} color="--vie" {editing} />
    <ResourceDiamond label="Âme" res={character.ressources.ame} color="--ame" {editing} />
    {#if hasMana(character)}
      <ResourceDiamond label="Mana" res={character.ressources.mana} color="--mana" {editing} />
    {/if}
  </section>
  {#if !hasMana(character)}
    <p class="note">Les Nains n'utilisent pas le mana.</p>
  {/if}

  <section class="card xp" aria-labelledby="xp-title">
    <h2 class="label" id="xp-title">XP à dépenser</h2>
    <div class="xp-row">
      <button onclick={() => adjustXp(character, -1)} disabled={character.xp === 0} aria-label="Retirer 1 XP">−</button>
      <NumberInput value={character.xp} label="XP à dépenser" onCommit={n => setXp(character, n)} />
      <button onclick={() => adjustXp(character, 1)} aria-label="Ajouter 1 XP">+</button>
    </div>
    <p class="rule">{XP_RULE}</p>
  </section>

  <section class="card">
    <label class="label" for="equipement">Équipement</label>
    <textarea id="equipement" bind:value={character.equipement} maxlength="20000"></textarea>
  </section>

  <section class="card">
    <label class="label" for="inventaire">Inventaire</label>
    <textarea id="inventaire" bind:value={character.inventaire} maxlength="20000"></textarea>
  </section>
</div>

<style>
  .tab {
    display: grid;
    gap: 20px;
  }
  .resources {
    display: flex;
    justify-content: space-around;
  }
  .note {
    margin: -12px 0 0;
    text-align: center;
    font-size: 0.85rem;
    color: var(--muted);
  }
  h2 {
    margin: 0;
  }
  .xp-row {
    display: grid;
    grid-template-columns: 56px 1fr 56px;
    gap: 8px;
    margin-top: 8px;
  }
  .xp-row button {
    padding: 0;
    font-size: 1.2rem;
  }
  .rule {
    margin: 8px 0 0;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .card label {
    display: block;
    margin-bottom: 6px;
  }
</style>
