# Cahier des charges

> Statut : **v0.3** (2026-10-08) : toutes les questions fonctionnelles sont tranchées. Les points marqués **[Q n]** dépendent d'une question encore ouverte de [QUESTIONS.md](QUESTIONS.md).

## 1. Objectif

Remplacer la fiche Google Sheet et le prototype HTML par une application utilisable **en partie, sur téléphone**, rapide à consulter et à mettre à jour (PV qui baissent, mana dépensé, bonus reçu, XP gagnée…).

## 2. Contraintes

- Chaque joueur utilise **son propre téléphone Android**. Pas de compte, pas de mot de passe.
- **App Android** (Capacitor), installée par APK, **fonctionne hors ligne** (D5, D6).
- Aucune communication entre joueurs, aucun serveur.
- **Les données ne doivent pas être perdues** : base **SQLite** dans l'app + export/import JSON + backup Android (D5)
- Une mise à jour de l'app (nouvel APK) **conserve** les données ; le format stocké est versionné et migré.
- Plusieurs personnages possibles sur un téléphone (liste à l'accueil).
- Interface en français, utilisable d'une main sur ~360 px de large, **mode sombre**.

## 3. Écrans

Accueil : liste des personnages (créer, ouvrir, supprimer, exporter, importer).
Dans un personnage, onglets en haut : **`Carac | Compétences | Invocations`**.

Deux modes : **jeu** (par défaut : ressources, bonus temporaires, XP) et **édition** (bouton crayon : valeurs des caracs, maximums, textes, ajout/suppression).

### 3.1 Carac (croquis 3)

1. **Identité** : Nom · Titre · Âge · Race (liste fermée) · Élément (si Élémentalien) · Pratiques immatérielles (liste, 1 ou plus).
2. **Caractéristiques** : 8 caracs en grille 3 colonnes (3 + 2 + 3).
   Chaque carac : nom au-dessus, **cercle = valeur finale**, boutons **+ / −** (mode édition), case **avantages / désavantages** (entier signé : +2 = 2 relances, −1 = 1 désavantage).
   Valeur finale = valeur + somme des bonus temporaires actifs ; mise en évidence (couleur) quand un bonus s'applique.
3. **Bonus temporaires** : liste courte (carac, ±N, origine), ajout rapide, suppression d'un tap. Pas de durée.
4. **Ressources** : 3 losanges `actuel / max` — **Vie**, **Âme**, **Mana**. Ajustement rapide (+1 / −1, saisie d'un montant à retirer ou ajouter). L'actuel est borné entre 0 et le max. Sous chaque ressource : **Régénération** (texte, ex. « 2D6 »).
5. **XP à dépenser** : compteur + rappel de la règle (1 XP = +1 carac ou +2 au max d'une ressource). Pas de dépense automatique : le joueur ajuste lui-même.
6. **Équipement** : texte libre, modifiable aussi en mode jeu (D7).
7. **Inventaire** : texte libre, modifiable aussi en mode jeu (D7).

### 3.2 Compétences (croquis 2)

Liste de cartes. Chaque compétence : **Titre**, **coût en mana** (nombre, optionnel), **description** longue (plusieurs milliers de caractères, retours à la ligne).
Cartes repliées par défaut (titre + coût), dépliées d'un tap. Ajout, édition, suppression, réordonnancement. Pas de catégories (la compétence de race est une compétence comme une autre).

### 3.3 Invocations (croquis 1)

Regroupe animaux totem, invocations et animaux de compagnie.
- Liste des créatures (nom, race, Vie et PP en résumé) + bouton **+**.
- Tap → fiche de la créature :
  - **Nom**, **Race**, **Type** (texte libre ou liste : totem / invocation / compagnon) ;
  - **8 caracs** (mêmes que le personnage) avec avantages et bonus temporaires ;
  - **2 losanges** : **Vie** et **PP** (points d'action) ;
  - **Équipement + Inventaire** (texte libre) ;
  - **Compétences** : titre, **coût en PP**, description.

## 4. Règles du jeu

| Élément | Règle |
|---|---|
| Caracs | Robustesse, Adresse, Finesse, Intellect, Volonté, Savoir-faire, Expression, Perception |
| Valeur | entier ≥ 0, **sans plafond ni total imposé** (les 40 points de création ne sont pas contrôlés) |
| Avantages | entier signé ; +N = N relances du jet sur cette carac ; une valeur négative indique des désavantages (dont l'effet est géré par le MJ) |
| Bonus temporaires | ±N sur une carac, ajoutés/retirés à la main, sans durée |
| Ressources | Vie, Âme, Mana (créatures : Vie, PP) ; max saisi à la main ; 0 ≤ actuel ≤ max |
| Régénération | texte par ressource, modifiable |
| XP | compteur d'XP à dépenser ; règle affichée : 1 XP = +1 carac, ou +2 au max d'une ressource |
| Coût des compétences | mana (personnage), PP (créature) |
| Races | liste fermée : Humain, Elfe, Cendré, Huwa, Siranel, Élémentalien (+ élément), Béli-in, Dulfling, Nain |
| Nain | **pas de mana** : ressource Mana masquée/désactivée, compétences sans coût mana possibles |
| Pratiques immatérielles | liste ouverte par personnage (Pyromancie, Aquamancie, Magie, Sorcellerie, Druidisme, Shamanisme, Spiritisme, Canalisme, ou Autre à préciser) ; 1 au départ, sans limite ensuite |

## 5. Modèle de données (proposition)

```text
Personnage
 ├─ id, schemaVersion, createdAt, updatedAt
 ├─ nom, titre, age, race, element, pratiques[]
 ├─ caracs : { robustesse: {valeur, avantages}, ... ×8 }
 ├─ bonusTemporaires[] : { id, carac, valeur, origine }
 ├─ ressources : { vie|ame|mana : {cur, max, regeneration} }
 ├─ xp : number
 ├─ equipement : string, inventaire : string
 ├─ competences[] : { id, titre, cout?, description }
 └─ creatures[] :
      { id, nom, race, type,
        caracs, bonusTemporaires[],
        ressources : { vie, pp },
        equipement, inventaire,
        competences[] }
```

Stockage SQLite : une table `characters` (id, nom, updated_at, data JSON du personnage complet avec ses créatures) + une table `meta` (version du schéma, date de dernière sauvegarde). Stocker le personnage en JSON garde le modèle souple ; les colonnes séparées servent à la liste d'accueil.
Export = un fichier JSON par personnage, même format que la colonne `data`.

## 6. Hors périmètre

Synchronisation entre joueurs, partage avec le MJ, lanceur de dés, Lore / Histoire / Dessins, portrait, impression, mémos de règles, notes de relations, gestion de l'argent ou du poids, schéma du corps.
