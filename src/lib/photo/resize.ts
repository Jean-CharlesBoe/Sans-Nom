import type { Photo } from '../model/character'

const IMAGE_SIZE = 512
const MINI_SIZE = 96

/** Charge l'image (l'orientation EXIF des photos de téléphone est appliquée par le navigateur). */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Ce fichier n'est pas une image lisible."))
    }
    img.src = url
  })
}

/** Recadre au centre en carré et réduit en JPEG. */
function squareJpeg(img: HTMLImageElement, size: number, quality: number): string {
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const out = Math.min(size, side)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = out
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error("Impossible de traiter l'image.")
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, out, out)
  return canvas.toDataURL('image/jpeg', quality)
}

/** Photo choisie (appareil photo ou galerie) → image carrée 512 px (~50–80 Ko) + miniature 96 px. */
export async function photoFromFile(file: File): Promise<Photo> {
  const img = await loadImage(file)
  return { image: squareJpeg(img, IMAGE_SIZE, 0.85), miniature: squareJpeg(img, MINI_SIZE, 0.8) }
}
