# Roadmap

Étape en cours : **7 — Finitions**

| # | Étape | Contenu | Statut |
|---|---|---|---|
| 0 | Cadrage | Docs, questions/réponses, décisions D1–D6 | fait |
| 1 | Socle | Init git + dépôt GitHub, Vite/TS/Svelte, Capacitor Android, SQLite + couche repository (avec repli web pour le dev), écran liste des personnages, build APK signé par GitHub Actions | fait (v0.1.0) |
| 2 | Module de règles | Caracs, avantages, bonus temporaires, ressources bornées, XP ; tests Vitest | fait |
| 3 | Écran Carac | Identité, grille des 8 caracs, bonus temporaires, losanges + régénération, XP, équipement, inventaire, modes jeu/édition | fait |
| 4 | Compétences | Cartes repliables, coût en mana, ajout / édition / tri | fait |
| 5 | Invocations | Liste + fiche créature (caracs, Vie, PP, compétences en PP) | fait |
| 6 | Sauvegarde | Export JSON via feuille de partage Android, import, rappel de sauvegarde, vérification du backup Android, test de mise à jour par-dessus une version précédente | fait (sauf vérifs sur appareil) |
| 7 | Finitions | Mode sombre, tests sur les téléphones des joueurs, première Release publique de l'APK + notice d'installation, icône | en cours |

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
- Étape 3 faite : onglet Carac (identité, grille 3+3+2, bonus temporaires, losanges Vie/Âme/Mana avec fenêtre de dépense, régénération, XP, équipement, inventaire), mode jeu / édition (crayon), sauvegarde automatique, pile du bouton retour Android (`src/lib/ui/back.ts`), composants réutilisables pour les créatures (StatGrid, ResourceDiamond, TempBonuses). Choix d'interface consignés en D7. Vérifié dans le navigateur au format téléphone (dont rechargement et cas du Nain).
- Étape 4 faite : `SkillList` (réutilisable, unité et couleur du coût en paramètre) — mode jeu : cartes repliées (titre, pastille de coût, 1re ligne en aperçu), dépliage individuel ou « Tout déplier » ; mode édition : titre, coût (vide = pas de coût), description, ↑ ↓, suppression en 2 temps, ajout avec focus sur le titre. Vérifié dans le navigateur.
- Étape 5 faite : `InvocationsTab` (liste avec résumé Vie/PP, « + Ajouter » en mode jeu comme en édition, ↑ ↓ en édition, bouton retour Android → liste) et `CreatureView` (type avec suggestions Animal totem / Invocation / Animal de compagnie, race libre, StatGrid, bonus temporaires, losanges Vie/PP, équipement, inventaire, compétences en PP, suppression en 2 temps). Vérifié dans le navigateur, y compris après rechargement.
- **v0.2.0 publiée** (3 onglets complets), signée avec la clé officielle (vérifié).
- Étape 6 faite : `src/lib/backup/` (format + tests, partage Android), `BackupPanel` à l'accueil (sauvegarder, importer avec choix par fiche, rappel), méta `last_backup_at`, version de l'app affichée (`__APP_VERSION__`). Décisions en D8, procédure utilisateur dans RELEASE.md. 31 tests verts ; aller-retour sauvegarde → import vérifié dans le navigateur.
- À vérifier sur le téléphone de l'utilisateur : partage réel vers Drive, import depuis Drive, installation de v0.2.0 / v0.3.0 par-dessus la précédente sans perte. Backup Google non vérifiable sans câble (documenté).
- **v0.3.0 publiée** (sauvegarde), signée avec la clé officielle (vérifié) ; notes d'installation ajoutées à sa page.
- Étape 7 commencée : notice joueurs (docs/INSTALLATION.md), README du dépôt, notes d'installation automatiques sur chaque Release (`.github/release-notes.md`), en-tête fixe maintenu sous la barre d'état Android (fond opaque `body::before`), procédure icône (docs/ICONE.md).
- Retour utilisateur : v0.3.0 installée par-dessus v0.2.0 sans perte, sauvegarde vers Drive OK.
- Notice illustrée en PDF : `docs/Notice-Sans-Nom.pdf`, générée depuis `docs/notice/notice.html` (captures d'un personnage d'exemple « Aldric », thème clair, dans `docs/notice/img/`). Régénération : voir RELEASE.md.
- Correctif : les losanges se remplissent du bas vers le haut (gradient `to top left`). Pas encore publié (prochaine version).
- Icône intégrée (logo « SN » de la compagne de l'utilisateur, adapté à la zone visible des icônes adaptatives, fond crème #f7f0e4) + écran de démarrage assorti ; régénération : `npm run icons` (docs/ICONE.md).
- **v0.4.0** : icône, écran de démarrage, losanges remplis du bas vers le haut, en-tête sous la barre d'état.
- Réponse à l'utilisateur : il peut envoyer l'APK de la page Releases à ses amis (jamais l'artefact de debug), ou plus simplement le lien releases/latest.
- En attente : tests chez les autres joueurs.
