import { BriefcaseBusiness, Heart, ShoppingBag, ShoppingCart } from 'lucide-react'

const icons = [Heart, ShoppingCart, ShoppingBag, BriefcaseBusiness]
const tones = ['blue', 'yellow', 'coral', 'violet']

export default function StatCard({ metric, index }) {
  const Icon = icons[index % icons.length]
  return (
    <article className={`stat-card stat-${tones[index % tones.length]}`}>
      <span className="stat-icon"><Icon size={19} fill="currentColor" /></span>
      <span><strong>{metric.value}</strong><small>{metric.label}</small></span>
    </article>
  )
}
