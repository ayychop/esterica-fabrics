// Business details. Update the phone number here and it changes everywhere on the site.
export const PHONE_DISPLAY = '+44 7921 654755'
export const PHONE_TEL = '+447921654755'
export const WHATSAPP_NUMBER = '447921654755'

export const ADDRESS_LINES = ['Access Self Storage', 'First Way, Wembley', 'Unit 5580']
export const ADDRESS_QUERY = 'Access Self Storage, First Way, Wembley'
export const HOURS = 'Monday to Friday, 11:00am to 5:00pm'

export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS_QUERY)}&output=embed`
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_QUERY)}`
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS_QUERY)}`

export const whatsappLink = (message = "Hi Esterica Fabrics, I'd like to enquire about your kente fabric.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

// Unsplash placeholders. Swap for real product photography later.
export const img = (id, w = 800, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=70`

export const HERO_IMAGE_ID = '1630084305900-b297cff3a608'

export const FABRICS = [
  { name: 'Royal Gold', id: '1660695828374-4ff51ac9df5d' },
  { name: 'Adinkra Wine', id: '1578509566163-068acd11b8e7' },
  { name: 'Forest Pride', id: '1655682614757-a9a33fa45c93' },
  { name: 'Indigo Crown', id: '1734868032501-448d1457dc38' },
  { name: 'Ashanti Sunrise', id: '1660695828403-b42e117e0b4f' },
  { name: 'Ewe Heritage', id: '1444362408440-274ecb6fc730' },
  { name: 'Bonwire Classic', id: '1552710307-537199cd41c0' },
  { name: 'Akwaaba Bloom', id: '1784123476742-de48239d2fb0' },
]

export const NAV_LINKS = [
  { id: 'collection', label: 'Collection' },
  { id: 'order', label: 'How to Order' },
  { id: 'visit', label: 'Visit Us' },
  { id: 'story', label: 'Our Story' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
]
