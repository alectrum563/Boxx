/**
 * Extracts the dominant "interesting" color from an ImageData object.
 * Pixels that are near-black or near-white are ignored.
 * Each pixel is weighted by its saturation so vivid colors dominate over grays.
 * Returns { r, g, b } with values 0–255.
 */
export function extractDominantColor(imageData) {
  const data = imageData.data
  let rSum = 0, gSum = 0, bSum = 0, weightSum = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const brightness = (r + g + b) / 3
    // Skip near-black and near-white pixels
    if (brightness < 15 || brightness > 240) continue
    const max = Math.max(r, g, b)
    const saturation = max === 0 ? 0 : (max - Math.min(r, g, b)) / max
    const weight = 0.1 + saturation * 0.9
    rSum += r * weight
    gSum += g * weight
    bSum += b * weight
    weightSum += weight
  }

  if (weightSum < 1) {
    // Fallback: plain average of all pixels
    let fr = 0, fg = 0, fb = 0, fc = 0
    for (let i = 0; i < data.length; i += 4) {
      fr += data[i]; fg += data[i + 1]; fb += data[i + 2]; fc++
    }
    if (fc === 0) return { r: 128, g: 128, b: 128 }
    return { r: Math.round(fr / fc), g: Math.round(fg / fc), b: Math.round(fb / fc) }
  }

  return {
    r: Math.round(rSum / weightSum),
    g: Math.round(gSum / weightSum),
    b: Math.round(bSum / weightSum),
  }
}
