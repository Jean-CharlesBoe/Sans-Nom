# Analyse de la v0 (`fiche-perso.html`)

Fichier unique HTML/CSS/JS (~3 300 lignes, version app 1.9.0, format de données v6), écrit par un ami de l'utilisateur.
Sauvegarde dans `localStorage` (clé `fiche-jdr:v1`) et IndexedDB pour les dessins. **Un seul personnage** par navigateur.

## Ce qu'elle contient

### Onglets
Fiche · Compétences · Lore · Histoire · Dessins (+ un panneau « Journal » technique).

### Fiche
- **Identité** : Nom, Race (liste fermée), Âge ; champ « Élément lié » si la race est Élémentalien.
- **8 caractéristiques** : Robustesse, Adresse, Finesse, Intellect, Volonté, Savoir-faire, Expression, Perception.
  - `base` : 1 à 12, **total des bases = 40 points** à répartir (compteur « points à répartir »).
  - `bonus` : entier signé, valeur finale = base + bonus, bornée entre 0 et 99.
  - `avantages` : 0 à 20 = nombre de **relances de dés** possibles sur cette carac (pastille sur le cercle).
  - Bouton « i » qui affiche un mémo de la carac (texte de règles).
- **Jauges** : Âme (losange), Vitalité, Mana — chacune `actuel / max`, saisies manuellement (0–999).
- **Races** : Humain, Elfe, Cendré, Huwa, Siranel, Élémentalien, Béli-in, Dulfling, Nain.
  Règle : un **Nain n'a pas de mana** (mana forcé à 0, ancienne valeur restaurée si la race change).
- **Compétence de race** (texte libre).
- **Pratique immatérielle** principale + secondaire (Pyromancie, Aquamancie, Magie, Sorcellerie, Druidisme, Shamanisme, Spiritisme, Canalisme, Autre), la secondaire ne peut pas être égale à la principale.
- **Portrait** (photo redimensionnée à 400 px).
- **Équipement** : schéma du corps cliquable (Tête, Cou, Épaules, Torse, Bras, Mains, Taille, Jambes, Pieds, Arme principale, Arme secondaire). Chaque emplacement : objet, effet, dégâts (dés), protection, état de blessure (indemne / blessé / grave). Plus un champ « Autre ».
- **Inventaire** : une zone de texte libre.

### Compétences
Liste ordonnable : Nom, Description, Dés (format `2d6`, `1d8+2`…). Max 200.

### Lore / Histoire
Carnets de pages en texte riche (gras, titres, liens entre pages, mentions `@`), arborescence jusqu'à 3 niveaux, glisser-déposer.

### Dessins
Petit outil de dessin sur canvas avec galerie.

### Transverse
Export / import JSON de la fiche, impression, réinitialisation, sauvegarde automatique, journal des erreurs, thème clair/sombre.

## Bilan

**Points forts à reprendre**
- Le modèle des caracs (base / bonus / avantages) et la règle des 40 points.
- La validation défensive des données importées (`sanitize`) et les migrations de format.
- Sauvegarde automatique, export/import JSON (indispensable sans serveur : c'est la seule sauvegarde).
- Mémos de règles sur les caracs.

**Limites qui motivent la réécriture**
- Un seul personnage par appareil, pas de notion d'utilisateur/profil.
- Pas d'Animal Totem ni d'Invocations (demandés par l'utilisateur).
- Mise en page pensée pour le bureau (deux colonnes), pas pour un téléphone en main pendant une partie.
- Fichier monolithique de 3 300 lignes : difficile à faire évoluer à plusieurs.
- Pas installable (pas de PWA), dépend de Google Fonts en ligne.
- Inventaire en texte libre, compétences sans coût en ressource.

**Fonctionnalités dont le sort est à décider** (voir QUESTIONS.md) : Lore, Histoire, Dessins, portrait, schéma du corps, pratique immatérielle, impression, journal technique.
