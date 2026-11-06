import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Plus,
  Rows3,
  Sparkles,
  Users
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Avatar, Badge, Button, Card, EmptyState, MiniSelect, Segmented } from "@/components/ui";
import {
  addDays,
  brl,
  fmtDate,
  fmtLongDate,
  fromISO,
  minutesToTime,
  parseTime,
  STATUS_META,
  sum,
  todayISO,
  toISO
} from "@/lib/utils";
import { appointmentServiceLabel, netValue } from "@/lib/selectors";
function Agenda() {
  const { company, appointments, clients, professionals, services } = useStore();
  const { openAppointment, openClient } = useUI();
  const [selected, setSelected] = useState(todayISO());
  const [view, setView] = useState("day");
  const [proFilter, setProFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const selectedDate = fromISO(selected);
  const weekday = selectedDate.getDay();
  const hours = company.hours[weekday];
  const weekStartDate = addDays(selectedDate, -((weekday + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, index) => toISO(addDays(weekStartDate, index)));
  const activePros = professionals.filter((p) => p.active && (proFilter === "all" || p.id === proFilter));
  const scoped = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesDate = view === "week" || view === "list" ? weekDays.includes(appointment.date) : appointment.date === selected;
      const matchesPro = proFilter === "all" || appointment.professionalId === proFilter;
      const matchesStatus = statusFilter === "all" || statusFilter === "open" && ["scheduled", "confirmed", "in_progress"].includes(appointment.status) || statusFilter === "done" && appointment.status === "completed" || statusFilter === "cancelled" && ["cancelled", "no_show"].includes(appointment.status);
      return matchesDate && matchesPro && matchesStatus;
    });
  }, [appointments, selected, proFilter, statusFilter, view, weekDays]);
  const dayAppointments = appointments.filter((a) => a.date === selected);
  const bookedMinutes = dayAppointments.filter((a) => !["cancelled", "no_show"].includes(a.status)).reduce((acc, a) => acc + (parseTime(a.end) - parseTime(a.start)), 0);
  const openMinutes = Number(hours.open.split(":")[0]) * 60 + Number(hours.open.split(":")[1]);
  const closeMinutes = Number(hours.close.split(":")[0]) * 60 + Number(hours.close.split(":")[1]);
  const capacity = hours.closed ? 0 : (closeMinutes - openMinutes) * Math.max(1, professionals.filter((p) => p.active).length);
  const occupancy = capacity ? Math.min(100, Math.round(bookedMinutes / capacity * 100)) : 0;
  const completedDay = dayAppointments.filter((a) => a.status === "completed");
  const expectedDay = dayAppointments.filter((a) => !["cancelled", "no_show"].includes(a.status));
  const scale = 1.35;
  const timelineHeight = Math.max(320, (closeMinutes - openMinutes) * scale);
  const navigateDate = (direction) => {
    const amount = view === "week" ? direction * 7 : direction;
    setSelected(toISO(addDays(selectedDate, amount)));
  };
  const statusLabel = statusFilter === "all" ? "Todos status" : statusFilter === "open" ? "Em aberto" : statusFilter === "done" ? "Concluídos" : "Cancelados";
  return <div className="anim-in">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8e85]">
            <CalendarDays size={12} /> Operação · Agenda
          </div>
          <h1 className="text-[25px] font-extrabold tracking-[-0.035em] text-ink">Agenda inteligente</h1>
          <p className="mt-0.5 text-[12px] text-[#7c8179]">Organize o dia, evite conflitos e mantenha cada cadeira produtiva.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
    value={view}
    onChange={setView}
    options={[
      { value: "day", label: "Dia", icon: <Clock3 size={12} /> },
      { value: "week", label: "Semana", icon: <CalendarDays size={12} /> },
      { value: "list", label: "Lista", icon: <Rows3 size={12} /> }
    ]}
  />
          <Button onClick={() => openAppointment({ date: selected })} size="sm"><Plus size={14} /> Novo agendamento</Button>
        </div>
      </div>

      {
    /* Date rail + summary */
  }
      <Card className="mb-3 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eeede6] px-3 py-2.5">
          <div className="flex items-center gap-1">
            <button onClick={() => navigateDate(-1)} className="rounded-lg border border-[#e7e5dc] p-1.5 text-[#7c8179] transition hover:bg-[#f5f4ef] hover:text-ink" aria-label="Anterior"><ChevronLeft size={14} /></button>
            <button onClick={() => setSelected(todayISO())} className="rounded-lg border border-[#e7e5dc] px-2.5 py-1.5 text-[10.5px] font-bold text-[#555a52] transition hover:bg-[#f5f4ef]">Hoje</button>
            <button onClick={() => navigateDate(1)} className="rounded-lg border border-[#e7e5dc] p-1.5 text-[#7c8179] transition hover:bg-[#f5f4ef] hover:text-ink" aria-label="Próximo"><ChevronRight size={14} /></button>
            <p className="ml-2 text-[12px] font-bold capitalize text-ink">{view === "week" ? `${fmtDate(weekDays[0])} – ${fmtDate(weekDays[6])}` : fmtLongDate(selected)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-lg border border-[#e7e5dc] bg-white py-0.5 pl-2">
              <Filter size={11} className="text-[#9a9d95]" />
              <MiniSelect
    value={proFilter}
    onChange={setProFilter}
    options={[{ value: "all", label: "Todos barbeiros" }, ...professionals.filter((p) => p.active).map((p) => ({ value: p.id, label: p.name.split(" ")[0] }))]}
    className="[&>select]:border-0 [&>select]:pl-0 [&>svg]:hidden"
  />
            </div>
            <MiniSelect
    value={statusFilter}
    onChange={setStatusFilter}
    options={[
      { value: "all", label: "Todos status" },
      { value: "open", label: "Em aberto" },
      { value: "done", label: "Concluídos" },
      { value: "cancelled", label: "Cancelados" }
    ]}
  />
            <span className="hidden text-[10px] text-[#a2a69d] sm:inline">{statusLabel} · {scoped.length}</span>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar px-2 py-2">
          {weekDays.map((day) => {
    const isToday = day === todayISO();
    const isSelected = day === selected;
    const count = appointments.filter((a) => a.date === day && !["cancelled", "no_show"].includes(a.status)).length;
    return <button
      key={day}
      onClick={() => setSelected(day)}
      className={`group relative flex min-w-[58px] flex-1 flex-col items-center rounded-xl px-1 py-1.5 transition ${isSelected ? "bg-ink text-white" : "hover:bg-[#f6f5f0]"}`}
    >
                <span className={`text-[8.5px] font-bold uppercase tracking-[0.08em] ${isSelected ? "text-white/45" : "text-[#9a9d95]"}`}>
                  {fromISO(day).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                </span>
                <span className={`num mt-0.5 text-[16px] font-extrabold leading-none ${isSelected ? "text-[var(--brand)]" : isToday ? "text-[#4e6b2c]" : "text-ink"}`}>
                  {day.slice(8)}
                </span>
                <span className="mt-1.5 flex h-1 items-center gap-0.5">
                  {Array.from({ length: Math.min(3, count) }).map((_, index) => <span key={index} className={`h-1 w-1 rounded-full ${isSelected ? "bg-[var(--brand)]" : isToday ? "bg-[#7f9c3f]" : "bg-[#c9c7bc]"}`} />)}
                </span>
              </button>;
  })}
        </div>

        <div className="grid grid-cols-2 divide-x divide-[#efeee7] border-t border-[#eeede6] sm:grid-cols-4">
          {[
    { label: "Receita realizada", value: brl(sum(completedDay, netValue)), icon: <CheckCheck size={12} /> },
    { label: "Receita prevista", value: brl(sum(expectedDay, netValue)), icon: <Sparkles size={12} /> },
    { label: "Atendimentos", value: `${dayAppointments.length}`, icon: <Users size={12} /> },
    { label: "Ocupação", value: `${occupancy}%`, icon: <Clock3 size={12} /> }
  ].map((item) => <div key={item.label} className="flex items-center gap-2 px-3.5 py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f5f4ef] text-[#7c8179]">{item.icon}</span>
              <div>
                <p className="text-[8.5px] font-semibold uppercase tracking-[0.06em] text-[#9a9d95]">{item.label}</p>
                <p className="num text-[12px] font-extrabold text-ink">{item.value}</p>
              </div>
            </div>)}
        </div>
      </Card>

      {view === "day" && <Card className="overflow-hidden">
          {hours.closed ? <EmptyState icon={<CalendarDays size={22} />} title="Estabelecimento fechado neste dia" description="Ajuste o horário de funcionamento nas configurações ou escolha outra data." /> : <div className="overflow-x-auto">
              <div className="flex min-w-[720px]">
                <div className="sticky left-0 z-10 w-[54px] shrink-0 border-r border-[#eeede6] bg-white">
                  <div className="h-[58px] border-b border-[#eeede6]" />
                  <div className="relative" style={{ height: timelineHeight }}>
                    {Array.from({ length: Math.round((closeMinutes - openMinutes) / 60) + 1 }, (_, index) => <div key={index} className="absolute left-0 right-0" style={{ top: index * 60 * scale }}>
                        <span className="num absolute -top-[5px] left-0 w-full pr-2 text-right text-[9px] font-semibold text-[#a2a69d]">
                          {minutesToTime(openMinutes + index * 60)}
                        </span>
                      </div>)}
                  </div>
                </div>
                <div className="flex flex-1">
                  {activePros.map((professional) => {
    const proAppointments = dayAppointments.filter((a) => a.professionalId === professional.id);
    return <div key={professional.id} className="min-w-[170px] flex-1 border-r border-[#eeede6] last:border-r-0">
                        <div className="flex h-[58px] items-center gap-2 border-b border-[#eeede6] px-2.5">
                          <Avatar name={professional.name} src={professional.avatar} size={27} />
                          <div className="min-w-0">
                            <p className="truncate text-[10.5px] font-bold text-ink">{professional.name}</p>
                            <p className="truncate text-[8.5px] text-[#9a9d95]">{proAppointments.length} atendimentos</p>
                          </div>
                          <span className="ml-auto h-2 w-2 rounded-full" style={{ backgroundColor: professional.color }} />
                        </div>
                        <div className="relative bg-[linear-gradient(#faf9f5_1px,transparent_1px)]" style={{ height: timelineHeight, backgroundSize: `100% ${60 * scale}px` }}>
                          {proAppointments.map((appointment) => {
      const top = (parseTime(appointment.start) - openMinutes) * scale;
      const height = Math.max(34, (parseTime(appointment.end) - parseTime(appointment.start)) * scale);
      const client = clients.find((c) => c.id === appointment.clientId);
      const meta = STATUS_META[appointment.status];
      const muted = ["cancelled", "no_show"].includes(appointment.status);
      return <button
        key={appointment.id}
        onClick={() => openAppointment({}, appointment.id)}
        className={`group absolute inset-x-1.5 overflow-hidden rounded-md border border-transparent px-1.5 py-1 text-left transition hover:z-20 hover:border-[#b7c29e] hover:shadow-md ${muted ? "opacity-55" : ""}`}
        style={{
          top: top + 2,
          height: height - 4,
          backgroundColor: `color-mix(in srgb, ${professional.color} 17%, white)`,
          borderLeft: `3px solid ${muted ? "#b9bbb3" : professional.color}`
        }}
        title={`${appointment.start} · ${client?.name} · ${appointmentServiceLabel(appointment, services)}`}
      >
                                <span className={`num block text-[8.5px] font-bold leading-tight ${muted ? "text-[#9a9d95] line-through" : "text-[#4f554c]"}`}>
                                  {appointment.start}–{appointment.end}
                                </span>
                                <span className="block truncate text-[10px] font-bold leading-tight text-ink">{client?.name ?? "Cliente"}</span>
                                {height > 52 && <span className="mt-0.5 block truncate text-[8.5px] leading-tight text-[#6d726a]">{appointmentServiceLabel(appointment, services)}</span>}
                                {height > 74 && <span className="mt-1 flex items-center gap-1">
                                    <span className={`h-1 w-1 rounded-full ${meta.dot}`} />
                                    <span className="truncate text-[7.5px] font-semibold text-[#7c8179]">{meta.label}</span>
                                    <span className="ml-auto num text-[7.5px] font-bold text-[#5d625b]">{brl(netValue(appointment), true)}</span>
                                  </span>}
                              </button>;
    })}
                          {!proAppointments.length && <div className="absolute inset-x-2 top-3 rounded-lg border border-dashed border-[#e4e2d8] py-3 text-center">
                              <p className="text-[8.5px] font-medium text-[#b0b3aa]">Sem horários</p>
                            </div>}
                          <div className="pointer-events-none absolute inset-x-0" style={{ top: 0 }} />
                        </div>
                      </div>;
  })}
                  {!activePros.length && <div className="flex-1 py-16"><EmptyState icon={<Users size={20} />} title="Nenhum profissional selecionado" description="Ajuste o filtro de barbeiro para ver a agenda." /></div>}
                </div>
              </div>
            </div>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eeede6] bg-[#fbfaf7] px-3.5 py-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {Object.entries(STATUS_META).slice(0, 4).map(([key, meta]) => <span key={key} className="flex items-center gap-1 text-[9px] font-medium text-[#8a8e85]"><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}</span>)}
            </div>
            <p className="flex items-center gap-1 text-[9px] text-[#a2a69d]"><Sparkles size={10} /> Clique em um horário para editar ou mudar o status</p>
          </div>
        </Card>}

      {view === "week" && <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-7">
          {weekDays.map((day) => {
    const dayItems = appointments.filter((a) => a.date === day && (proFilter === "all" || a.professionalId === proFilter)).sort((a, b) => a.start.localeCompare(b.start));
    const isToday = day === todayISO();
    return <Card key={day} className={`overflow-hidden ${isToday ? "ring-1 ring-[#c6d5a8]" : ""}`}>
                <div className={`flex items-center justify-between border-b px-2.5 py-2 ${isToday ? "border-[#e2ead3] bg-[#f7faef]" : "border-[#eeede6] bg-white"}`}>
                  <div>
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.08em] text-[#9a9d95]">
                      {fromISO(day).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                    </p>
                    <p className={`num text-[15px] font-extrabold leading-tight ${isToday ? "text-[#4e6b2c]" : "text-ink"}`}>{day.slice(8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="num text-[9px] font-bold text-[#6d726a]">{dayItems.filter((a) => a.status === "completed").length}/{dayItems.length}</p>
                    <p className="text-[7.5px] text-[#a2a69d]">feitos</p>
                  </div>
                </div>
                <div className="min-h-[180px] space-y-1.5 p-1.5">
                  {dayItems.slice(0, 9).map((appointment) => {
      const client = clients.find((c) => c.id === appointment.clientId);
      const professional = professionals.find((p) => p.id === appointment.professionalId);
      const meta = STATUS_META[appointment.status];
      return <button
        key={appointment.id}
        onClick={() => openAppointment({}, appointment.id)}
        className="block w-full rounded-md border-l-[2.5px] bg-[#faf9f5] px-1.5 py-1 text-left transition hover:bg-[#f3f2ec]"
        style={{ borderLeftColor: professional?.color ?? "#c4c7be" }}
      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="num text-[8px] font-bold text-[#8a8e85]">{appointment.start}</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        </div>
                        <p className="truncate text-[9.5px] font-bold leading-tight text-ink">{client?.name.split(" ")[0] ?? "Cliente"}</p>
                        <p className="truncate text-[8px] leading-tight text-[#9a9d95]">{appointmentServiceLabel(appointment, services)}</p>
                      </button>;
    })}
                  {dayItems.length > 9 && <button onClick={() => {
      setSelected(day);
      setView("day");
    }} className="w-full rounded-md py-1 text-center text-[8.5px] font-bold text-[#7a8b5d] hover:bg-[#f5f8ec]">+{dayItems.length - 9} outros</button>}
                  {!dayItems.length && <button onClick={() => openAppointment({ date: day })} className="flex h-[150px] w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#eceade] text-[#b0b3aa] transition hover:border-[#ccd3bb] hover:text-[#7a8b5d]">
                      <Plus size={14} /> <span className="text-[8.5px] font-medium">Adicionar</span>
                    </button>}
                </div>
              </Card>;
  })}
        </div>}

      {view === "list" && <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eeede6] px-4 py-3">
            <div>
              <p className="text-[12px] font-bold text-ink">Atendimentos da semana</p>
              <p className="text-[10px] text-[#9a9d95]">{scoped.length} registros com os filtros atuais</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => openAppointment({ date: selected })}><Plus size={13} /> Novo</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#eeede6] bg-[#fbfaf7] text-[8.5px] font-bold uppercase tracking-[0.08em] text-[#9a9d95]">
                  <th className="px-4 py-2.5">Data / hora</th>
                  <th className="px-3 py-2.5">Cliente</th>
                  <th className="px-3 py-2.5">Serviço</th>
                  <th className="px-3 py-2.5">Profissional</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f2ec]">
                {scoped.sort((a, b) => `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`)).map((appointment) => <tr key={appointment.id} onClick={() => openAppointment({}, appointment.id)} className="cursor-pointer transition hover:bg-[#fbfaf6]">
                    <td className="px-4 py-2.5">
                      <p className="text-[10.5px] font-bold text-ink">{fmtDate(appointment.date)}</p>
                      <p className="num text-[9px] text-[#9a9d95]">{appointment.start} · {appointment.end}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={(event) => {
    event.stopPropagation();
    openClient(appointment.clientId);
  }} className="flex items-center gap-2 text-left">
                        <Avatar name={clients.find((c) => c.id === appointment.clientId)?.name ?? "C"} size={24} />
                        <span className="text-[10.5px] font-semibold text-ink hover:underline">{clients.find((c) => c.id === appointment.clientId)?.name ?? "Cliente"}</span>
                      </button>
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-2.5 text-[10.5px] text-[#6d726a]">{appointmentServiceLabel(appointment, services)}</td>
                    <td className="px-3 py-2.5 text-[10.5px] text-[#6d726a]">{professionals.find((p) => p.id === appointment.professionalId)?.name ?? "—"}</td>
                    <td className="px-3 py-2.5"><Badge className={STATUS_META[appointment.status].chip} dot={STATUS_META[appointment.status].dot}>{STATUS_META[appointment.status].label}</Badge></td>
                    <td className="num px-4 py-2.5 text-right text-[10.5px] font-bold text-ink">{brl(netValue(appointment))}</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          {!scoped.length && <EmptyState icon={<CalendarDays size={20} />} title="Nada por aqui" description="Nenhum agendamento encontrado com os filtros atuais." action={<Button size="sm" onClick={() => {
    setStatusFilter("all");
    setProFilter("all");
  }}>Limpar filtros</Button>} />}
        </Card>}
    </div>;
}
export {
  Agenda as default
};
