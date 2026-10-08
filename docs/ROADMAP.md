# Roadmap

Étape en cours : **3 — Écran Carac**

| # | Étape | Contenu | Statut |
|---|---|---|---|
| 0 | Cadrage | Docs, questions/réponses, décisions D1–D6 | fait |
| 1 | Socle | Init git + dépôt GitHub, Vite/TS/Svelte, Capacitor Android, SQLite + couche repository (avec repli web pour le dev), écran liste des personnages, build APK signé par GitHub Actions | fait (v0.1.0) |
| 2 | Module de règles | Caracs, avantages, bonus temporaires, ressources bornées, XP ; tests Vitest | fait |
| 3 | Écran Carac | Identité, grille des 8 caracs, bonus temporaires, losanges + régénération, XP, équipement, inventaire, modes jeu/édition | à faire |
| 4 | Compétences | Cartes repliables, coût en mana, ajout / édition / tri | à faire |
| 5 | Invocations | Liste + fiche créature (caracs, Vie, PP, compétences en PP) | à faire |
| 6 | Sauvegarde | Export JSON via feuille de partage Android, import, rappel de sauvegarde, vérification du backup Android, test de mise à jour par-dessus une version précédente | à faire |
| 7 | Finitions | Mode sombre, tests sur les téléphones des joueurs, première Release publique de l'APK + notice d'installation | à faire |

## Journal des sessions

### Session 1 · 2026-10-08
- Fait : analyse de `fiche-perso.html` (voir ANALYSE_V0.md), lecture des 3 croquis, rédaction de CLAUDE.md, du cahier des charges, des questions et des décisions proposées.
- Fiche réelle `Eloy.xlsx` reçue et analysée (ANALYSE_FICHE_ELOY.md) ; questions Q 16 à Q 21 ajoutées.
- Réponses de l'utilisateur intégrées : cahier des charges v0.2 (onglets Carac / Compétences / Invocations, pas de règle des 40 points, bonus temporaires, XP, régénération, mode sombre ; abandon de Lore, Histoire, Dessins, portrait, schéma du corps, lanceur de dés).
- Option de stockage D5 rédigée (SQLite navigateur ≠ solution ; options A / B / C).
- Choix final : **app Android Capacitor + SQLite** (D5), APK construit par GitHub Actions (D6, proposée). Toutes les questions fonctionnelles tranchées (cahier v0.3).
- Bloquant pour l'étape 1 : Q 28 (dépôt public/privé, nom), Q 29 (Chromebook), Q 30 (installer Node.js, Android Studio ?).
- Q 28–30 répondues ; Node.js 24 LTS et Android Studio installés (winget).
- Étape 1 codée : Vite/TS/Svelte 5, Capacitor 8 + projet `android/`, modèle `Character`, repository SQLite (migrations via table `meta`) + repli localStorage en dev, écrans liste (créer / ouvrir / supprimer en 2 temps) et fiche (onglets vides), bouton retour Android, mode sombre, workflow GitHub Actions (APK debug / release signé sur tag), docs/RELEASE.md. `npm run check`, `npm test` et le parcours créer → ouvrir → retour → supprimer vérifiés dans le navigateur.
- Non vérifié : build Gradle et SQLite sur appareil (SDK Android pas encore installé : premier lancement d'Android Studio à faire par l'utilisateur).
- Dépôt public créé : https://github.com/Jean-CharlesBoe/Sans-Nom (fiche-perso.html et ANALYSE_FICHE_ELOY.md exclus via .gitignore). Premier run CI vert : APK de debug produit (artefact `sansnom-debug-apk`).
- APK de debug testé par l'utilisateur sur son téléphone (installé sans câble, via l'artefact) : fonctionne.
- Clé de signature : procédure PowerShell + `gh secret set` ajoutée dans RELEASE.md ; génération en cours côté utilisateur.
- 4 secrets configurés. **v0.1.0 publiée** : https://github.com/Jean-CharlesBoe/Sans-Nom/releases/tag/v0.1.0 — APK signé v2 avec la clé officielle (empreinte dans RELEASE.md), vérifié avec apksigner.
- Étape 2 faite : `src/lib/rules/` (caracs sans plafond de jeu, avantages signés, bonus temporaires, ressources 0..max, Nain sans mana sans perte de valeurs, pratiques multiples sans doublon, XP, compétences/créatures, `normalizeCharacter` branché au chargement). 22 tests verts.
- Choix d'implémentation : changer de race ne supprime ni l'élément ni le mana (simplement masqués), pour qu'une erreur de sélection soit sans conséquence.
- Prochaine étape : étape 3 (écran Carac, croquis 3).
