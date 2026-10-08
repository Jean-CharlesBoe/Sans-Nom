# Sans Nom — fiche de personnage

Application Android de fiche de personnage pour le JDR **Sans Nom** : caractéristiques, bonus temporaires, Vie / Âme / Mana, XP, équipement, inventaire, compétences, et fiches des invocations / animaux totem / compagnons. Tout fonctionne hors ligne ; les données restent sur le téléphone, avec une sauvegarde en un tap vers Drive.

## Installer

👉 **[Télécharger la dernière version](https://github.com/Jean-CharlesBoe/Sans-Nom/releases/latest)** (fichier `.apk`), puis suivre la [notice d'installation](docs/INSTALLATION.md).

📄 **[Notice illustrée (PDF)](docs/Notice-Sans-Nom.pdf)** : installation et utilisation de l'app, avec captures d'écran.

## Développement

App web (Vite + TypeScript + Svelte 5) emballée en app Android par Capacitor, données en SQLite.

```bash
npm install
npm run dev     # dans le navigateur
npm test        # tests
```

- Guide du projet : [CLAUDE.md](CLAUDE.md)
- Cahier des charges : [docs/CAHIER_DES_CHARGES.md](docs/CAHIER_DES_CHARGES.md)
- Construire, signer et publier : [docs/RELEASE.md](docs/RELEASE.md)
