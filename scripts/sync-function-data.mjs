// Copies the shop's product and pricing modules into the checkout function, so Supabase can bundle
// them without reaching outside supabase/functions. src/ stays the one place to edit prices.
import { readFileSync, writeFileSync } from 'node:fs'

const dest = 'supabase/functions/create-checkout-session/'
const header = '// Copied from src by `npm run functions:sync`. Edit the original in src, not this file.\n'
const files = { 'src/data/products.js': 'products.js', 'src/lib/pricing.js': 'pricing.js', 'src/config.js': 'config.js' }

for (const [from, to] of Object.entries(files)) {
  const code = readFileSync(from, 'utf8').replace("'../config.js'", "'./config.js'").replace("'../lib/pricing.js'", "'./pricing.js'")
  writeFileSync(dest + to, header + code)
}
console.log(`Synced ${Object.keys(files).length} files into ${dest}`)
