import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search' }) {
  return (
    <label className="search-field">
      <Search size={16} aria-hidden="true" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </label>
  )
}
