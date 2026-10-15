// Procedural Kente cloth, drawn the way it is woven: narrow strips sewn edge to edge,
// each strip alternating warp faced pinstripe sections with weft faced motif blocks.
// Generated on a canvas so the hero ships no texture download at all.

const K = {
  gold: '#E8B31A',
  goldDeep: '#B98900',
  crimson: '#C41E1E',
  forest: '#0F7A34',
  indigo: '#1A4DA0',
  ink: '#0A0A0A',
  cream: '#FAF4E4',
}

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Warp sections: vertical pinstripes across the strip width.
const WARPS = [
  [[10, K.gold], [3, K.ink], [6, K.forest], [3, K.ink], [10, K.gold], [4, K.crimson], [10, K.gold], [3, K.ink], [6, K.forest], [3, K.ink], [10, K.gold]],
  [[8, K.forest], [3, K.gold], [8, K.forest], [5, K.ink], [8, K.gold], [5, K.ink], [8, K.forest], [3, K.gold], [8, K.forest]],
  [[12, K.gold], [2, K.ink], [4, K.indigo], [2, K.ink], [12, K.gold], [2, K.ink], [4, K.crimson], [2, K.ink], [12, K.gold]],
  [[6, K.crimson], [4, K.gold], [6, K.crimson], [10, K.ink], [6, K.crimson], [4, K.gold], [6, K.crimson]],
]

function drawWarp(ctx, x, y, w, h, pattern) {
  const total = pattern.reduce((a, [pw]) => a + pw, 0)
  let cx = x
  for (const [pw, color] of pattern) {
    const ww = (pw / total) * w
    ctx.fillStyle = color
    ctx.fillRect(cx, y, ww + 0.5, h)
    cx += ww
  }
}

const MOTIFS = [
  // Checkerboard (Nkyimkyim style blocks)
  (ctx, x, y, w, h) => {
    ctx.fillStyle = K.ink
    ctx.fillRect(x, y, w, h)
    const n = 6
    const s = w / n
    for (let i = 0; i < n; i++)
      for (let j = 0; j < Math.floor(h / s); j++)
        if ((i + j) % 2 === 0) {
          ctx.fillStyle = K.gold
          ctx.fillRect(x + i * s, y + j * s, s, s)
        }
  },
  // Zigzag bands
  (ctx, x, y, w, h) => {
    ctx.fillStyle = K.forest
    ctx.fillRect(x, y, w, h)
    const bands = [K.gold, K.crimson, K.gold]
    bands.forEach((c, b) => {
      ctx.strokeStyle = c
      ctx.lineWidth = 9
      ctx.beginPath()
      const yy = y + (h / (bands.length + 1)) * (b + 1)
      const teeth = 4
      for (let t = 0; t <= teeth * 2; t++) {
        const px = x + (w / (teeth * 2)) * t
        const py = yy + (t % 2 ? -12 : 12)
        t ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
      }
      ctx.stroke()
    })
  },
  // Nested diamond
  (ctx, x, y, w, h) => {
    ctx.fillStyle = K.indigo
    ctx.fillRect(x, y, w, h)
    const cx = x + w / 2
    const cy = y + h / 2
    ;[[0.48, K.gold], [0.36, K.ink], [0.26, K.crimson], [0.14, K.gold]].forEach(([r, c]) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.moveTo(cx, cy - h * r)
      ctx.lineTo(cx + w * r, cy)
      ctx.lineTo(cx, cy + h * r)
      ctx.lineTo(cx - w * r, cy)
      ctx.closePath()
      ctx.fill()
    })
  },
  // Ladder (horizontal weft bars, Babadua)
  (ctx, x, y, w, h) => {
    ctx.fillStyle = K.gold
    ctx.fillRect(x, y, w, h)
    const bars = [K.ink, K.forest, K.ink, K.crimson, K.ink, K.forest, K.ink]
    const bh = h / (bars.length * 2 + 1)
    bars.forEach((c, i) => {
      ctx.fillStyle = c
      ctx.fillRect(x, y + bh * (i * 2 + 1), w, bh)
    })
    ctx.fillStyle = K.ink
    ctx.fillRect(x + w * 0.3, y, w * 0.06, h)
    ctx.fillRect(x + w * 0.64, y, w * 0.06, h)
  },
  // Crosses on crimson
  (ctx, x, y, w, h) => {
    ctx.fillStyle = K.crimson
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = K.gold
    ctx.fillRect(x + w * 0.42, y + h * 0.1, w * 0.16, h * 0.8)
    ctx.fillRect(x + w * 0.1, y + h * 0.42, w * 0.8, h * 0.16)
    ctx.fillStyle = K.ink
    ;[[0.15, 0.15], [0.7, 0.15], [0.15, 0.7], [0.7, 0.7]].forEach(([a, b]) => ctx.fillRect(x + w * a, y + h * b, w * 0.15, h * 0.15))
  },
]

export function createKenteCanvas({ size = 1024, strips = 8, seed = 7, palette, rotate = false } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const r = rng(seed)
  const sw = size / strips

  for (let s = 0; s < strips; s++) {
    const x = s * sw
    let y = 0
    let i = s % 2 // neighbouring strips are offset, as when they are sewn together
    const warp = WARPS[s % WARPS.length]
    while (y < size) {
      if (i % 2 === 0) {
        const h = Math.min(size - y, sw * (0.9 + r() * 0.5))
        drawWarp(ctx, x, y, sw, h, warp)
        y += h
      } else {
        const h = Math.min(size - y, sw)
        MOTIFS[Math.floor(r() * MOTIFS.length)](ctx, x, y, sw, h)
        // weft borders
        ctx.fillStyle = K.ink
        ctx.fillRect(x, y, sw, 3)
        ctx.fillRect(x, y + h - 3, sw, 3)
        y += h
      }
      i++
    }
    // the seam where strips are hand sewn
    ctx.fillStyle = 'rgba(10,8,6,0.55)'
    ctx.fillRect(x, 0, 1.5, size)
  }

  if (palette) recolour(ctx, size, palette)

  // Thread grain: faint horizontal picks with random density.
  for (let y = 0; y < size; y += 2) {
    ctx.fillStyle = `rgba(0,0,0,${r() * 0.09})`
    ctx.fillRect(0, y, size, 1)
  }
  for (let x = 0; x < size; x += 3) {
    ctx.fillStyle = `rgba(255,240,210,${r() * 0.05})`
    ctx.fillRect(x, 0, 1, size)
  }
  if (!rotate) return canvas
  // Turned 90 degrees: the strips run across instead of down.
  const turned = document.createElement('canvas')
  turned.width = size
  turned.height = size
  const tctx = turned.getContext('2d')
  tctx.translate(size / 2, size / 2)
  tctx.rotate(Math.PI / 2)
  tctx.drawImage(canvas, -size / 2, -size / 2)
  return turned
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

// Swap every base colour for its counterpart in another palette (nearest match, before grain is added).
function recolour(ctx, size, palette) {
  const from = Object.keys(palette).map((k) => hex(K[k]))
  const to = Object.values(palette).map(hex)
  const img = ctx.getImageData(0, 0, size, size)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    let best = -1
    let bestDist = 9000 // only remap pixels near a base colour (edges included)
    for (let c = 0; c < from.length; c++) {
      const dr = d[i] - from[c][0]
      const dg = d[i + 1] - from[c][1]
      const db = d[i + 2] - from[c][2]
      const dist = dr * dr + dg * dg + db * db
      if (dist < bestDist) {
        bestDist = dist
        best = c
      }
    }
    if (best >= 0) {
      d[i] = to[best][0]
      d[i + 1] = to[best][1]
      d[i + 2] = to[best][2]
    }
  }
  ctx.putImageData(img, 0, 0)
}

// The hero cloth: generated once, so it always shows exactly the same pattern.
let heroCanvas
export function getHeroKente() {
  if (!heroCanvas) heroCanvas = createKenteCanvas({ size: 1024, seed: 7 })
  return heroCanvas
}

// Indigo Ewe style cloth for Our Story: blue led, with cream and gold, strips running across.
export const INDIGO_PALETTE = {
  gold: '#1A4DA0',
  goldDeep: '#123E85',
  indigo: '#FAF4E4',
  crimson: '#E8B31A',
  forest: '#2F7BE0',
}

export const KENTE = K
