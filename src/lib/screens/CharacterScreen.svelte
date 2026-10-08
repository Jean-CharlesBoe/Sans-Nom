<script lang="ts">
  import { onMount } from 'svelte'
  import type { Character } from '../model/character'
  import { getRepository } from '../storage/repository'

  let { id, onBack }: { id: string; onBack: () => void } = $props()

  const TABS = [
    ['carac', 'Carac'],
    ['competences', 'Compétences'],
    ['invocations', 'Invocations'],
  ] as const
  type Tab = (typeof TABS)[number][0]

  let character = $state<Character | null>(null)
  let error = $state('')
  let tab = $state<Tab>('carac')

  onMount(async () => {
    try {
      character = await (await getRepository()).get(id)
      if (!character) error = 'Personnage introuvable.'
    } catch (e) {
      error = 'Lecture impossible : ' + (e instanceof Error ? e.message : String(e))
    }
  })
</script>

<header>
  <button class="back" onclick={onBack} aria-label="Retour à la liste">←</button>
  <h1>{character?.nom ?? ''}</h1>
</header>

<div class="tabs" role="tablist" aria-label="Sections de la fiche">
  {#each TABS as [key, label] (key)}
    <button role="tab" aria-selected={tab === key} class:active={tab === key} onclick={() => (tab = key)}>
      {label}
    </button>
  {/each}
</div>

<main>
  {#if error}
    <p class="error" role="alert">{error}</p>
  {:else if character}
    <!-- Contenu des onglets : étapes 3 à 5 de la roadmap -->
    <p class="muted">Onglet « {TABS.find(t => t[0] === tab)?.[1]} » à venir.</p>
  {/if}
</main>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
  }
  .back {
    border: none;
    background: none;
    font-size: 1.4rem;
    padding: 0 8px;
  }
  h1 {
    margin: 0;
    font-size: 1.3rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--line);
    padding: 0 8px;
  }
  .tabs button {
    flex: 1;
    border: none;
    border-bottom: 3px solid transparent;
    border-radius: 0;
    background: none;
    color: var(--muted);
    padding: 0 4px;
  }
  .tabs button.active {
    color: var(--text);
    border-bottom-color: var(--accent);
    font-weight: 600;
  }
  main {
    max-width: 560px;
    margin: 0 auto;
    padding: 16px;
  }
  .muted {
    color: var(--muted);
  }
  .error {
    color: var(--danger);
  }
</style>
