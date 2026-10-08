# Icône de l'app

> Statut : en attente du dessin (réalisé par la compagne de l'utilisateur). L'app utilise encore l'icône Capacitor par défaut.

## Ce qu'il faut fournir

Idéalement **deux images PNG de 1024 × 1024 px** :

| Fichier | Contenu |
|---|---|
| `icon-foreground.png` | le dessin seul, **fond transparent** |
| `icon-background.png` | le fond (couleur unie ou motif), sans transparence |

À défaut, **une seule image PNG 1024 × 1024** (`icon.png`) avec son fond suffit.

Contraintes Android (icônes adaptatives) :
- Le téléphone découpe l'icône en cercle, carré arrondi ou goutte selon la marque : **garder tout ce qui compte dans le cercle central de ~66 % du côté** (environ 680 px de diamètre au centre). Le reste peut être rogné.
- Éviter le texte fin : l'icône s'affiche à ~48 px.
- Optionnel : une version **monochrome** (silhouette blanche sur transparent) pour les icônes à thème d'Android 13+.

## Intégration (à faire à réception)

1. Déposer les fichiers dans `assets/` à la racine du dépôt.
2. Générer toutes les tailles Android :
   ```bash
   npx @capacitor/assets generate --android --iconBackgroundColor '#15161a' --iconBackgroundColorDark '#15161a'
   ```
3. Vérifier `android/app/src/main/res/mipmap-*`, construire, tester sur téléphone, publier une version.
