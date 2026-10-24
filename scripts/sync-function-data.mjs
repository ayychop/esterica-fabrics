// Copies the shop's pricing module into the checkout function, so Supabase can bundle it without
// reaching outside supabase/functions. src/ stays the one place to edit discounts and postage;
// prices per metre live in the products table, edited from the admin portal.
import { readFileSync, writeFileSync } from 'node:fs'

const dest = 'supabase/functions/create-checkout-session/'
const header = '// Copied from src by `npm run functions:sync`. Edit the original in src, not this file.\n'
const files = { 'src/lib/pricing.js': 'pricing.js' }

for (const [from, to] of Object.entries(files)) {
  const code = readFileSync(from, 'utf8')
  writeFileSync(dest + to, header + code)
}
console.log(`Synced ${Object.keys(files).length} file into ${dest}`)
