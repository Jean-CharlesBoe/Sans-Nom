# Construire, publier et installer l'app

## Développer sur le PC

```bash
npm install          # une fois
npm run dev          # app dans le navigateur (http://localhost:5173), stockage navigateur
npm run check        # vérification des types
npm test             # tests unitaires
```

Dans le navigateur, les données vont dans le `localStorage` (repli de dev). **Sur le téléphone, c'est SQLite** : tester ce qui touche au stockage sur un vrai appareil.

## Tester sur un téléphone branché en USB (Android Studio)

Prérequis, une seule fois :
1. Lancer **Android Studio**, suivre l'assistant de premier lancement (installation standard) : il télécharge le SDK Android et demande d'**accepter les licences**.
2. Sur le téléphone : Paramètres → À propos → taper 7 fois sur « Numéro de build » → Options pour les développeurs → activer le **débogage USB**.

Ensuite :
```bash
npm run android:sync   # build web + copie dans le projet Android
npm run android:open   # ouvre Android Studio → bouton ▶ « Run » avec le téléphone branché
```

## Clé de signature (une seule fois, par le propriétaire du dépôt)

La clé signe chaque APK. **Toutes les versions doivent être signées avec la même clé**, sinon Android refuse la mise à jour et il faut désinstaller (= perte des données). Elle doit donc être conservée précieusement **hors de GitHub aussi** (gestionnaire de mots de passe, clé USB…).

1. Générer la clé (dans un dossier **hors du dépôt**) :
   ```bash
   "/c/Program Files/Android/Android Studio/jbr/bin/keytool.exe" -genkeypair -v -keystore sansnom-release.jks -alias sansnom -keyalg RSA -keysize 4096 -validity 36500
   ```
   L'outil demande un mot de passe et quelques informations (nom, ville… facultatif).
2. Encoder la clé en base64 pour GitHub :
   ```bash
   base64 -w0 sansnom-release.jks > sansnom-release.jks.b64
   ```
3. Sur GitHub : dépôt → Settings → Secrets and variables → Actions → **New repository secret**, créer :
   | Secret | Valeur |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | contenu du fichier `.b64` |
   | `ANDROID_KEYSTORE_PASSWORD` | mot de passe du keystore |
   | `ANDROID_KEY_ALIAS` | `sansnom` |
   | `ANDROID_KEY_PASSWORD` | mot de passe de la clé (le même par défaut) |
4. Supprimer le fichier `.b64`, garder le `.jks` et le mot de passe en lieu sûr.

Pour signer en local (facultatif) : créer `android/keystore.properties` (ignoré par git) :
```properties
storeFile=C:/chemin/vers/sansnom-release.jks
storePassword=...
keyAlias=sansnom
keyPassword=...
```

## Publier une version

Le workflow [.github/workflows/android.yml](../.github/workflows/android.yml) :
- à chaque push sur `main` ou PR : vérifie, teste et construit un **APK de debug** (téléchargeable dans l'onglet Actions, artefact `sansnom-debug-apk`) ;
- à chaque **tag `vX.Y.Z`** : construit l'**APK signé** et crée une **Release** GitHub avec le fichier `SansNom-vX.Y.Z.apk`.

```bash
git tag v0.1.0
git push origin v0.1.0
```

Le numéro de version interne (`versionCode`) est calculé à partir du tag (`X*10000 + Y*100 + Z`) : chaque tag doit être **supérieur** au précédent.

## Installer sur le téléphone d'un joueur

1. Sur le téléphone, ouvrir la page **Releases** du dépôt GitHub et télécharger `SansNom-vX.Y.Z.apk`.
2. Ouvrir le fichier ; Android demande d'autoriser l'installation depuis le navigateur (« sources inconnues ») : accepter pour ce navigateur.
3. Installer. Pour une mise à jour, refaire la même chose : la nouvelle version s'installe **par-dessus** et garde les données.

⚠️ Ne pas installer un APK de **debug** puis un APK de **release** (ou l'inverse) : signatures différentes → il faudrait désinstaller.
