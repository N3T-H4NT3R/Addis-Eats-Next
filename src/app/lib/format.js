const etbFormatter = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-ET", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export function etb(value) {
  const amount = Number(value);
  return etbFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function shortOrderId(value) {
  const id = String(value ?? "");
  const match = id.match(/^ORD-(.+)$/i);
  if (!match || match[1].length <= 8) return id;
  return `ORD-${match[1].slice(0, 8).toUpperCase()}`;
}

export function when(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : dateFormatter.format(date);
}

export function relative(value, now = Date.now()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  const seconds = Math.round((date.getTime() - now) / 1000);
  const units = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let amount = seconds;
  let unit = "second";
  for (const [limit, nextUnit] of units) {
    unit = nextUnit;
    if (Math.abs(amount) < limit) break;
    amount /= limit;
  }

  return relativeFormatter.format(Math.round(amount), unit);
}