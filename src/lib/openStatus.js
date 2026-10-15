// Opening hours: Monday to Friday, 11:00 to 17:00, UK time (handles GMT and BST automatically).
// Bank holidays are not accounted for.
const OPEN_MIN = 11 * 60
const CLOSE_MIN = 17 * 60
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function ukNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t) => parts.find((p) => p.type === t)?.value
  return { day: DAYS.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

// The current time in London, e.g. "14:32"
export function ukClock(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date)
}

export function openStatus(date = new Date()) {
  const { day, minutes } = ukNow(date)
  const weekday = day >= 1 && day <= 5
  if (weekday && minutes >= OPEN_MIN && minutes < CLOSE_MIN) {
    return { open: true, label: 'Open now', detail: ukClock(date) }
  }
  let next
  if (weekday && minutes < OPEN_MIN) next = 'today'
  else if (day >= 1 && day <= 4) next = 'tomorrow'
  else next = 'Monday'
  return { open: false, label: 'Closed', detail: `opens ${next} at 11am` }
}
