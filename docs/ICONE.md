# Icône de l'app

> Statut : **intégrée en v0.4.0** (logo « SN » dessiné par la compagne de l'utilisateur).

## Fichiers

| Fichier | Rôle |
|---|---|
| `assets/logo-source.png` | logo d'origine, 4268 × 4268, avec son cadre et ses coins arrondis (**ne pas modifier**) |
| `assets/icon-foreground.png`, `icon-background.png`, `icon-only.png` | couches de l'icône adaptative, **générées** |
| `assets/splash.png` | écran de démarrage (logo sur fond crème), **généré** |
| `scripts/icon-layers.mjs` | fabrique les fichiers générés à partir du logo d'origine |

## Pourquoi le logo est retravaillé

Android découpe l'icône (cercle, carré arrondi… selon le téléphone) et n'affiche que le centre : zone visible de 72 dp sur un canevas de 108 dp, et seul un cercle de 66 dp est garanti. Le logo d'origine va jusqu'aux bords et a son propre cadre : tel quel, le point rouge et le bas du « N » seraient coupés. Le script garde l'intérieur du logo (sans le cadre), le réduit à 87 % de la zone visible et le pose sur un fond uni de la même couleur crème (`#f7f0e4`). Le cadre dégradé n'apparaît donc pas : c'est Android qui donne sa forme à l'icône.

Le premier plan est opaque (crème + logo) : un premier plan transparent laissait un liseré clair autour du logo après redimensionnement.

## Régénérer (si le logo change)

1. Remplacer `assets/logo-source.png` (si les dimensions changent, revoir `INNER` dans le script).
2. `npm run icons`
3. `git checkout -- android/app/src/main/AndroidManifest.xml` : l'outil reformate le manifeste sans rien changer.
4. Construire, tester sur téléphone, publier une version.

Pour un rendu plus fidèle (avec le dégradé bleu-vert par exemple), fournir deux couches séparées de 1024 × 1024 : le dessin sur fond transparent et le fond seul, en gardant l'essentiel dans le cercle central (~61 % du côté).
