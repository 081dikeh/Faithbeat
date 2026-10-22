// app/compose/page.tsx
// Music is now composed from a saved hymn (see the arrangement panel on /hymn/[id]).
import { redirect } from 'next/navigation'

export default function ComposePage() {
  redirect('/create')
}