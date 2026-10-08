# Journal des décisions

Format : date · décision · pourquoi · statut (`proposée` / `validée` / `abandonnée` / `remplacée`).

## D1 · 2026-10-08 · Réécriture plutôt que reprise de la v0 — *validée*
On repart sur une base neuve en reprenant les règles utiles de `fiche-perso.html`.
**Pourquoi** : la v0 est un fichier unique de 3 300 lignes, mono-personnage, mise en page bureau ; la plupart de ses fonctions sont abandonnées (Q 11) et il faut ajouter créatures, bonus temporaires, XP.

## D2 · 2026-10-08 · ~~Application web progressive (PWA)~~ — *remplacée par D6*
Proposition initiale : app web installable hébergée sur GitHub Pages. Remplacée parce que les données d'une app web peuvent être effacées avec les données du navigateur (voir D5).

## D3 · 2026-10-08 · Pile technique — *validée (révisée le 2026-10-08)*
- **Vite + TypeScript + Svelte 5** pour l'interface (une app web, emballée par Capacitor, voir D6).
- **Capacitor** pour produire l'app Android.
- **@capacitor-community/sqlite** pour la base (fichier SQLite natif sur le téléphone ; implémentation web de secours pour développer dans le navigateur).
- **Vitest** pour tester le module de règles.
- Polices embarquées (aucune dépendance réseau).
- ~~Dexie~~ et ~~vite-plugin-pwa~~ abandonnés avec D2.

## D4 · 2026-10-08 · Identifiants de code en anglais, UI en français — *proposée*
Les noms de variables/fichiers en anglais (`character`, `stats`), les textes affichés et les docs en français. Les termes du jeu sans équivalent clair restent en français (`ame`, `pratique`).

## D5 · 2026-10-08 · Stockage et sauvegarde des données — *validée : option B*

**Besoin** : ne pas perdre un personnage (4 ans de jeu pour Eloy) si le navigateur est nettoyé.

**Constat** : une base SQLite **dans le navigateur** (sqlite-wasm) est rangée au même endroit qu'IndexedDB et disparaît dans les mêmes cas. Ce qui compte, c'est **où** vivent les données.

| | A. App web + sauvegardes | **B. App Android (Capacitor) + SQLite** | C. A + sauvegarde auto Google Drive |
|---|---|---|---|
| Survit au nettoyage du navigateur | non | **oui** | oui |
| Perdu si… | données du site effacées sans sauvegarde | désinstallation / « vider les données » de l'app | — |
| Installation | lien web | APK hors Play Store | lien web + connexion Google |
| Mises à jour | automatiques | installer le nouvel APK (par-dessus, données conservées) | automatiques |

**Choix de l'utilisateur** : **B** (« un truc robuste tout de suite ») ; tous les joueurs sont sous **Android** (Q 22).

**Compléments retenus** :
- Export / import JSON d'un personnage via la feuille de partage Android (Drive, mail, WhatsApp…), avec rappel « dernière sauvegarde il y a N jours » — protège contre la désinstallation et la perte du téléphone.
- Laisser actif le **backup automatique Android** (`allowBackup`) pour que la base soit incluse dans la sauvegarde Google du téléphone. Fonctionnement réel à vérifier sur un appareil (étape 6).
- Accès aux données via une couche « repository » : l'UI ne parle jamais directement à SQLite.

## D6 · 2026-10-08 · App Android distribuée en APK via GitHub — *validée*
- L'APK est **construit par GitHub Actions** (pas besoin d'Android Studio sur le PC de dev) et publié dans les **Releases** du dépôt GitHub. Les joueurs téléchargent l'APK depuis leur téléphone et l'installent (autoriser « sources inconnues » une fois).
- L'APK est **signé avec une clé unique** gardée en secret GitHub : indispensable pour que chaque nouvelle version s'installe **par-dessus** l'ancienne sans perdre les données. Perdre cette clé = impossible de mettre à jour sans désinstaller → la clé doit être sauvegardée hors de GitHub aussi.
- Dépôt **public** `Sans-Nom` : les joueurs téléchargent les Releases sans compte (Q 28).
- Pas de Chromebook à supporter (Q 29).
- `appId` : `fr.sansnom.fiche` (définitif).
- Procédure complète : [RELEASE.md](RELEASE.md).

## D7 · 2026-10-08 · Écran Carac : choix d'interface — *proposée*
- **Équipement et inventaire modifiables en mode jeu** (pas seulement en mode édition) : on ramasse et on utilise des objets pendant la partie.
- **Ressources** : un tap sur un losange ouvre une fenêtre du bas (−10 / −5 / −1 / +1 / +5 / +10, montant libre à retirer ou ajouter, « Remettre au maximum ») ; maximum et régénération dans cette même fenêtre, en mode édition seulement. Le losange se remplit selon actuel / max.
- **Caracs** : en mode jeu, le cercle affiche la valeur finale (verte avec un bonus, rouge avec un malus), avec une pastille d'avantages (+N vert, −N rouge) ; un tap ouvre le détail (valeur, bonus, total). En mode édition, le cercle (pointillé) affiche la valeur de base avec + / − et la ligne « Av. − n + ».
- **Sauvegarde automatique** 400 ms après chaque modification, immédiate au retour à la liste et quand l'app passe en arrière-plan.
- Bouton retour Android : ferme d'abord la fenêtre ouverte, puis revient à la liste, puis quitte.
