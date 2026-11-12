export default function DataTable({ columns, rows, renderRow }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr>{columns.map((column, index) => <th key={`${column}-${index}`}>{column}{column && <span className="sort-caret">⌄</span>}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => renderRow(row, index))}</tbody>
      </table>
    </div>
  )
}
