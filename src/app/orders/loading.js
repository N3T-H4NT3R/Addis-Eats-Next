export default function OrdersLoading() {
  return (
    <main aria-label="Loading orders" aria-busy="true" className="min-h-screen bg-[#111315] px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-6">
          <div className="h-8 w-56 rounded bg-white/10" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/10" />
        </div>
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1e21]">
          <div className="h-12 border-b border-white/10 bg-white/[0.04]" />
          <table className="w-full" aria-hidden="true">
            <tbody>
              {Array.from({ length: 5 }, (_, index) => (
                <tr key={index} className="border-b border-white/10">
                  {Array.from({ length: 6 }, (_, cell) => <td key={cell} className="px-4 py-5"><div className="h-3 rounded bg-white/10" style={{ width: `${45 + ((index + cell) % 4) * 12}%` }} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <p className="sr-only">Loading orders</p>
      </div>
    </main>
  );
}
