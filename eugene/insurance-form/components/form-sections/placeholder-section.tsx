export function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-gray-500">This section is not implemented yet.</p>
    </div>
  )
}

