// Prépare les deux couches de l'icône adaptative Android à partir du logo complet (assets/logo-source.png).
// Le logo a son propre cadre : on n'en garde que l'intérieur, réduit pour tenir dans la zone toujours
// visible (cercle de 66 dp sur 108 dp), posé sur un fond uni de la même couleur crème. Voir docs/ICONE.md.
import sharp from 'sharp'

const SRC = 'assets/logo-source.png'
const N = 1024
const INNER = { left: 300, top: 300, width: 3668, height: 3668 } // intérieur du logo 4268 px, sans cadre ni coins
// capacitor-assets place ces images dans la zone visible (72 dp) : 0.87 × 72 dp ≈ 63 dp, dans le cercle sûr de 66 dp.
const SCALE = 0.87 // part de la zone visible occupée par le logo

const src = sharp(SRC)
const { width, height } = await src.metadata()
if (width !== 4268 || height !== 4268) throw new Error(`logo-source.png : ${width}×${height}, attendu 4268×4268 (revoir INNER)`)

const px = await src.clone().extract({ left: 2000, top: 3800, width: 1, height: 1 }).raw().toBuffer()
const cream = { r: px[0], g: px[1], b: px[2], alpha: 1 }

const inner = await src.clone().extract(INNER).png().toBuffer()
const size = Math.round(N * SCALE)
const logo = await sharp(inner).resize(size, size).png().toBuffer()

// Premier plan opaque (crème + logo) : un premier plan transparent laisse un liseré au bord du logo
// quand l'outil le redimensionne. Ses bords tombent hors de la zone visible, donc aucune jointure.
await sharp({ create: { width: N, height: N, channels: 4, background: cream } })
  .composite([{ input: logo, gravity: 'center' }])
  .png()
  .toFile('assets/icon-foreground.png')
await sharp({ create: { width: N, height: N, channels: 4, background: cream } }).png().toFile('assets/icon-background.png')
// Icône « tout-en-un » (anciens Android) : fond + logo
await sharp({ create: { width: N, height: N, channels: 4, background: cream } })
  .composite([{ input: logo, gravity: 'center' }])
  .png()
  .toFile('assets/icon-only.png')

const hex = '#' + [cream.r, cream.g, cream.b].map(v => v.toString(16).padStart(2, '0')).join('')
console.log(`Couches écrites dans assets/ (fond ${hex}).`)

// Écran de démarrage (image d'arrière-plan pendant le chargement) : logo centré sur le même crème.
const SPLASH = 2732
const splashLogo = await sharp(inner).resize(900, 900).png().toBuffer()
await sharp({ create: { width: SPLASH, height: SPLASH, channels: 4, background: cream } })
  .composite([{ input: splashLogo, gravity: 'center' }])
  .png()
  .toFile('assets/splash.png')
console.log('Écran de démarrage écrit dans assets/splash.png.')
