const uid = (prefix = "id") => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const brl = (value, compact = false) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  ...compact ? { notation: "compact", maximumFractionDigits: 1 } : {}
}).format(Number.isFinite(value) ? value : 0);
const num = (value) => new Intl.NumberFormat("pt-BR").format(value);
const pct = (value, digits = 0) => `${value > 0 ? "+" : ""}${value.toFixed(digits).replace(".", ",")}%`;
const toISO = (d) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const todayISO = () => toISO(/* @__PURE__ */ new Date());
const fromISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};
const addDays = (date, amount) => {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
};
const diffDays = (a, b) => Math.round((fromISO(a).getTime() - fromISO(b).getTime()) / 864e5);
const fmtDate = (iso, opts = { day: "2-digit", month: "short" }) => fromISO(iso).toLocaleDateString("pt-BR", opts).replace(".", "").replace(" de ", " ");
const fmtLongDate = (iso) => fromISO(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const fmtShortWeekday = (iso) => fromISO(iso).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase();
const relativeDay = (iso) => {
  const delta = diffDays(iso, todayISO());
  if (delta === 0) return "Hoje";
  if (delta === 1) return "Amanhã";
  if (delta === -1) return "Ontem";
  if (delta > 1 && delta < 7) return `Em ${delta} dias`;
  if (delta < -1) return `Há ${Math.abs(delta)} dias`;
  return fmtDate(iso);
};
const initials = (name) => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
const parseTime = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${`${h}`.padStart(2, "0")}:${`${m}`.padStart(2, "0")}`;
};
const addMinutes = (time, minutes) => minutesToTime(parseTime(time) + minutes);
const serviceDuration = (ids, services) => ids.reduce((sum2, id) => sum2 + (services.find((s) => s.id === id)?.duration ?? 30), 0);
const sum = (items, fn) => items.reduce((acc, i) => acc + fn(i), 0);
const groupBy = (items, fn) => items.reduce((acc, item) => {
  const key = fn(item);
  (acc[key] ||= []).push(item);
  return acc;
}, {});
const inRange = (iso, start, end) => iso >= start && iso <= end;
const monthKey = (iso) => iso.slice(0, 7);
const periodRange = (period, customStart, customEnd) => {
  const today = /* @__PURE__ */ new Date();
  const end = todayISO();
  switch (period) {
    case "today":
      return { start: end, end };
    case "7d":
      return { start: toISO(addDays(today, -6)), end };
    case "30d":
      return { start: toISO(addDays(today, -29)), end };
    case "90d":
      return { start: toISO(addDays(today, -89)), end };
    case "month":
      return { start: toISO(new Date(today.getFullYear(), today.getMonth(), 1)), end };
    case "custom":
      return { start: customStart || toISO(addDays(today, -29)), end: customEnd || end };
    default:
      return { start: toISO(addDays(today, -29)), end };
  }
};
const previousRange = (start, end) => {
  const days = diffDays(end, start) + 1;
  return { start: toISO(addDays(fromISO(start), -days)), end: toISO(addDays(fromISO(start), -1)) };
};
const trend = (current, previous) => previous === 0 ? current > 0 ? 100 : 0 : (current - previous) / previous * 100;
const STATUS_META = {
  scheduled: {
    label: "Agendado",
    dot: "bg-[#8b9089]",
    chip: "bg-[#f1f1ec] text-[#5d625b] border-[#e3e3da]",
    solid: "#8b9089"
  },
  confirmed: {
    label: "Confirmado",
    dot: "bg-[#3d7bfa]",
    chip: "bg-[#eef3ff] text-[#2f5fca] border-[#dbe6ff]",
    solid: "#3d7bfa"
  },
  in_progress: {
    label: "Em atendimento",
    dot: "bg-[#c08a18]",
    chip: "bg-[#fdf5e2] text-[#936a12] border-[#f4e6c2]",
    solid: "#d9a326"
  },
  completed: {
    label: "Concluído",
    dot: "bg-[#2f8f5b]",
    chip: "bg-[#ecf7ef] text-[#27784c] border-[#d6eddd]",
    solid: "#2f8f5b"
  },
  cancelled: {
    label: "Cancelado",
    dot: "bg-[#cf5a4d]",
    chip: "bg-[#fbeeec] text-[#aa4a3e] border-[#f3d9d4]",
    solid: "#cf5a4d"
  },
  no_show: {
    label: "Não compareceu",
    dot: "bg-[#a4703a]",
    chip: "bg-[#f8f0e7] text-[#8a5d2e] border-[#eeddca]",
    solid: "#a4703a"
  }
};
const PAYMENT_META = {
  pix: { label: "Pix", short: "Pix" },
  credit: { label: "Cartão de crédito", short: "Crédito" },
  debit: { label: "Cartão de débito", short: "Débito" },
  cash: { label: "Dinheiro", short: "Dinheiro" },
  transfer: { label: "Transferência", short: "Transf." }
};
const TIER_META = {
  new: { label: "Novo", className: "bg-[#eef2ea] text-[#5b6b4d] border-[#dfe7d8]" },
  frequent: { label: "Frequente", className: "bg-[#eef3ff] text-[#3761b5] border-[#dce6fb]" },
  vip: { label: "VIP", className: "bg-[#fbf4dd] text-[#8e6b1d] border-[#f0e3b8]" },
  inactive: { label: "Inativo", className: "bg-[#f3f2ee] text-[#82837c] border-[#e6e5dd]" }
};
const downloadCSV = (filename, rows) => {
  const csv = rows.map(
    (row) => row.map((cell) => {
      const value = `${cell ?? ""}`;
      return /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(";")
  ).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const percent = (part, total) => total === 0 ? 0 : Math.round(part / total * 1e3) / 10;
const WEEKDAYS = [
  { index: 1, label: "Segunda-feira", short: "Seg" },
  { index: 2, label: "Terça-feira", short: "Ter" },
  { index: 3, label: "Quarta-feira", short: "Qua" },
  { index: 4, label: "Quinta-feira", short: "Qui" },
  { index: 5, label: "Sexta-feira", short: "Sex" },
  { index: 6, label: "Sábado", short: "Sáb" },
  { index: 0, label: "Domingo", short: "Dom" }
];
const DATE_PERIOD_OPTIONS = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "custom", label: "Personalizado" }
];
export {
  DATE_PERIOD_OPTIONS,
  PAYMENT_META,
  STATUS_META,
  TIER_META,
  WEEKDAYS,
  addDays,
  addMinutes,
  brl,
  clamp,
  diffDays,
  downloadCSV,
  fmtDate,
  fmtLongDate,
  fmtShortWeekday,
  fromISO,
  groupBy,
  inRange,
  initials,
  minutesToTime,
  monthKey,
  num,
  parseTime,
  pct,
  percent,
  periodRange,
  previousRange,
  relativeDay,
  serviceDuration,
  sum,
  toISO,
  todayISO,
  trend,
  uid
};
