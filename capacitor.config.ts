import type { CapacitorConfig } from '@capacitor/cli'

// appId est définitif : le changer crée une autre app sur le téléphone (données non reprises).
const config: CapacitorConfig = {
  appId: 'fr.sansnom.fiche',
  appName: 'Sans Nom',
  webDir: 'dist',
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: false,
    },
  },
}

export default config
