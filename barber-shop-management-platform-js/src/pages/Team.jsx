import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowUpRight,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  Wallet
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Dropdown,
  EmptyState,
  Field,
  Input,
  MenuItem,
  Modal,
  Progress,
  Switch
} from "@/components/ui";
import { brl, todayISO, toISO, uid } from "@/lib/utils";
import { professionalPerformance } from "@/lib/selectors";
const emptyForm = {
  name: "",
  role: "Barbeiro",
  phone: "",
  email: "",
  avatar: "",
  commission: "40",
  goal: "8000",
  specialties: "",
  active: true,
  color: "#C9F158"
};
function Team() {
  const { professionals, appointments, addProfessional, updateProfessional, deleteProfessional, company } = useStore();
  const { toast, openAppointment } = useUI();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const monthStart = toISO(new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1));
  const performance = useMemo(() => professionalPerformance(professionals, appointments, monthStart, todayISO()), [professionals, appointments, monthStart]);
  const totalRevenue = performance.reduce((acc, item) => acc + item.revenue, 0);
  const totalCommission = performance.reduce((acc, item) => acc + item.commission, 0);
  const activeCount = professionals.filter((p) => p.active).length;
  const chartData = performance.map((item) => ({
    name: item.professional.name.split(" ")[0],
    fullName: item.professional.name,
    receita: Math.round(item.revenue)
  }));
  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, color: company.brand.primary });
    setError("");
    setModalOpen(true);
  };
  const openEdit = (professional) => {
    setEditing(professional);
    setForm({
      name: professional.name,
      role: professional.role,
      phone: professional.phone,
      email: professional.email,
      avatar: professional.avatar ?? "",
      commission: String(professional.commission),
      goal: String(professional.goal),
      specialties: professional.specialties.join(", "),
      active: professional.active,
      color: professional.color
    });
    setError("");
    setModalOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) return setError("Informe o nome do profissional.");
    const payload = {
      name: form.name.trim(),
      role: form.role,
      phone: form.phone,
      email: form.email,
      avatar: form.avatar || void 0,
      commission: Number(form.commission) || 40,
      goal: Number(form.goal) || 8e3,
      specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean),
      active: form.active,
      color: form.color,
      rating: editing?.rating ?? 4.8,
      hiredAt: editing?.hiredAt ?? todayISO()
    };
    if (editing) {
      updateProfessional(editing.id, payload);
      toast("Perfil do profissional atualizado.", "success", "Equipe");
    } else {
      addProfessional({ ...payload, id: uid("pro"), companyId: company.id });
      toast(`${payload.name} entrou para a equipe.`, "success", "Novo barbeiro");
    }
    setModalOpen(false);
  };
  return <div className="anim-in">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8e85]"><Users size={12} /> Pessoas · Equipe</div>
          <h1 className="text-[25px] font-extrabold tracking-[-0.035em] text-ink">A equipe por trás das cadeiras</h1>
          <p className="mt-0.5 text-[12px] text-[#7c8179]">Metas, comissionamento e desempenho individual em tempo real.</p>
        </div>
        <Button onClick={openNew}><Plus size={15} /> Adicionar profissional</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="relative overflow-hidden bg-ink text-white xl:col-span-4">
          <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full blur-3xl" style={{ background: "color-mix(in srgb, var(--brand) 22%, transparent)" }} />
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">Time em operação</p>
                <p className="num mt-1 text-[30px] font-extrabold leading-none tracking-[-0.05em]">{activeCount}<span className="text-[16px] text-white/35">/{professionals.length}</span></p>
              </div>
              <div className="flex -space-x-2">
                {professionals.slice(0, 4).map((professional) => <Avatar key={professional.id} name={professional.name} src={professional.avatar} size={32} className="ring-2 ring-ink" />)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/[0.06] px-2.5 py-2">
                <p className="text-[8.5px] font-semibold uppercase tracking-[0.06em] text-white/35">Receita do mês</p>
                <p className="num mt-0.5 text-[13px] font-extrabold text-[var(--brand)]">{brl(totalRevenue, true)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.06] px-2.5 py-2">
                <p className="text-[8.5px] font-semibold uppercase tracking-[0.06em] text-white/35">Comissões</p>
                <p className="num mt-0.5 text-[13px] font-extrabold text-white">{brl(totalCommission, true)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[9px] text-white/40">
              <Sparkles size={11} className="text-[var(--brand)]" />
              Ticket médio da equipe de {brl(performance.reduce((acc, p) => acc + p.ticket, 0) / Math.max(1, performance.length))}
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-8">
          <div className="flex items-center justify-between px-4 pt-3.5">
            <div>
              <h3 className="text-[12.5px] font-bold text-ink">Receita por profissional</h3>
              <p className="text-[10px] text-[#9a9d95]">Mês atual · {chartData.length} barbeiros</p>
            </div>
            <Badge className="border-[#dfe6d2] bg-[#f4f8ea] text-[#637a42]"><TrendingUp size={10} /> Performance</Badge>
          </div>
          <div className="mt-1 h-[146px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 6, right: 12, left: 0, bottom: 0 }} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#f0efe9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} dy={4} />
                <YAxis tickLine={false} axisLine={false} width={38} tickFormatter={(value) => `${(value / 1e3).toFixed(0)}k`} />
                <Tooltip cursor={{ fill: "#f8f7f2" }} content={<TeamTooltip />} />
                <Bar dataKey="receita" radius={[4, 4, 2, 2]} maxBarSize={44}>
                  {chartData.map((entry, index) => <Cell key={entry.fullName} fill={index === 0 ? "var(--brand)" : "#dde2d2"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {!professionals.length ? <Card className="mt-3"><EmptyState icon={<UserRound size={22} />} title="Sua equipe está vazia" description="Adicione barbeiros para distribuir agendamentos e acompanhar metas." action={<Button size="sm" onClick={openNew}><Plus size={13} /> Adicionar</Button>} /></Card> : <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {professionals.map((professional) => {
    const stats = performance.find((item) => item.professional.id === professional.id);
    const completedMonth = appointments.filter((a) => a.professionalId === professional.id && a.status === "completed" && a.date >= monthStart);
    const future = appointments.filter((a) => a.professionalId === professional.id && a.date >= todayISO() && ["scheduled", "confirmed"].includes(a.status)).length;
    const goalProgress = stats ? Math.min(100, stats.goalProgress) : 0;
    return <Card key={professional.id} className={`group relative overflow-hidden transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_18px_40px_-28px_rgba(16,19,16,0.45)] ${!professional.active ? "opacity-60" : ""}`}>
                <div className="relative h-[52px] overflow-hidden" style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${professional.color} 38%, #101310), #101310)` }}>
                  <div className="pointer-events-none absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle at 20% 120%, white 0, transparent 40%), radial-gradient(circle at 80% -20%, white 0, transparent 35%)" }} />
                  <div className="relative flex items-center justify-between px-3 pt-2">
                    <Badge className="border-white/15 bg-white/10 text-white/75">{professional.active ? "Ativo" : "Inativo"}</Badge>
                    <Dropdown
      align="right"
      panelClassName="w-[178px]"
      trigger={() => <button className="rounded-md p-1 text-white/60 transition hover:bg-white/15 hover:text-white" aria-label="Ações do profissional"><MoreHorizontal size={15} /></button>}
    >
                      <MenuItem icon={<Pencil size={13} />} onClick={() => openEdit(professional)}>Editar perfil</MenuItem>
                      <MenuItem icon={<CalendarDays size={13} />} onClick={() => navigate("/agenda")}>Ver agenda</MenuItem>
                      <MenuItem icon={<Target size={13} />} onClick={() => {
      updateProfessional(professional.id, { active: !professional.active });
      toast(professional.active ? "Profissional desativado." : "Profissional reativado.", "info", professional.name);
    }}>
                        {professional.active ? "Desativar" : "Reativar"}
                      </MenuItem>
                      <div className="my-1 h-px bg-[#f0efe9]" />
                      <MenuItem icon={<Trash2 size={13} />} danger onClick={() => setDeleting(professional)}>Remover da equipe</MenuItem>
                    </Dropdown>
                  </div>
                </div>
                <div className="-mt-5 px-4">
                  <Avatar name={professional.name} src={professional.avatar} size={44} className="ring-[3px] ring-white" />
                </div>
                <div className="px-4 pb-3 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-extrabold tracking-[-0.01em] text-ink">{professional.name}</h3>
                      <p className="truncate text-[9.5px] text-[#8a8e85]">{professional.role}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-[#f0e3b8] bg-[#fbf4dd] px-1.5 py-[2px] text-[9px] font-bold text-[#8e6b1d]">
                      <Star size={9} fill="#8e6b1d" /> {professional.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {professional.specialties.slice(0, 3).map((specialty) => <span key={specialty} className="rounded border border-[#eceae1] bg-[#faf9f5] px-1.5 py-[2px] text-[8px] font-medium text-[#7c8179]">{specialty}</span>)}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <div className="rounded-lg bg-[#faf9f5] px-2 py-1.5">
                      <p className="text-[7.5px] font-semibold uppercase tracking-[0.04em] text-[#9a9d95]">Receita</p>
                      <p className="num text-[11px] font-extrabold text-ink">{brl(stats?.revenue ?? 0, true)}</p>
                    </div>
                    <div className="rounded-lg bg-[#faf9f5] px-2 py-1.5">
                      <p className="text-[7.5px] font-semibold uppercase tracking-[0.04em] text-[#9a9d95]">Atend.</p>
                      <p className="num text-[11px] font-extrabold text-ink">{completedMonth.length}</p>
                    </div>
                    <div className="rounded-lg bg-[#faf9f5] px-2 py-1.5">
                      <p className="text-[7.5px] font-semibold uppercase tracking-[0.04em] text-[#9a9d95]">Comissão</p>
                      <p className="num text-[11px] font-extrabold text-ink">{professional.commission}%</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[8.5px] font-semibold text-[#8a8e85]">Meta de {brl(professional.goal, true)}</span>
                      <span className="num text-[8.5px] font-bold text-[#5d7042]">{Math.round(goalProgress)}%</span>
                    </div>
                    <Progress value={goalProgress} className="h-1.5" barClassName="bg-[#8daa4d]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#f3f2ec] pt-2.5">
                    <div className="flex items-center gap-2.5 text-[8.5px] text-[#9a9d95]">
                      <span className="flex items-center gap-1"><Phone size={9} /> {professional.phone.slice(-9)}</span>
                      <span className="flex items-center gap-1"><CalendarDays size={9} /> {future} futuros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openAppointment({ professionalId: professional.id })} className="rounded-md border border-[#e4e2d8] px-1.5 py-1 text-[8.5px] font-bold text-[#555a52] transition hover:border-[#c6cdb6] hover:bg-[#f8faf2]">Agendar</button>
                      <button onClick={() => openEdit(professional)} className="rounded-md p-1 text-[#9a9d95] transition hover:bg-[#f2f1ea] hover:text-ink" aria-label="Editar"><ArrowUpRight size={12} /></button>
                    </div>
                  </div>
                </div>
              </Card>;
  })}
          <button onClick={openNew} className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#dcdacf] bg-white/40 p-5 text-center transition hover:border-[#bcc8a6] hover:bg-[#fbfcf7]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4e2d8] bg-white text-[#7c8179]"><Plus size={18} /></span>
            <span className="text-[11.5px] font-bold text-[#555a52]">Adicionar profissional</span>
            <span className="max-w-[170px] text-[9.5px] leading-relaxed text-[#9a9d95]">Convide um barbeiro, defina comissão e meta.</span>
          </button>
        </div>}

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {[
    { label: "Comissões do mês", value: brl(totalCommission), icon: <Wallet size={14} />, note: "Calculado sobre receita concluída" },
    { label: "Atendimentos realizados", value: String(performance.reduce((acc, p) => acc + p.appointments, 0)), icon: <CalendarDays size={14} />, note: "Somente status concluído" },
    { label: "Receita gerada", value: brl(totalRevenue), icon: <TrendingUp size={14} />, note: `Média de ${brl(totalRevenue / Math.max(1, activeCount))} por barbeiro` }
  ].map((item) => <Card key={item.label} className="flex items-start gap-2.5 px-3.5 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#eeede6] bg-[#faf9f5] text-[#7c8179]">{item.icon}</span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#9a9d95]">{item.label}</p>
              <p className="num text-[15px] font-extrabold text-ink">{item.value}</p>
              <p className="text-[8.5px] text-[#a2a69d]">{item.note}</p>
            </div>
          </Card>)}
      </div>

      <Modal
    open={modalOpen}
    onClose={() => setModalOpen(false)}
    title={editing ? "Editar profissional" : "Nova pessoa na equipe"}
    subtitle="Dados de contato, comissão e metas de performance."
    size="lg"
    footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={save}>{editing ? "Salvar alterações" : "Adicionar à equipe"}</Button></>}
  >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Nome completo" required><Input value={form.name} placeholder="Ex.: Diego Farias" onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Cargo / especialidade"><Input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></Field>
          <Field label="Telefone"><Input value={form.phone} placeholder="(11) 99999-9999" onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
          <Field label="E-mail"><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          <Field label="Comissão (%)"><Input type="number" min="0" max="100" value={form.commission} onChange={(event) => setForm({ ...form, commission: event.target.value })} /></Field>
          <Field label="Meta mensal (R$)"><Input type="number" min="0" step="100" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} /></Field>
          <Field label="Especialidades" hint="Separe por vírgulas" className="sm:col-span-2"><Input value={form.specialties} placeholder="Fade, barba clássica, coloração..." onChange={(event) => setForm({ ...form, specialties: event.target.value })} /></Field>
          <Field label="Foto (URL)" hint="Opcional — usamos as iniciais como fallback" className="sm:col-span-2"><Input value={form.avatar} placeholder="https://..." onChange={(event) => setForm({ ...form, avatar: event.target.value })} /></Field>
          <Field label="Cor na agenda"><div className="flex flex-wrap gap-1.5">{[company.brand.primary, "#9DBBFF", "#E6B980", "#D6A6E8", "#9FE3C4", "#FFAD95"].map((color) => <button key={color} type="button" onClick={() => setForm({ ...form, color })} className={`h-7 w-7 rounded-full border-2 transition ${form.color === color ? "border-ink" : "border-white"}`} style={{ backgroundColor: color }} aria-label={color} />)}</div></Field>
          <div className="flex items-end"><div className="w-full rounded-lg border border-[#eeede6] bg-white px-3 py-2"><Switch checked={form.active} onChange={(active) => setForm({ ...form, active })} label="Ativo na agenda" /></div></div>
        </div>
        {error && <p className="mt-3 rounded-lg border border-[#f3d9d4] bg-[#fbeeec] px-3 py-2 text-[11.5px] font-medium text-[#b64c40]">{error}</p>}
      </Modal>

      <ConfirmDialog
    open={!!deleting}
    onClose={() => setDeleting(null)}
    onConfirm={() => {
      if (deleting) {
        deleteProfessional(deleting.id);
        toast("Profissional removido da equipe.", "info", deleting.name);
      }
    }}
    title="Remover profissional"
    description={`${deleting?.name} será removido da equipe. O histórico de atendimentos é preservado, mas os agendamentos futuros precisarão de outro barbeiro.`}
    confirmLabel="Remover"
  />
    </div>;
}
function TeamTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-[#e5e3da] bg-white px-3 py-2 shadow-xl">
      <p className="text-[9.5px] text-[#9a9d95]">{payload[0].payload.fullName}</p>
      <p className="num text-[12px] font-extrabold text-ink">{brl(payload[0].payload.receita)}</p>
    </div>;
}
export {
  Team as default
};
