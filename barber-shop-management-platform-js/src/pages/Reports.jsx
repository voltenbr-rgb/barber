import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ArrowUpRight, BarChart3, Download, Star, TrendingUp, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Avatar, Badge, Button, Card, CardHeader, Segmented } from "@/components/ui";
import { PeriodFilter, defaultPeriod } from "@/components/PeriodFilter";
import {
  getClientStats,
  netValue,
  periodMetrics,
  professionalPerformance,
  revenueSeries,
  serviceRanking
} from "@/lib/selectors";
import { brl, downloadCSV, fromISO, sum, WEEKDAYS } from "@/lib/utils";
const CATEGORY_COLORS = ["#8aa338", "#9DBBFF", "#E6B980", "#C9B6F6", "#9FE3C4", "#FFAD95", "#d4d2c6"];
function Reports() {
  const { appointments, clients, services, professionals, expenses, company } = useStore();
  const { openClient } = useUI();
  const [period, setPeriod] = useState(defaultPeriod);
  const [view, setView] = useState("revenue");
  const metrics = periodMetrics(appointments, clients, expenses, period.start, period.end);
  const ranking = serviceRanking(appointments, services, period.start, period.end);
  const performance = professionalPerformance(professionals, appointments, period.start, period.end);
  const series = revenueSeries(appointments, period.start, period.end, "day");
  const byWeekday = useMemo(
    () => WEEKDAYS.map((day) => {
      const items = appointments.filter(
        (a) => a.status === "completed" && a.date >= period.start && a.date <= period.end && fromISO(a.date).getDay() === day.index
      );
      return { label: day.short, receita: Math.round(sum(items, netValue)), atendimentos: items.length };
    }).sort((a, b) => WEEKDAYS.findIndex((d) => d.short === a.label) - WEEKDAYS.findIndex((d) => d.short === b.label)),
    [appointments, period]
  );
  const byCategory = useMemo(() => {
    const grouped = /* @__PURE__ */ new Map();
    appointments.filter((a) => a.status === "completed" && a.date >= period.start && a.date <= period.end).forEach((appointment) => {
      appointment.serviceIds.forEach((id) => {
        const service = services.find((s) => s.id === id);
        if (!service) return;
        grouped.set(service.category, (grouped.get(service.category) ?? 0) + service.price);
      });
    });
    return [...grouped.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [appointments, services, period]);
  const heatmap = useMemo(() => {
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const counts = /* @__PURE__ */ new Map();
    appointments.filter((a) => !["cancelled", "no_show"].includes(a.status) && a.date >= period.start && a.date <= period.end).forEach((appointment) => {
      const jsDay = fromISO(appointment.date).getDay();
      const row = jsDay === 0 ? 6 : jsDay - 1;
      const hour = Number(appointment.start.split(":")[0]);
      const key = `${row}-${hour}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const max = Math.max(1, ...counts.values());
    return { days, hours, counts, max };
  }, [appointments, period]);
  const topClients = useMemo(
    () => clients.map((client) => ({ client, stats: getClientStats(client, appointments, services) })).sort((a, b) => b.stats.totalSpent - a.stats.totalSpent).slice(0, 6),
    [clients, appointments, services]
  );
  const statusCounts = useMemo(
    () => ["completed", "confirmed", "scheduled", "cancelled", "no_show"].map((status) => ({
      status,
      count: appointments.filter((a) => a.date >= period.start && a.date <= period.end && a.status === status).length
    })),
    [appointments, period]
  );
  const clientSeries = useMemo(
    () => Array.from({ length: 6 }, (_, index) => {
      const date = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth() - 5 + index, 1);
      const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
      return {
        mes: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        novos: clients.filter((c) => c.createdAt.startsWith(key)).length
      };
    }),
    [clients]
  );
  const exportReport = () => {
    downloadCSV(`barberpro-relatorio-${period.start}-${period.end}.csv`, [
      [`Relatório executivo — ${company.name}`],
      [`Período: ${period.start} a ${period.end}`],
      [],
      ["Receita", metrics.revenue],
      ["Despesas", metrics.expenses],
      ["Lucro", metrics.profit],
      ["Ticket médio", metrics.ticket],
      ["Atendimentos", metrics.completed],
      ["Novos clientes", metrics.newClients],
      [],
      ["Serviço", "Quantidade", "Receita"],
      ...ranking.map((item) => [item.service.name, item.count, item.service.price * item.count]),
      [],
      ["Profissional", "Atendimentos", "Receita", "Comissão"],
      ...performance.map((item) => [item.professional.name, item.appointments, item.revenue, item.commission])
    ]);
  };
  return <div className="anim-in">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8e85]"><BarChart3 size={12} /> Inteligência · Relatórios</div>
          <h1 className="text-[25px] font-extrabold tracking-[-0.035em] text-ink">Visão estratégica</h1>
          <p className="mt-0.5 text-[12px] text-[#7c8179]">Dados que mostram onde a operação ganha — e onde pode ganhar mais.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <PeriodFilter value={period} onChange={setPeriod} />
          <Button size="sm" variant="dark" onClick={exportReport}><Download size={13} /> Baixar relatório</Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {[
    { label: "Receita no período", value: brl(metrics.revenue), note: `${metrics.completed} atendimentos` },
    { label: "Ticket médio", value: brl(metrics.ticket), note: `margem ${metrics.revenue ? Math.round(metrics.profit / metrics.revenue * 100) : 0}%` },
    { label: "Novos clientes", value: String(metrics.newClients), note: `base de ${clients.length}` },
    { label: "Taxa de cancelamento", value: `${(metrics.cancelled / Math.max(1, metrics.completed + metrics.cancelled) * 100).toFixed(1)}%`, note: `${metrics.cancelled} cancelados` }
  ].map((item) => <Card key={item.label} className="px-3.5 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-[#9a9d95]">{item.label}</p>
            <p className="num mt-1 text-[19px] font-extrabold tracking-[-0.04em] text-ink">{item.value}</p>
            <p className="text-[8.5px] text-[#a2a69d]">{item.note}</p>
          </Card>)}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader
    title={view === "revenue" ? "Receita no tempo" : "Crescimento de clientes"}
    subtitle={view === "revenue" ? "Evolução diária de faturamento concluído" : "Novos cadastros por mês"}
    action={<Segmented size="sm" value={view} onChange={setView} options={[{ value: "revenue", label: "Receita" }, { value: "clients", label: "Clientes" }]} />}
  />
          <div className="mt-2 h-[230px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              {view === "revenue" ? <BarChart data={series} margin={{ top: 8, right: 14, left: 2, bottom: 0 }} barCategoryGap="24%">
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#f0efe9" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} dy={6} minTickGap={22} />
                  <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={(value) => `${(value / 1e3).toFixed(1)}k`} />
                  <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f8f7f2" }} />
                  <Bar dataKey="receita" radius={[3, 3, 1, 1]} maxBarSize={26}>
                    {series.map((entry, index) => <Cell key={entry.key} fill={index === series.length - 1 ? "var(--brand)" : "#c8d3ba"} />)}
                  </Bar>
                </BarChart> : <BarChart data={clientSeries} margin={{ top: 8, right: 14, left: 2, bottom: 0 }} barCategoryGap="34%">
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#f0efe9" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} dy={6} className="capitalize" />
                  <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                  <Tooltip content={<ClientsTooltip />} cursor={{ fill: "#f8f7f2" }} />
                  <Bar dataKey="novos" radius={[4, 4, 1, 1]} fill="#a8bb8c" maxBarSize={42} />
                </BarChart>}
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader title="Receita por categoria" subtitle="Mix do faturamento no período" />
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} paddingAngle={3} strokeWidth={0}>
                  {byCategory.map((entry, index) => <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<PaymentTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 px-4 pb-3">
            {byCategory.slice(0, 5).map((entry, index) => <div key={entry.name} className="flex items-center gap-2 text-[10px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                <span className="text-[#6d726a]">{entry.name}</span>
                <span className="num ml-auto font-bold text-ink">{brl(entry.value, true)}</span>
              </div>)}
            {!byCategory.length && <p className="py-3 text-center text-[10px] text-[#9a9d95]">Sem faturamento no período.</p>}
          </div>
        </Card>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader title="Receita por dia da semana" subtitle="Identifique os dias mais fortes" />
          <div className="h-[180px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byWeekday} margin={{ top: 8, right: 12, left: 2, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#f0efe9" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} dy={5} />
                <YAxis tickLine={false} axisLine={false} width={38} tickFormatter={(value) => `${(value / 1e3).toFixed(0)}k`} />
                <Tooltip content={<MoneyTooltip />} cursor={{ fill: "#f8f7f2" }} />
                <Bar dataKey="receita" radius={[3, 3, 1, 1]} fill="#b9c9a5" maxBarSize={30}>
                  {byWeekday.map((entry, index) => <Cell key={entry.label} fill={index === byWeekday.indexOf([...byWeekday].sort((a, b) => b.receita - a.receita)[0]) ? "var(--brand)" : "#c8d3ba"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader title="Mapa de calor da agenda" subtitle="Concentração de atendimentos por dia e horário" action={<Badge className="border-[#dfe6d2] bg-[#f4f8ea] text-[#637a42]">{heatmap.max} máx.</Badge>} />
          <div className="px-4 pb-3 pt-2">
            <div className="grid gap-1" style={{ gridTemplateColumns: "34px repeat(11, minmax(0, 1fr))" }}>
              <div />
              {heatmap.hours.map((hour) => <span key={hour} className="text-center text-[7.5px] font-semibold text-[#a2a69d]">{hour}h</span>)}
              {heatmap.days.map((day, rowIndex) => <div key={day} className="contents">
                  <span className="flex items-center text-[8px] font-bold text-[#8a8e85]">{day}</span>
                  {heatmap.hours.map((hour) => {
    const value = heatmap.counts.get(`${rowIndex}-${hour}`) ?? 0;
    const intensity = value / heatmap.max;
    return <div
      key={`${day}-${hour}`}
      title={`${day} às ${hour}h · ${value} atendimentos`}
      className="aspect-square rounded-[3px] transition hover:scale-110"
      style={{
        backgroundColor: value === 0 ? "#f4f3ee" : `color-mix(in srgb, var(--brand) ${Math.max(22, intensity * 100)}%, #f4f3ee)`
      }}
    />;
  })}
                </div>)}
            </div>
            <div className="mt-2.5 flex items-center justify-end gap-1 text-[8px] text-[#a2a69d]">
              Menos <span className="h-2 w-2 rounded-sm bg-[#f4f3ee]" /><span className="h-2 w-2 rounded-sm bg-[#e8efd7]" /><span className="h-2 w-2 rounded-sm bg-[#cadba8]" /><span className="h-2 w-2 rounded-sm bg-[var(--brand)]" /> Mais
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader title="Serviços campeões" subtitle={`Ranking de ${period.start} a ${period.end}`} action={<TrendingUp size={14} className="text-[#a2a69d]" />} />
          <div className="mt-2 divide-y divide-[#f3f2ec] px-4">
            {ranking.slice(0, 5).map((item, index) => <div key={item.service.id} className="flex items-center gap-2.5 py-2.5">
                <span className={`num flex h-5 w-5 shrink-0 items-center justify-center rounded text-[8.5px] font-extrabold ${index === 0 ? "bg-ink text-[var(--brand)]" : "bg-[#f4f3ee] text-[#8a8e85]"}`}>{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-ink">{item.service.name}</p>
                  <p className="text-[9px] text-[#9a9d95]">{item.service.category} · {brl(item.service.price)}</p>
                </div>
                <div className="text-right">
                  <p className="num text-[10.5px] font-bold text-ink">{item.count}x</p>
                  <p className="text-[8.5px] text-[#9a9d95]">{brl(item.service.price * item.count, true)}</p>
                </div>
              </div>)}
            {!ranking.length && <p className="py-6 text-center text-[10.5px] text-[#9a9d95]">Sem serviços vendidos no período.</p>}
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader title="Desempenho da equipe" subtitle="Receita e atendimentos no período" />
          <div className="mt-2 divide-y divide-[#f3f2ec] px-4">
            {performance.slice(0, 5).map((item) => <div key={item.professional.id} className="flex items-center gap-2 py-2.5">
                <Avatar name={item.professional.name} src={item.professional.avatar} size={25} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-semibold text-ink">{item.professional.name}</p>
                  <p className="text-[8.5px] text-[#9a9d95]">{item.appointments} atend. · {brl(item.ticket)} ticket</p>
                </div>
                <span className="num text-[10px] font-bold text-ink">{brl(item.revenue, true)}</span>
              </div>)}
            {!performance.length && <p className="py-6 text-center text-[10.5px] text-[#9a9d95]">Sem dados da equipe.</p>}
          </div>
          <div className="mx-4 mb-3 mt-1 grid grid-cols-5 gap-1">
            {statusCounts.map((entry) => <div key={entry.status} className="rounded-md bg-[#faf9f5] px-1 py-1.5 text-center" title={entry.status}>
                <p className="num text-[11px] font-extrabold text-ink">{entry.count}</p>
                <p className="truncate text-[7px] capitalize text-[#9a9d95]">{entry.status.replace("_", " ")}</p>
              </div>)}
          </div>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader title="Top clientes" subtitle="Por valor investido" action={<Users size={14} className="text-[#a2a69d]" />} />
          <div className="mt-2 divide-y divide-[#f3f2ec] px-4">
            {topClients.slice(0, 4).map(({ client, stats }) => <button key={client.id} onClick={() => openClient(client.id)} className="flex w-full items-center gap-2 py-2 text-left">
                <Avatar name={client.name} size={24} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-semibold text-ink">{client.name}</p>
                  <p className="text-[8.5px] text-[#9a9d95]">{stats.visits} visitas</p>
                </div>
                <div className="text-right">
                  <p className="num text-[9.5px] font-bold text-ink">{brl(stats.totalSpent, true)}</p>
                  {stats.tier === "vip" && <Star size={9} className="ml-auto text-[#c7a23c]" fill="#c7a23c" />}
                </div>
              </button>)}
          </div>
          <button onClick={() => openClient(topClients[0]?.client.id ?? "")} className="mx-4 mb-3 mt-1 flex w-[calc(100%-32px)] items-center justify-center gap-1 rounded-lg border border-[#e7e5dc] py-1.5 text-[9px] font-bold text-[#6d726a] transition hover:bg-[#f8f7f2]">
            Ver base completa <ArrowUpRight size={10} />
          </button>
        </Card>
      </div>
    </div>;
}
function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-[#e5e3da] bg-white px-3 py-2 shadow-xl">
      <p className="text-[9.5px] capitalize text-[#9a9d95]">{label}</p>
      <p className="num text-[12px] font-extrabold text-ink">{brl(payload[0].value)}</p>
      {payload[0].payload.atendimentos !== void 0 && <p className="text-[9px] text-[#8a8e85]">{payload[0].payload.atendimentos} atendimentos</p>}
    </div>;
}
function ClientsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-[#e5e3da] bg-white px-3 py-2 shadow-xl">
      <p className="text-[9.5px] capitalize text-[#9a9d95]">{label}</p>
      <p className="num text-[12px] font-extrabold text-ink">{payload[0].value} novos</p>
    </div>;
}
function PaymentTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-[#e5e3da] bg-white px-3 py-2 shadow-xl">
      <p className="text-[9.5px] text-[#9a9d95]">{payload[0].name}</p>
      <p className="num text-[12px] font-extrabold text-ink">{brl(payload[0].value)}</p>
    </div>;
}
export {
  Reports as default
};
