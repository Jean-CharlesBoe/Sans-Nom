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

## Tester sans câble USB

### Option 1 : installer l'APK de debug depuis le téléphone
1. Sur le téléphone, ouvrir le navigateur et **se connecter à GitHub** (les artefacts des Actions ne se téléchargent que connecté).
2. Ouvrir l'onglet **Actions** du dépôt → le dernier run vert « Android » → section **Artifacts** → `sansnom-debug-apk` (fichier `.zip`).
3. Ouvrir le zip avec l'app **Fichiers** (Files by Google) → **Extraire** → on obtient `app-debug.apk`.
4. Taper sur `app-debug.apk` → autoriser l'installation pour l'app Fichiers (« sources inconnues ») → **Installer**. Si Play Protect avertit d'une app inconnue : « Plus d'infos » → « Installer quand même ».

Chaque run CI signe le debug avec une clé de debug différente : pour installer un debug plus récent, **désinstaller l'ancien d'abord** (les données de test sont perdues, c'est normal).

### Option 2 : débogage sans fil (Android 11+, même Wi-Fi que le PC)
Prérequis : premier lancement d'Android Studio fait (SDK installé).
1. Téléphone : activer les Options pour les développeurs (7 taps sur « Numéro de build »), puis **Débogage sans fil**.
2. Android Studio : `npm run android:open` → menu des appareils (en haut) → **Pair Devices Using Wi-Fi** → scanner le QR code depuis le téléphone (Débogage sans fil → « Associer l'appareil avec un code QR »).
3. Choisir le téléphone dans la liste → bouton ▶ **Run**.

### Option 3 : émulateur Android sur le PC
Android Studio → **Device Manager** → **Create Virtual Device** (ex. Pixel, dernière image système) → `npm run android:open` → choisir l'émulateur → ▶ **Run**. Suffisant pour tester SQLite ; nécessite la virtualisation activée sur le PC.

### Que vérifier
- Créer un personnage, revenir à la liste (flèche et bouton retour Android).
- **Fermer complètement l'app** (balayer dans les apps récentes), la rouvrir : le personnage doit être toujours là → SQLite fonctionne.
- Supprimer (deux taps : « Supprimer » puis « Confirmer »).
- Passer le téléphone en thème sombre : l'app suit.

⚠️ Avant d'installer la première **vraie** version (release signée), désinstaller l'app de debug.

## Clé de signature (une seule fois, par le propriétaire du dépôt)

La clé signe chaque APK. **Toutes les versions doivent être signées avec la même clé**, sinon Android refuse la mise à jour et il faut désinstaller (= perte des données). Elle doit donc être conservée précieusement **hors de GitHub aussi** (gestionnaire de mots de passe, clé USB…).

Commandes pour **PowerShell** (terminal par défaut sous Windows).

1. Créer un dossier **hors du dépôt** et s'y placer :
   ```powershell
   New-Item -ItemType Directory -Force "$HOME\Documents\SansNom-cle"; Set-Location "$HOME\Documents\SansNom-cle"
   ```
2. Générer la clé (l'outil demande un mot de passe, puis des infos facultatives) :
   ```powershell
   & "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkeypair -v -keystore sansnom-release.jks -alias sansnom -keyalg RSA -keysize 4096 -validity 36500
   ```
3. Envoyer les secrets à GitHub avec `gh` (les commandes sans `--body` demandent la valeur au clavier) :
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\sansnom-release.jks")) | gh secret set ANDROID_KEYSTORE_BASE64 --repo Jean-CharlesBoe/Sans-Nom
   gh secret set ANDROID_KEYSTORE_PASSWORD --repo Jean-CharlesBoe/Sans-Nom
   gh secret set ANDROID_KEY_PASSWORD --repo Jean-CharlesBoe/Sans-Nom
   gh secret set ANDROID_KEY_ALIAS --body sansnom --repo Jean-CharlesBoe/Sans-Nom
   gh secret list --repo Jean-CharlesBoe/Sans-Nom
   ```
   | Secret | Valeur |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | la clé encodée en base64 |
   | `ANDROID_KEYSTORE_PASSWORD` | mot de passe du keystore |
   | `ANDROID_KEY_ALIAS` | `sansnom` |
   | `ANDROID_KEY_PASSWORD` | mot de passe de la clé (le même par défaut) |
4. Copier `sansnom-release.jks` en lieu sûr (clé USB, Drive perso, gestionnaire de mots de passe) et garder le mot de passe à part.

Pour signer en local (facultatif) : créer `android/keystore.properties` (ignoré par git) :
```properties
storeFile=C:/chemin/vers/sansnom-release.jks
storePassword=...
keyAlias=sansnom
keyPassword=...
```

## Empreinte de la clé officielle

Les APK de release doivent tous porter ce certificat (SHA-256) :
`9e057587ad8057b4e6244c56f579d40d78f274b7b00a88a621341381b064c452`

Vérifier un APK (`keytool -printcert` ne lit pas la signature v2, utiliser `apksigner` du SDK) :
```bash
"$LOCALAPPDATA/Android/Sdk/build-tools/36.0.0/apksigner.bat" verify --print-certs SansNom-vX.Y.Z.apk
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

## Sauvegarder ses personnages / changer de téléphone

Les fiches sont dans l'app (SQLite). Elles survivent aux mises à jour, mais **pas à une désinstallation** ni à la perte du téléphone. La vraie protection est le fichier de sauvegarde :

1. Accueil → carte **Sauvegarde** → **Sauvegarder** : la feuille de partage Android s'ouvre → choisir **Drive** (ou s'envoyer le fichier par mail / WhatsApp). Le fichier `sansnom-sauvegarde-AAAA-MM-JJ.json` contient **tous** les personnages avec leurs créatures.
2. Sur le nouveau téléphone (ou après réinstallation) : installer l'app → **Importer** → choisir le fichier. Pour une fiche déjà présente : « Remplacer », « Garder les deux » ou « Ignorer ».

L'accueil affiche la date de la dernière sauvegarde et passe en rouge s'il y a eu des modifications et plus de 7 jours sans sauvegarde.

**Sauvegarde Google d'Android** : l'app autorise la sauvegarde automatique (`allowBackup`), qui inclut la base SQLite si la sauvegarde Google est activée sur le téléphone (Paramètres → Google → Sauvegarde). Elle est restaurée quand on installe l'app sur un nouveau téléphone lié au même compte. Son déclenchement dépend d'Android (téléphone en charge, Wi-Fi, au plus une fois par jour) et n'a pas pu être vérifié sans câble : **ne pas compter dessus à la place du fichier**.


## Régénérer la notice PDF

Source : `docs/notice/notice.html` + captures dans `docs/notice/img/` (format téléphone 375 × 812, thème clair, personnage d'exemple). Après modification, dans PowerShell :

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --no-pdf-header-footer --user-data-dir="$env:TEMP\edge-pdf" --print-to-pdf="C:\Repos\Sans Nom\docs\Notice-Sans-Nom.pdf" "file:///C:/Repos/Sans%20Nom/docs/notice/notice.html"
```

Chaque section tient sur une page A4 : vérifier que le PDF a toujours une page par section (9 actuellement).
