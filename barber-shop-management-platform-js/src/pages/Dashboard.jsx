import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Download,
  Plus,
  Scissors,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import {
  appointmentServiceLabel,
  getClientStats,
  occupancyToday,
  periodMetrics,
  professionalPerformance,
  revenueSeries,
  serviceRanking,
  upcomingAppointments
} from "@/lib/selectors";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Progress,
  Segmented
} from "@/components/ui";
import { PeriodFilter, defaultPeriod } from "@/components/PeriodFilter";
import {
  brl,
  downloadCSV,
  fmtDate,
  fmtLongDate,
  addDays,
  pct,
  previousRange,
  relativeDay,
  STATUS_META,
  sum,
  TIER_META,
  todayISO,
  toISO,
  trend
} from "@/lib/utils";
function Dashboard() {
  const { company, clients, services, appointments, professionals, expenses } = useStore();
  const { openAppointment, openClient } = useUI();
  const navigate = useNavigate();
  const [period, setPeriod] = useState(defaultPeriod);
  const [granularity, setGranularity] = useState("day");
  const today = todayISO();
  const now = /* @__PURE__ */ new Date();
  const greeting = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const ownerFirstName = company.owner.split(" ")[0];
  const metrics = useMemo(
    () => periodMetrics(appointments, clients, expenses, period.start, period.end),
    [appointments, clients, expenses, period]
  );
  const todayMetrics = useMemo(
    () => periodMetrics(appointments, clients, expenses, today, today),
    [appointments, clients, expenses, today]
  );
  const yesterday = toISO(addDays(now, -1));
  const yesterdayMetrics = useMemo(
    () => periodMetrics(appointments, clients, expenses, yesterday, yesterday),
    [appointments, clients, expenses, yesterday]
  );
  const previousPeriod = previousRange(period.start, period.end);
  const previousPeriodMetrics = useMemo(
    () => periodMetrics(appointments, clients, expenses, previousPeriod.start, previousPeriod.end),
    [appointments, clients, expenses, previousPeriod.start, previousPeriod.end]
  );
  const monthStart = toISO(new Date(now.getFullYear(), now.getMonth(), 1));
  const lastMonthStart = toISO(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const lastMonthEnd = toISO(new Date(now.getFullYear(), now.getMonth(), 0));
  const monthMetrics = useMemo(
    () => periodMetrics(appointments, clients, expenses, monthStart, today),
    [appointments, clients, expenses, monthStart, today]
  );
  const previousMonthMetrics = useMemo(
    () => periodMetrics(appointments, clients, expenses, lastMonthStart, lastMonthEnd),
    [appointments, clients, expenses, lastMonthStart, lastMonthEnd]
  );
  const series = useMemo(() => {
    if (period.key === "today") {
      const start = toISO(addDays(now, -6));
      return revenueSeries(appointments, start, today, "day");
    }
    return revenueSeries(appointments, period.start, period.end, granularity);
  }, [appointments, period, granularity, today, now]);
  const spark = useMemo(
    () => revenueSeries(appointments, toISO(addDays(now, -6)), today, "day"),
    [appointments, today, now]
  );
  const sparkRevenue = spark.map((point) => point.revenue);
  const todayList = useMemo(
    () => appointments.filter((a) => a.date === today),
    [appointments, today]
  );
  const todayCompleted = todayList.filter((a) => a.status === "completed").length;
  const todayCancelled = todayList.filter((a) => ["cancelled", "no_show"].includes(a.status)).length;
  const todayPending = todayList.filter((a) => ["scheduled", "confirmed", "in_progress"].includes(a.status)).length;
  const occupancy = occupancyToday(appointments, professionals, company.hours);
  const performance = useMemo(
    () => professionalPerformance(professionals, appointments, monthStart, today),
    [professionals, appointments, monthStart, today]
  );
  const ranking = useMemo(
    () => serviceRanking(appointments, services, period.start, period.end).slice(0, 5),
    [appointments, services, period]
  );
  const upcoming = useMemo(() => upcomingAppointments(appointments, 5), [appointments]);
  const activeClients = useMemo(() => {
    const last90 = toISO(addDays(now, -90));
    const ids = new Set(appointments.filter((a) => a.status === "completed" && a.date >= last90).map((a) => a.clientId));
    return clients.filter((client) => ids.has(client.id));
  }, [clients, appointments, now]);
  const vips = useMemo(
    () => clients.map((client) => ({ client, stats: getClientStats(client, appointments, services) })).filter((entry) => entry.stats.totalSpent > 0).sort((a, b) => b.stats.totalSpent - a.stats.totalSpent).slice(0, 4),
    [clients, appointments, services]
  );
  const clientGrowth = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
      return {
        key,
        label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        novos: clients.filter((c) => c.createdAt.startsWith(key)).length
      };
    });
    return months;
  }, [clients, now]);
  const topService = ranking[0];
  const returningRate = clients.length ? Math.round(clients.filter((c) => getClientStats(c, appointments, services).visits > 1).length / clients.length * 100) : 0;
  const revenueTrend = trend(monthMetrics.revenue, previousMonthMetrics.revenue);
  const chartTrend = trend(metrics.revenue, previousPeriodMetrics.revenue);
  const exportDashboard = () => {
    downloadCSV(`barberpro-dashboard-${period.start}-a-${period.end}.csv`, [
      ["Indicador", "Valor"],
      ["Empresa", company.name],
      ["Período", `${period.start} a ${period.end}`],
      ["Faturamento", metrics.revenue],
      ["Atendimentos concluídos", metrics.completed],
      ["Ticket médio", metrics.ticket],
      ["Novos clientes", metrics.newClients],
      ["Cancelamentos", metrics.cancelled],
      [],
      ["Barbeiro", "Atendimentos", "Receita"],
      ...performance.map((item) => [item.professional.name, item.appointments, item.revenue]),
      [],
      ["Serviço", "Vendidos", "Receita"],
      ...serviceRanking(appointments, services, period.start, period.end).map((item) => [item.service.name, item.count, item.revenue])
    ]);
  };
  return <div className="anim-in">
      {
    /* Greeting */
  }
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[#dfe4d2] bg-white px-2 py-[3px] text-[9px] font-bold uppercase tracking-[0.1em] text-[#64754a]">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#6d8d41]" /> Operação ao vivo
            </span>
            <span className="text-[10.5px] capitalize text-[#9a9d95]">{fmtLongDate(today)}</span>
          </div>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            {greeting}, {ownerFirstName}.{" "}
            <span className="display text-[30px] font-normal italic tracking-normal text-[#727868] sm:text-[34px]">tudo em ordem?</span>
          </h1>
          <p className="mt-1 text-[12px] text-[#7c8179]">
            Este é o pulso da <strong className="font-semibold text-[#4c5149]">{company.name}</strong> — {todayPending} atendimentos ainda por acontecer hoje.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <PeriodFilter value={period} onChange={setPeriod} />
          <Button variant="outline" size="sm" onClick={exportDashboard} className="h-8 px-2.5" title="Exportar CSV">
            <Download size={13} /> <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button size="sm" onClick={() => openAppointment()} className="h-8">
            <Plus size={14} /> Novo agendamento
          </Button>
        </div>
      </div>

      {
    /* KPI grid */
  }
      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
    featured
    label="Faturamento hoje"
    value={brl(todayMetrics.revenue)}
    icon={<CircleDollarSign size={15} />}
    trend={trend(todayMetrics.revenue, yesterdayMetrics.revenue)}
    trendLabel="vs. ontem"
    spark={sparkRevenue}
    sub={`${todayCompleted} atendimentos concluídos`}
    footer={<span className="text-white/45">{brl(monthMetrics.revenue)} no mês</span>}
  />
        <KpiCard
    label="Faturamento mensal"
    value={brl(monthMetrics.revenue)}
    icon={<Wallet size={15} />}
    trend={revenueTrend}
    trendLabel="vs. mês anterior"
    spark={sparkRevenue.map((value, index) => value * (1.1 + index * 0.05))}
    sub={`Meta mensal: ${brl(Math.max(32e3, monthMetrics.revenue * 1.35), true)}`}
    footer={<div className="mt-1 w-full">
              <Progress value={monthMetrics.revenue / Math.max(32e3, monthMetrics.revenue * 1.35) * 100} className="h-1" />
            </div>}
  />
        <KpiCard
    label="Agendamentos hoje"
    value={String(todayList.length)}
    icon={<CalendarCheck2 size={15} />}
    trend={trend(todayList.length, appointments.filter((a) => a.date === yesterday).length)}
    trendLabel="vs. ontem"
    spark={spark.map((point) => point.count)}
    sub={`${todayCompleted} concluídos · ${todayPending} em aberto`}
    footer={<div className="flex items-center gap-2.5 text-[9.5px]">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#2f8f5b]" /> {todayCompleted} feitos</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#3d7bfa]" /> {todayPending} abertos</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#cf5a4d]" /> {todayCancelled} cancel.</span>
            </div>}
  />
        <KpiCard
    label="Clientes cadastrados"
    value={String(clients.length)}
    icon={<Users size={15} />}
    trend={trend(metrics.newClients, previousPeriodMetrics.newClients)}
    trendLabel={`${metrics.newClients} novos no período`}
    spark={clientGrowth.map((month) => month.novos)}
    sub={`${activeClients.length} ativos nos últimos 90 dias`}
    footer={<span className="flex items-center gap-1 text-[9.5px] text-[#7c8179]">
              <Sparkles size={10} className="text-[#8a9b62]" /> Taxa de retorno de {returningRate}%
            </span>}
  />
      </div>

      {
    /* Chart + occupancy */
  }
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="overflow-hidden xl:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">Faturamento</h3>
                <Badge className="border-[#e7e5dc] bg-[#f7f6f1] text-[#7c8179]">Dados reais</Badge>
              </div>
              <div className="mt-1.5 flex items-end gap-2.5">
                <p className="num text-[25px] font-extrabold leading-none tracking-[-0.04em] text-ink">{brl(metrics.revenue)}</p>
                <span className={`mb-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-[2px] text-[10px] font-bold ${chartTrend >= 0 ? "bg-[#edf7ee] text-[#2f8f5b]" : "bg-[#fbeeec] text-[#cf5a4d]"}`}>
                  {chartTrend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {pct(chartTrend)}
                </span>
              </div>
              <p className="mt-1 text-[10.5px] text-[#9a9d95]">
                {period.key === "today" ? "Últimos 7 dias (contexto)" : "Comparado ao período anterior"} · {metrics.completed} atendimentos
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Segmented
    size="sm"
    value={granularity}
    onChange={setGranularity}
    options={[
      { value: "day", label: "Dia" },
      { value: "week", label: "Semana" },
      { value: "month", label: "Mês" }
    ]}
  />
              <button onClick={() => navigate("/relatorios")} className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10.5px] font-bold text-[#64754a] transition hover:bg-[#f4f7ec]">
                Relatório <ArrowRight size={11} />
              </button>
            </div>
          </div>

          <div className="mt-3 h-[236px] w-full px-1.5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.42} />
                    <stop offset="80%" stopColor="var(--brand)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#eeede6" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} dy={8} interval="preserveStartEnd" minTickGap={26} />
                <YAxis
    tickLine={false}
    axisLine={false}
    width={42}
    tickFormatter={(value) => value >= 1e3 ? `${(value / 1e3).toFixed(1)}k` : String(value)}
  />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "#c8ccb8", strokeDasharray: "3 4" }} />
                <Area
    type="monotone"
    dataKey="revenue"
    stroke="#8aa338"
    strokeWidth={2.2}
    fill="url(#revenueFill)"
    activeDot={{ r: 4, fill: "#101310", stroke: "#fff", strokeWidth: 2 }}
  />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f0efe9] px-5 py-2.5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              {[
    { label: "Ticket médio", value: brl(metrics.ticket) },
    { label: "Concluídos", value: String(metrics.completed) },
    { label: "Cancelados", value: String(metrics.cancelled) },
    { label: "Novos clientes", value: String(metrics.newClients) }
  ].map((item) => <div key={item.label} className="flex items-center gap-1.5">
                  <span className="text-[9.5px] text-[#9a9d95]">{item.label}</span>
                  <span className="num text-[11px] font-bold text-[#3f443e]">{item.value}</span>
                </div>)}
            </div>
            <div className="flex items-center gap-1 text-[9.5px] font-medium text-[#9a9d95]">
              <span className="h-2 w-2 rounded-sm bg-[var(--brand)]" /> Receita
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden xl:col-span-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f7f9f0] to-transparent" />
          <CardHeader
    title="Ocupação de hoje"
    subtitle="Cadeiras em uso vs. capacidade"
    action={<Badge className="border-[#dfe6d2] bg-[#f4f8ea] text-[#637a42]">{professionals.filter((p) => p.active).length} barbeiros</Badge>}
  />
          <div className="relative flex items-center justify-center py-4">
            <div
    className="relative flex h-[148px] w-[148px] items-center justify-center rounded-full"
    style={{
      background: `conic-gradient(var(--brand) ${occupancy.percent * 3.6}deg, #efeee7 0deg)`
    }}
  >
              <div className="flex h-[118px] w-[118px] flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_#f0efe9]">
                <p className="num text-[30px] font-extrabold leading-none tracking-[-0.05em] text-ink">{occupancy.percent}%</p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#9a9d95]">ocupado</p>
              </div>
              <span className="absolute right-[10px] top-[14px] flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[var(--brand)] shadow-lg">
                <Zap size={11} />
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 px-4">
            <div className="rounded-lg border border-[#eeede6] bg-[#fbfaf6] px-2.5 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#9a9d95]">Minutos ocupados</p>
              <p className="num mt-0.5 text-[13px] font-extrabold text-ink">{occupancy.bookedMinutes} min</p>
            </div>
            <div className="rounded-lg border border-[#eeede6] bg-[#fbfaf6] px-2.5 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#9a9d95]">Horário livre</p>
              <p className="num mt-0.5 text-[13px] font-extrabold text-ink">
                {professionals.length ? Math.round(occupancy.capacityMinutes / professionals.length / 60) - Math.round(occupancy.bookedMinutes / professionals.length / 60) : 0}h
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-[#f0efe9] px-4 py-3">
            <div className="flex -space-x-1.5">
              {professionals.filter((p) => p.active).slice(0, 5).map((professional) => <Avatar key={professional.id} name={professional.name} src={professional.avatar} size={23} className="ring-2 ring-white" />)}
            </div>
            <button onClick={() => navigate("/agenda")} className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#5d7042] transition hover:gap-1.5">
              Ver agenda <ChevronRight size={12} />
            </button>
          </div>
        </Card>
      </div>

      {
    /* Upcoming, team, services */
  }
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="flex flex-col xl:col-span-5">
          <CardHeader
    title="Próximos agendamentos"
    subtitle="A fila que vai sentar na cadeira"
    action={<button onClick={() => navigate("/agenda")} className="flex items-center gap-1 rounded-md border border-[#e7e5dc] px-2 py-1 text-[10px] font-bold text-[#555a52] transition hover:bg-[#f7f6f1]">
                Agenda <ArrowUpRight size={11} />
              </button>}
  />
          <div className="mt-2.5 flex-1 divide-y divide-[#f3f2ec]">
            {upcoming.map((appointment) => {
    const client = clients.find((c) => c.id === appointment.clientId);
    const professional = professionals.find((p) => p.id === appointment.professionalId);
    const meta = STATUS_META[appointment.status];
    return <button
      key={appointment.id}
      onClick={() => openAppointment({}, appointment.id)}
      className="group flex w-full items-center gap-2.5 px-4 py-2 text-left transition hover:bg-[#fbfaf6]"
    >
                  <div className="w-[38px] shrink-0 border-r border-[#efeee7] pr-2">
                    <p className="num text-[12px] font-extrabold leading-none text-ink">{appointment.start}</p>
                    <p className="mt-1 text-[8.5px] leading-none text-[#a2a69d]">{appointment.end}</p>
                  </div>
                  <Avatar name={client?.name ?? "Cliente"} size={29} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-bold text-ink">{client?.name ?? "Cliente"}</p>
                    <p className="truncate text-[9.5px] text-[#8a8e85]">{appointmentServiceLabel(appointment, services)}</p>
                  </div>
                  <div className="hidden items-center gap-1.5 sm:flex">
                    <Avatar name={professional?.name ?? "Profissional"} src={professional?.avatar} size={20} />
                    <span className="max-w-[62px] truncate text-[9.5px] font-medium text-[#6d726a]">{professional?.name.split(" ")[0]}</span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[8.5px] font-semibold text-[#9a9d95]">{appointment.date === today ? "Hoje" : relativeDay(appointment.date)}</span>
                    <Badge className={meta.chip} dot={meta.dot}>{meta.label}</Badge>
                  </div>
                </button>;
  })}
            {!upcoming.length && <div className="flex flex-col items-center gap-2 px-5 py-10 text-center"><CalendarDays size={20} className="text-[#c4c7be]" /><p className="text-[11.5px] text-[#9a9d95]">Nenhum agendamento futuro.</p></div>}
          </div>
          <button onClick={() => openAppointment()} className="m-3 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#dcdacf] py-2 text-[10.5px] font-bold text-[#7c8179] transition hover:border-[#c2c9b1] hover:bg-[#fafbf6] hover:text-[#556244]">
            <Plus size={12} /> Encaixar novo atendimento
          </button>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader
    title="Desempenho da equipe"
    subtitle={`Receita por barbeiro · ${fmtDate(monthStart)} – ${fmtDate(today)}`}
    action={<button onClick={() => navigate("/equipe")} className="rounded p-1 text-[#9a9d95] transition hover:bg-[#f5f4ef] hover:text-ink"><ArrowUpRight size={14} /></button>}
  />
          <div className="mt-3 divide-y divide-[#f3f2ec] px-4">
            {performance.slice(0, 4).map((item, index) => <div key={item.professional.id} className="py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Avatar name={item.professional.name} src={item.professional.avatar} size={30} />
                    {index === 0 && <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-[var(--brand)] text-[7px] font-extrabold text-ink">1</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-bold text-ink">{item.professional.name}</p>
                    <p className="truncate text-[9px] text-[#9a9d95]">{item.appointments} atendimentos · {item.professional.commission}% com.</p>
                  </div>
                  <div className="text-right">
                    <p className="num text-[11.5px] font-extrabold text-ink">{brl(item.revenue, true)}</p>
                    <p className="text-[8.5px] font-medium text-[#9a9d95]">meta {Math.round(item.goalProgress)}%</p>
                  </div>
                </div>
                <Progress
    value={item.goalProgress}
    className="ml-[40px] mt-1.5 h-1 w-[calc(100%-40px)]"
    barClassName={index === 0 ? "bg-[#7f9c3f]" : "bg-[#b9c3a5]"}
  />
              </div>)}
            {!performance.length && <p className="py-8 text-center text-[11.5px] text-[#9a9d95]">Equipe ainda não cadastrada.</p>}
          </div>
          <div className="mx-4 mb-3 mt-1 flex items-center justify-between rounded-lg bg-[#f8f8f1] px-3 py-2">
            <span className="text-[9.5px] font-medium text-[#7c8179]">Receita total da equipe</span>
            <span className="num text-[11.5px] font-extrabold text-ink">{brl(sum(performance, (p) => p.revenue))}</span>
          </div>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader title="Serviços em alta" subtitle="Mais procurados no período" action={<span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f5f4ef] text-[#7c8179]"><Scissors size={12} /></span>} />
          <div className="mt-3 space-y-2.5 px-4">
            {ranking.map((item, index) => <div key={item.service.id}>
                <div className="flex items-center gap-2">
                  <span className={`num flex h-4 w-4 shrink-0 items-center justify-center rounded text-[8px] font-extrabold ${index === 0 ? "bg-ink text-[var(--brand)]" : "bg-[#f4f3ee] text-[#8a8e85]"}`}>{index + 1}</span>
                  <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-ink">{item.service.name}</p>
                  <span className="num shrink-0 text-[10px] font-bold text-[#6d726a]">{item.count}</span>
                </div>
                <div className="ml-6 mt-1 flex items-center gap-2">
                  <Progress value={item.count / (ranking[0]?.count || 1) * 100} className="h-1 flex-1" barClassName={index === 0 ? "bg-[var(--brand)]" : "bg-[#d9ddca]"} />
                  <span className="num shrink-0 text-[8.5px] text-[#9a9d95]">{brl(item.revenue, true)}</span>
                </div>
              </div>)}
            {!ranking.length && <p className="py-8 text-center text-[11.5px] text-[#9a9d95]">Sem vendas no período.</p>}
          </div>
          <div className="mx-4 mb-3 mt-4 rounded-lg border border-[#eceade] bg-[#faf9f3] p-2.5">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.07em] text-[#8a8e85]"><TrendingUp size={11} /> Destaque</p>
            <p className="mt-1 text-[10px] leading-relaxed text-[#5d625b]">
              <strong className="font-bold text-ink">{topService?.service.name ?? "Corte Signature"}</strong> lidera com {topService?.count ?? 0} vendas no período.
            </p>
          </div>
        </Card>
      </div>

      {
    /* Clients growth + VIPs */
  }
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader
    title="Crescimento de clientes"
    subtitle="Novos cadastros nos últimos 6 meses"
    action={<div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[9.5px] text-[#8a8e85]"><span className="h-2 w-2 rounded-sm bg-[var(--brand)]" /> Novos</span>
                <Badge className="border-[#dfe6d2] bg-[#f4f8ea] text-[#637a42]">+{clientGrowth.at(-1)?.novos ?? 0} este mês</Badge>
              </div>}
  />
          <div className="mt-2 h-[168px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientGrowth} margin={{ top: 8, right: 14, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#f0efe9" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} dy={6} className="capitalize" />
                <YAxis tickLine={false} axisLine={false} width={24} allowDecimals={false} />
                <Tooltip content={<ClientsTooltip />} cursor={{ fill: "#f7f6f0" }} />
                <Bar dataKey="novos" radius={[4, 4, 2, 2]} fill="#d5ddc3" maxBarSize={38}>
                  {clientGrowth.map((entry, index) => <Cell key={entry.key} fill={index === clientGrowth.length - 1 ? "var(--brand)" : "#dde2d2"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader
    title="Clientes de alto valor"
    subtitle="Sua base VIP e o potencial de cada um"
    action={<button onClick={() => navigate("/clientes")} className="text-[10px] font-bold text-[#64754a] hover:underline">Ver CRM</button>}
  />
          <div className="mt-2 divide-y divide-[#f3f2ec] px-4">
            {vips.map(({ client, stats }) => <button key={client.id} onClick={() => openClient(client.id)} className="group flex w-full items-center gap-2.5 py-2.5 text-left">
                <Avatar name={client.name} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[11.5px] font-bold text-ink">{client.name}</p>
                    <Badge className={TIER_META[stats.tier].className}>{TIER_META[stats.tier].label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[9px] text-[#9a9d95]">{stats.visits} visitas · {stats.favoriteService}</p>
                </div>
                <div className="text-right">
                  <p className="num text-[11.5px] font-extrabold text-ink">{brl(stats.totalSpent, true)}</p>
                  <p className="text-[8.5px] text-[#9a9d95]">total gasto</p>
                </div>
                <ChevronRight size={12} className="shrink-0 text-[#c9ccc3] transition group-hover:translate-x-0.5 group-hover:text-[#7c8179]" />
              </button>)}
          </div>
          <div className="m-3 mt-1 grid grid-cols-3 gap-2">
            {[
    { label: "Ticket médio", value: brl(metrics.ticket, true) },
    { label: "Recorrência", value: `${returningRate}%` },
    { label: "Novos", value: String(metrics.newClients) }
  ].map((item) => <div key={item.label} className="rounded-lg border border-[#eeede6] bg-[#fbfaf6] px-2.5 py-2 text-center">
                <p className="text-[8.5px] font-semibold uppercase tracking-[0.05em] text-[#9a9d95]">{item.label}</p>
                <p className="num mt-0.5 text-[12px] font-extrabold text-ink">{item.value}</p>
              </div>)}
          </div>
        </Card>
      </div>
    </div>;
}
function KpiCard({
  label,
  value,
  icon,
  trend: trendValue,
  trendLabel,
  spark,
  sub,
  footer,
  featured
}) {
  const positive = trendValue >= 0;
  const data = spark.length ? spark.map((v, i) => ({ i, v })) : [{ i: 0, v: 0 }, { i: 1, v: 0 }];
  return <Card className={`group relative overflow-hidden transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_40px_-24px_rgba(16,19,16,0.35)] ${featured ? "border-[#1e251c] bg-ink text-white" : ""}`}>
      {featured && <>
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full blur-3xl" style={{ background: "color-mix(in srgb, var(--brand) 24%, transparent)" }} />
          <div className="pointer-events-none absolute right-3 top-3 h-14 w-14 rounded-full border border-white/[0.06]" />
          <div className="pointer-events-none absolute right-6 top-6 h-9 w-9 rounded-full border border-white/[0.08]" />
        </>}
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <p className={`text-[10.5px] font-semibold ${featured ? "text-white/55" : "text-[#8a8e85]"}`}>{label}</p>
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${featured ? "bg-white/[0.08] text-[var(--brand)]" : "border border-[#eeede6] bg-[#faf9f5] text-[#7c8179]"}`}>{icon}</span>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <p className={`num text-[25px] font-extrabold leading-none tracking-[-0.045em] ${featured ? "text-white" : "text-ink"}`}>{value}</p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-[2px] text-[9.5px] font-bold ${featured ? positive ? "bg-[var(--brand)]/15 text-[var(--brand)]" : "bg-[#fbeeec]/15 text-[#ffb4a9]" : positive ? "bg-[#edf7ee] text-[#2f8f5b]" : "bg-[#fbeeec] text-[#cf5a4d]"}`}>
            {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(trendValue).toFixed(0)}%
          </span>
          <span className={`text-[9px] ${featured ? "text-white/40" : "text-[#9a9d95]"}`}>{trendLabel}</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <p className={`text-[9.5px] leading-tight ${featured ? "text-white/40" : "text-[#9a9d95]"}`}>{sub}</p>
          <div className="h-[30px] w-[74px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`kpi-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={featured ? "var(--brand)" : positive ? "#7f9c3f" : "#cf5a4d"} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={featured ? "var(--brand)" : positive ? "#7f9c3f" : "#cf5a4d"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={featured ? "var(--brand)" : positive ? "#7f9c3f" : "#cf5a4d"} strokeWidth={1.6} fill={`url(#kpi-${label.replace(/\s/g, "")})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {footer && <div className={`mt-2 border-t pt-2 ${featured ? "border-white/[0.08]" : "border-[#f2f1ea]"}`}>{footer}</div>}
      </div>
    </Card>;
}
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-[#e5e3da] bg-white px-3 py-2 shadow-xl">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#9a9d95]">{label}</p>
      <p className="num mt-0.5 text-[13px] font-extrabold text-ink">{brl(payload[0].value)}</p>
      <p className="text-[9.5px] text-[#8a8e85]">{payload[0].payload.count} atendimentos</p>
    </div>;
}
function ClientsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-[#e5e3da] bg-white px-3 py-2 shadow-xl">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] capitalize text-[#9a9d95]">{label}</p>
      <p className="num mt-0.5 text-[13px] font-extrabold text-ink">{payload[0].value} novos clientes</p>
    </div>;
}
export {
  Dashboard as default
};
