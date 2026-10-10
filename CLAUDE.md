# Fiche de personnage JDR — guide de projet

Application mobile (téléphone + Chromebook) servant de **fiche de personnage** pour un JDR maison.
Plusieurs joueurs l'utilisent, chacun avec ses données **stockées localement** (aucun serveur, aucune synchro).

Langue du projet : **français** (UI, docs, messages de commit). Code (identifiants) en anglais ou français : voir [docs/DECISIONS.md](docs/DECISIONS.md).

## Où trouver quoi

| Fichier | Rôle |
|---|---|
| [docs/CAHIER_DES_CHARGES.md](docs/CAHIER_DES_CHARGES.md) | Ce que l'app doit faire : écrans, règles, modèle de données |
| [docs/QUESTIONS.md](docs/QUESTIONS.md) | Questions ouvertes à poser à l'utilisateur, et réponses obtenues |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Journal des décisions (techno, règles, UX), avec leur justification |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Étapes du développement et journal des sessions |
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Notice pour les joueurs : installer, mettre à jour, sauvegarder, utiliser |
| [docs/ICONE.md](docs/ICONE.md) | Icône de l'app et écran de démarrage : fichiers, adaptation du logo, régénération (`npm run icons`) |
| [docs/RELEASE.md](docs/RELEASE.md) | Dev local, test sur téléphone, clé de signature, publication d'une version, installation |
| [docs/ANALYSE_V0.md](docs/ANALYSE_V0.md) | Analyse de la version HTML existante (`fiche-perso.html`) |
| [docs/ANALYSE_FICHE_ELOY.md](docs/ANALYSE_FICHE_ELOY.md) | Analyse de la vraie fiche Google Sheet de l'utilisateur (4 ans de jeu) : besoins réels. **Local, hors dépôt** (gitignore) |
| `fiche-perso.html` | Prototype v0 écrit par un ami. **Référence uniquement**, ne pas modifier. **Local, hors dépôt** (gitignore) |

## Règles de travail entre sessions

1. En début de session : lire `docs/ROADMAP.md` (section « Journal des sessions » et étape en cours), puis `docs/QUESTIONS.md`.
2. Ne pas coder une fonctionnalité dont une question bloquante est encore ouverte : la poser d'abord.
3. Toute décision prise avec l'utilisateur → une entrée dans `docs/DECISIONS.md`.
4. Toute réponse obtenue → déplacer la question dans la section « Répondues » de `docs/QUESTIONS.md` et mettre à jour `docs/CAHIER_DES_CHARGES.md`.
5. En fin de session : ajouter une entrée au journal des sessions dans `docs/ROADMAP.md` (fait, reste à faire, points d'attention).
6. Les règles du jeu (bornes, calculs) vivent dans **un seul module** de règles, jamais dupliquées dans l'UI.
7. Toute évolution du format des données stockées → incrémenter la version du schéma et écrire une migration.

## Architecture

App web (Vite + TypeScript + Svelte 5) emballée en app Android par Capacitor. Données en SQLite sur le téléphone.

```
src/
  App.svelte                     navigation (liste ↔ fiche), bouton retour Android
  lib/model/character.ts         types, listes (caracs, races, pratiques), fabriques
  lib/rules/                     règles du jeu (fonctions pures ou mutations, testées) :
    numbers.ts                   bornes de saisie (LIMITS), clampInt, parseIntInput
    stats.ts                     caracs, avantages, bonus temporaires, valeur finale
    resources.ts                 ressources bornées 0..max, régénération, hasMana (Nain)
    identity.ts                  race, élément, pratiques
    xp.ts                        compteur d'XP + rappel de règle
    lists.ts                     compétences, créatures, réordonnancement
    normalize.ts                 validation/réparation d'un personnage chargé ou importé
  lib/backup/                    fichier de sauvegarde (format.ts, testé) et partage Android (share.ts)
  lib/storage/repository.ts      contrat CharacterRepository + choix de l'implémentation
  lib/storage/sqliteRepository.ts  SQLite (Android) + migrations du schéma
  lib/storage/webRepository.ts   repli localStorage pour `npm run dev` uniquement
  lib/screens/                   écrans : Home, CharacterScreen (onglets, mode édition, sauvegarde auto), CaracTab, InvocationsTab, CreatureView
  lib/components/                blocs réutilisables (perso + créatures) : StatGrid, ResourceDiamond, TempBonuses, IdentityBlock, SkillList, BackupPanel
  lib/ui/                        primitives : Sheet (fenêtre du bas), NumberInput, back.ts (pile du bouton retour)
android/                         projet Android généré par Capacitor (versionné)
assets/ + scripts/icon-layers.mjs  logo source et génération de l'icône (docs/ICONE.md)
.github/workflows/android.yml    CI : check, tests, APK debug ; APK signé + Release sur tag vX.Y.Z
```

- Les composants n'appellent jamais SQLite : toujours `getRepository()`.
- Toute règle de jeu passe par `src/lib/rules/` : les composants ne bornent ni ne calculent eux-mêmes. Les fonctions de règles **modifient l'objet reçu** (compatible avec les proxys `$state` de Svelte) et renvoient la valeur retenue.
- Tout personnage lu (base ou import) passe par `normalizeCharacter`.
- Avant d'enregistrer un état Svelte (`$state`), passer par `$state.snapshot()` : les proxys ne se sérialisent pas tous proprement.
- `appId` (`fr.sansnom.fiche`) et la clé de signature sont **définitifs** : les changer empêche la mise à jour des apps installées.

## Commandes

Node est dans `C:\Program Files\nodejs` (ajouter au PATH du shell si besoin). JDK : celui d'Android Studio (`C:\Program Files\Android\Android Studio\jbr`).

```bash
npm run dev            # dev dans le navigateur
npm run check          # types (svelte-check + tsc)
npm test               # Vitest
npm run android:sync   # build web + cap sync android
npm run android:open   # ouvrir dans Android Studio
npm run icons          # régénérer icône + écran de démarrage depuis assets/logo-source.png
```

Publication et installation : voir [docs/RELEASE.md](docs/RELEASE.md).
