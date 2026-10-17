"use client";

const birrTick = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  notation: "compact",
  maximumFractionDigits: 1,
});

function shortDate(value) {
  return new Intl.DateTimeFormat("en-ET", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function RevenueBars({ data }) {
  const width = 720;
  const height = 256;
  const left = 94;
  const right = 20;
  const top = 14;
  const bottom = 26;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(1, ...data.map((item) => item.revenue));
  const barHeight = Math.min(28, (plotHeight / Math.max(data.length, 1)) * 0.56);
  const ticks = [0, 1, 2, 3].map((index) => (max * index) / 3);

  return (
    <div className="h-80 w-full" aria-label="Fixed-height revenue chart">
      {data.length ? (
        <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="revenue-svg-title revenue-svg-description" preserveAspectRatio="xMidYMid meet">
          <title id="revenue-svg-title">Revenue by neighbourhood</title>
          <desc id="revenue-svg-description">Horizontal bars compare revenue in Ethiopian birr across delivery neighbourhoods.</desc>
          {ticks.map((tick, index) => {
            const x = left + (plotWidth * index) / 3;
            const y = top + plotHeight;
            return (
              <g key={index}>
                <line x1={x} x2={x} y1={top} y2={y} stroke="rgba(255,255,255,.1)" strokeDasharray="3 5" />
                <text x={x} y={height - 4} textAnchor={index === 0 ? "start" : index === 3 ? "end" : "middle"} fill="#9ca3af" fontSize="11">{birrTick.format(tick)}</text>
              </g>
            );
          })}
          {data.map((item, index) => {
            const y = top + (plotHeight / data.length) * index + (plotHeight / data.length - barHeight) / 2;
            const barWidth = (item.revenue / max) * plotWidth;
            return (
              <g key={item.neighborhood}>
                <text x={left - 10} y={y + barHeight / 2 + 4} textAnchor="end" fill="#d1d5db" fontSize="12">{item.neighborhood}</text>
                <rect x={left} y={y} width={Math.max(barWidth, 2)} height={barHeight} rx="7" fill="#fbbf24" />
                <text x={Math.min(left + barWidth + 8, width - 56)} y={y + barHeight / 2 + 4} fill="#fff" fontSize="11">{birrTick.format(item.revenue)}</text>
              </g>
            );
          })}
        </svg>
      ) : (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">No revenue data to chart.</div>
      )}
    </div>
  );
}

function DailyOrdersLine({ data }) {
  const width = 720;
  const height = 256;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 32;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const max = Math.max(1, ...data.map((item) => item.orders));
  const pointX = (index) => data.length === 1 ? left + plotWidth / 2 : left + (index * plotWidth) / (data.length - 1);
  const pointY = (value) => top + plotHeight - (value / max) * plotHeight;
  const points = data.map((item, index) => `${pointX(index)},${pointY(item.orders)}`).join(" ");
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <>
      <div className="h-64 w-full">
        {data.length ? (
          <svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="daily-svg-title daily-svg-description" preserveAspectRatio="xMidYMid meet">
            <title id="daily-svg-title">Orders per day</title>
            <desc id="daily-svg-description">A line chart of daily order counts from {shortDate(data[0].date)} to {shortDate(data.at(-1).date)}.</desc>
            {[0, 1, 2, 3].map((index) => {
              const value = (max * index) / 3;
              const y = pointY(value);
              return (
                <g key={index}>
                  <line x1={left} x2={width - right} y1={y} y2={y} stroke="rgba(255,255,255,.1)" strokeDasharray="3 5" />
                  <text x={left - 9} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="11">{value.toFixed(value % 1 ? 1 : 0)}</text>
                </g>
              );
            })}
            <polyline points={points} fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((item, index) => (
              <g key={item.date}>
                <circle cx={pointX(index)} cy={pointY(item.orders)} r="5" fill="#111315" stroke="#fbbf24" strokeWidth="3" />
                {index % labelEvery === 0 || index === data.length - 1 ? (
                  <text x={pointX(index)} y={height - 7} textAnchor="middle" fill="#9ca3af" fontSize="11">{shortDate(item.date)}</text>
                ) : null}
              </g>
            ))}
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">No order activity to chart.</div>
        )}
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-80 text-left text-sm">
          <caption className="sr-only">Accessible data for daily order trend</caption>
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-gray-400">
            <tr><th scope="col" className="px-4 py-3">Date</th><th scope="col" className="px-4 py-3 text-right">Orders (count)</th></tr>
          </thead>
          <tbody>
            {data.length ? data.map((item) => (
              <tr key={item.date} className="border-t border-white/10">
                <th scope="row" className="px-4 py-3 font-medium text-gray-200">{shortDate(item.date)}</th>
                <td className="px-4 py-3 text-right tabular-nums text-gray-300">{item.orders}</td>
              </tr>
            )) : (
              <tr><td colSpan={2} className="px-4 py-5 text-center text-gray-500">No daily order data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function RevenueChart({ summary }) {
  return (
    <section aria-label="Sales analytics" className="grid gap-5 lg:grid-cols-2">
      <article className="min-w-0 rounded-2xl border border-white/10 bg-[#1b1e21] p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Revenue by neighbourhood</h2>
          <p className="mt-1 text-sm text-gray-400">Sales totals · Ethiopian birr (ETB)</p>
        </div>
        <RevenueBars data={summary.revenueByNeighborhood} />
      </article>
      <article className="min-w-0 rounded-2xl border border-white/10 bg-[#1b1e21] p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Orders per day</h2>
          <p className="mt-1 text-sm text-gray-400">{summary.dateRange} · unit: orders/day</p>
        </div>
        <DailyOrdersLine data={summary.ordersByDay} />
      </article>
    </section>
  );
}
