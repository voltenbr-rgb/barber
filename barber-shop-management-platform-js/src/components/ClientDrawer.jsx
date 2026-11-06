import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarPlus,
  Check,
  Clock3,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Sparkles,
  StickyNote,
  Trash2,
  TrendingUp,
  X
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import {
  appointmentServiceLabel,
  getClientStats,
  netValue
} from "@/lib/selectors";
import { Avatar, Badge, Button, ConfirmDialog, Drawer, Segmented } from "@/components/ui";
import { ClientFormModal } from "@/components/ClientFormModal";
import { brl, fmtDate, fmtLongDate, PAYMENT_META, relativeDay, STATUS_META, TIER_META } from "@/lib/utils";
function ClientDrawer() {
  const { clientId, closeClient, openAppointment, toast } = useUI();
  const { clients, appointments, professionals, services, updateClient, deleteClient } = useStore();
  const client = clients.find((c) => c.id === clientId);
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  useEffect(() => {
    setNotes(client?.notes ?? "");
    setNotesSaved(false);
  }, [client?.id, client?.notes]);
  useEffect(() => {
    setTab("overview");
    setEditing(false);
    setConfirmDelete(false);
  }, [client?.id]);
  const stats = useMemo(
    () => client ? getClientStats(client, appointments, services) : null,
    [client, appointments, services]
  );
  const history = useMemo(
    () => client ? appointments.filter((a) => a.clientId === client.id).sort((a, b) => `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`)) : [],
    [client, appointments]
  );
  if (!client || !stats) return null;
  const preferred = professionals.find((p) => p.id === client.preferredProfessionalId);
  const paid = history.filter((a) => a.status === "completed");
  const byMethod = paid.reduce((acc, a) => {
    const key = a.paymentMethod || "pix";
    acc[key] = (acc[key] || 0) + netValue(a);
    return acc;
  }, {});
  const saveNotes = () => {
    updateClient(client.id, { notes });
    setNotesSaved(true);
    toast("Anotações internas salvas.", "success", client.name.split(" ")[0]);
    window.setTimeout(() => setNotesSaved(false), 2200);
  };
  return <>
      <Drawer open={!!client} onClose={closeClient} width="max-w-[540px]">
        <div className="relative overflow-hidden border-b border-[#2a3327] bg-ink px-5 pb-5 pt-4 text-white">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full blur-2xl" style={{ background: "color-mix(in srgb, var(--brand) 28%, transparent)" }} />
          <div className="relative flex items-start justify-between">
            <Badge className="border-white/15 bg-white/[0.07] text-white/80">{TIER_META[stats.tier].label} · Ficha do cliente</Badge>
            <button onClick={closeClient} className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Fechar ficha">
              <X size={17} />
            </button>
          </div>
          <div className="relative mt-4 flex items-center gap-3.5">
            <Avatar name={client.name} size={58} className="ring-2 ring-white/20" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[19px] font-bold tracking-[-0.02em]">{client.name}</h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/55">
                <span>Cliente desde {fmtDate(client.createdAt, { month: "short", year: "numeric" })}</span>
                {preferred && <span className="flex items-center gap-1"><Sparkles size={10} /> {preferred.name.split(" ")[0]}</span>}
              </p>
            </div>
          </div>
          <div className="relative mt-4 flex flex-wrap gap-1.5">
            <Button size="sm" onClick={() => openAppointment({ clientId: client.id, professionalId: client.preferredProfessionalId || void 0 })}>
              <CalendarPlus size={13} /> Agendar
            </Button>
            <Button size="sm" variant="outline" className="border-white/15 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/[0.12]" onClick={() => setEditing(true)}>
              <Pencil size={12} /> Editar
            </Button>
            <a
    href={`https://wa.me/55${client.whatsapp.replace(/\D/g, "")}`}
    target="_blank"
    rel="noreferrer"
    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-[12px] font-semibold text-white transition hover:bg-white/[0.12]"
  >
              <MessageCircle size={13} /> WhatsApp
            </a>
            <button
    onClick={() => setConfirmDelete(true)}
    className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-white/45 transition hover:bg-white/10 hover:text-[#ffb4a9]"
  >
              <Trash2 size={12} /> Excluir
            </button>
          </div>
        </div>

        <div className="border-b border-[#ebe9e1] bg-white px-5 py-3">
          <div className="grid grid-cols-4 divide-x divide-[#eeede6]">
            {[
    { label: "Visitas", value: String(stats.visits) },
    { label: "Total gasto", value: brl(stats.totalSpent, true) },
    { label: "Ticket médio", value: brl(stats.ticket, true) },
    { label: "Faltas", value: String(history.filter((a) => a.status === "no_show").length) }
  ].map((item) => <div key={item.label} className="px-2 first:pl-0 last:pr-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#9a9d95]">{item.label}</p>
                <p className="num mt-0.5 text-[15px] font-extrabold text-ink">{item.value}</p>
              </div>)}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {stats.nextVisit && <button
    onClick={() => openAppointment({}, stats.nextVisit.id)}
    className="group mb-4 flex w-full items-center gap-3 rounded-xl border border-[#dfe6d2] bg-[#f7faef] px-3.5 py-3 text-left transition hover:border-[#cbd8b6]"
  >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#5e7141] shadow-sm"><Clock3 size={16} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#7b8a62]">Próximo agendamento</span>
                <span className="mt-0.5 block truncate text-[12.5px] font-bold text-ink">
                  {relativeDay(stats.nextVisit.date)} · {stats.nextVisit.start} — {appointmentServiceLabel(stats.nextVisit, services)}
                </span>
              </span>
              <ArrowUpRight size={15} className="shrink-0 text-[#8a9d6d] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>}

          <Segmented
    value={tab}
    onChange={setTab}
    className="mb-4 flex w-full [&>button]:flex-1"
    options={[
      { value: "overview", label: "Visão geral" },
      { value: "history", label: `Histórico (${history.length})` },
      { value: "payments", label: "Pagamentos" },
      { value: "notes", label: "Anotações" }
    ]}
  />

          {tab === "overview" && <div className="space-y-4">
              <div className="rounded-xl border border-[#ebe9e1] bg-white">
                <div className="border-b border-[#eeede6] px-3.5 py-2.5 text-[11px] font-bold text-ink">Contato e dados</div>
                <div className="grid gap-3 px-3.5 py-3.5 sm:grid-cols-2">
                  <InfoLine icon={<Phone size={13} />} label="Telefone" value={client.phone} />
                  <InfoLine icon={<MessageCircle size={13} />} label="WhatsApp" value={client.whatsapp} />
                  <InfoLine icon={<Mail size={13} />} label="E-mail" value={client.email || "Não informado"} />
                  <InfoLine icon={<CalendarPlus size={13} />} label="Nascimento" value={client.birthDate ? fmtDate(client.birthDate, { day: "2-digit", month: "long" }) : "Não informado"} />
                  <InfoLine icon={<MapPin size={13} />} label="Endereço" value={client.address || "Não informado"} className="sm:col-span-2" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#ebe9e1] bg-white p-3.5">
                  <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#8a8e85]"><Sparkles size={12} /> Preferências</p>
                  <p className="text-[11.5px] leading-relaxed text-[#5d625b]">{client.preferences || "Nenhuma preferência registrada."}</p>
                </div>
                <div className="rounded-xl border border-[#ebe9e1] bg-white p-3.5">
                  <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#8a8e85]"><TrendingUp size={12} /> Relacionamento</p>
                  <div className="space-y-1.5 text-[11.5px] text-[#5d625b]">
                    <p>Serviço favorito: <strong className="font-semibold text-ink">{stats.favoriteService}</strong></p>
                    <p>Última visita: <strong className="font-semibold text-ink">{stats.lastVisit ? relativeDay(stats.lastVisit) : "—"}</strong></p>
                    <p>Profissional: <strong className="font-semibold text-ink">{preferred?.name ?? "Sem preferência"}</strong></p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#ebe9e1] bg-white">
                <div className="flex items-center justify-between border-b border-[#eeede6] px-3.5 py-2.5">
                  <span className="text-[11px] font-bold text-ink">Últimos atendimentos</span>
                  <button className="text-[10.5px] font-semibold text-[#7a8b5d] hover:underline" onClick={() => setTab("history")}>Ver todos</button>
                </div>
                <div className="divide-y divide-[#f1f0ea]">
                  {history.slice(0, 3).map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} onClick={() => openAppointment({}, appointment.id)} />)}
                  {!history.length && <p className="px-3.5 py-6 text-center text-[11.5px] text-[#9a9d95]">Nenhum atendimento registrado ainda.</p>}
                </div>
              </div>
            </div>}

          {tab === "history" && <div className="rounded-xl border border-[#ebe9e1] bg-white">
              <div className="flex items-center justify-between border-b border-[#eeede6] px-3.5 py-2.5">
                <span className="text-[11px] font-bold text-ink">Histórico completo</span>
                <span className="text-[10.5px] text-[#8a8e85]">{history.length} registros</span>
              </div>
              <div className="divide-y divide-[#f1f0ea]">
                {history.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} onClick={() => openAppointment({}, appointment.id)} />)}
                {!history.length && <p className="px-3.5 py-6 text-center text-[11.5px] text-[#9a9d95]">Sem histórico por enquanto.</p>}
              </div>
            </div>}

          {tab === "payments" && <div className="space-y-3">
              <div className="rounded-xl border border-[#ebe9e1] bg-white p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#8a8e85]">Total investido</p>
                    <p className="num mt-1 text-[24px] font-extrabold text-ink">{brl(stats.totalSpent)}</p>
                  </div>
                  <Badge className="border-[#d6eddd] bg-[#ecf7ef] text-[#27784c]">{paid.length} pagamentos</Badge>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f0efe9]">
                  <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(byMethod).map(([method, amount]) => <div key={method} className="rounded-xl border border-[#ebe9e1] bg-white px-3.5 py-3">
                    <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[#8a8e85]"><CreditCard size={11} /> {PAYMENT_META[method]?.short ?? method}</p>
                    <p className="num mt-1 text-[15px] font-extrabold text-ink">{brl(amount)}</p>
                  </div>)}
                {!Object.keys(byMethod).length && <p className="col-span-2 rounded-xl border border-dashed border-[#e3e1d8] px-3 py-6 text-center text-[11.5px] text-[#9a9d95]">Nenhum pagamento concluído.</p>}
              </div>
              <div className="rounded-xl border border-[#ebe9e1] bg-white">
                <div className="border-b border-[#eeede6] px-3.5 py-2.5 text-[11px] font-bold text-ink">Pagamentos recentes</div>
                <div className="divide-y divide-[#f1f0ea]">
                  {paid.slice(0, 8).map((appointment) => <div key={appointment.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[11.5px] font-semibold text-ink">{appointmentServiceLabel(appointment, services)}</p>
                        <p className="text-[10px] text-[#9a9d95]">{fmtLongDate(appointment.date)} · {PAYMENT_META[appointment.paymentMethod]?.label ?? "Não informado"}</p>
                      </div>
                      <span className="num shrink-0 text-[11.5px] font-bold text-[#27784c]">{brl(netValue(appointment))}</span>
                    </div>)}
                  {!paid.length && <p className="px-3.5 py-6 text-center text-[11.5px] text-[#9a9d95]">Nenhum pagamento concluído.</p>}
                </div>
              </div>
            </div>}

          {tab === "notes" && <div className="space-y-3">
              <div className="rounded-xl border border-[#ebe9e1] bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4f3ee] text-[#7c8179]"><StickyNote size={14} /></span>
                  <div>
                    <p className="text-[11.5px] font-bold text-ink">Anotações internas</p>
                    <p className="text-[10px] text-[#9a9d95]">Visíveis apenas para a equipe desta barbearia.</p>
                  </div>
                </div>
                <textarea
    value={notes}
    onChange={(event) => setNotes(event.target.value)}
    rows={8}
    placeholder="Escreva observações sobre o cliente, histórico de conversas, alergias, oportunidades..."
    className="w-full resize-y rounded-lg border border-[#e2e0d6] bg-[#fdfdfb] px-3 py-2.5 text-[12px] leading-relaxed text-ink placeholder:text-[#a9aca4] focus:border-[#b8bcae] focus:ring-4 focus:ring-[#101310]/[0.04]"
  />
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="text-[10px] text-[#9a9d95]">{notes.length} caracteres</p>
                  <Button size="sm" onClick={saveNotes}>
                    {notesSaved ? <Check size={13} /> : <Plus size={13} />}
                    {notesSaved ? "Salvo" : "Salvar anotação"}
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-[#e6e5db] bg-[#f7f6f1] px-4 py-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#8a8e85]">Resumo do relacionamento</p>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#5d625b]">
                  {client.name.split(" ")[0]} é cliente desde {fmtLongDate(client.createdAt)}. Já passou pela cadeira {stats.visits} vezes,
                  movimentou {brl(stats.totalSpent)} e tem ticket médio de {brl(stats.ticket)}. Perfil classificado como{" "}
                  <strong className="font-semibold text-ink">{TIER_META[stats.tier].label.toLowerCase()}</strong>.
                </p>
              </div>
            </div>}
        </div>
      </Drawer>

      <ClientFormModal open={editing} onClose={() => setEditing(false)} client={client} />
      <ConfirmDialog
    open={confirmDelete}
    onClose={() => setConfirmDelete(false)}
    onConfirm={() => {
      deleteClient(client.id);
      toast("Cliente e histórico removidos.", "info", client.name.split(" ")[0]);
      closeClient();
    }}
    title="Excluir cliente"
    description={`Essa ação remove ${client.name} e todos os agendamentos vinculados. Não é possível desfazer.`}
    confirmLabel="Excluir cliente"
  />
    </>;
}
function InfoLine({ icon, label, value, className }) {
  return <div className={`flex items-start gap-2 ${className ?? ""}`}>
      <span className="mt-0.5 text-[#a2a69d]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#9a9d95]">{label}</p>
        <p className="mt-0.5 break-words text-[11.5px] font-medium text-[#3f443e]">{value}</p>
      </div>
    </div>;
}
function AppointmentRow({ appointment, onClick }) {
  const { services, professionals } = useStore();
  const meta = STATUS_META[appointment.status];
  const pro = professionals.find((p) => p.id === appointment.professionalId);
  return <button onClick={onClick} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-[#faf9f5]">
      <span className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-[#f5f4ef] text-[#6b7068]">
        <span className="text-[10px] font-extrabold leading-none">{fmtDate(appointment.date, { day: "2-digit" })}</span>
        <span className="mt-0.5 text-[7.5px] font-bold uppercase leading-none">{fmtDate(appointment.date, { month: "short" })}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11.5px] font-semibold text-ink">{appointmentServiceLabel(appointment, services)}</span>
        <span className="block truncate text-[10px] text-[#9a9d95]">{appointment.start} · {pro?.name.split(" ")[0] ?? "Equipe"}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="num text-[11px] font-bold text-ink">{brl(netValue(appointment))}</span>
        <Badge className={meta.chip}>{meta.label}</Badge>
      </span>
    </button>;
}
export {
  ClientDrawer
};
