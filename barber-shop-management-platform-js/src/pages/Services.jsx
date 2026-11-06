import { useMemo, useState } from "react";
import {
  Clock3,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  Scissors,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import {
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
  Select,
  Switch,
  Textarea
} from "@/components/ui";
import { addDays, brl, sum, toISO, uid } from "@/lib/utils";
const CATEGORY_STYLES = {
  Cabelo: { bg: "#eef3e5", text: "#5f7639", icon: "✂️" },
  Barba: { bg: "#f8efe2", text: "#8a6331", icon: "🪒" },
  Combos: { bg: "#eef1fb", text: "#4a6298", icon: "⚡" },
  Coloração: { bg: "#fbeef5", text: "#915374", icon: "🎨" },
  Tratamentos: { bg: "#edf6f3", text: "#3f7568", icon: "💧" },
  Detalhes: { bg: "#f3f0f8", text: "#6b5d89", icon: "✨" }
};
const emptyService = {
  name: "",
  description: "",
  category: "Cabelo",
  duration: "45",
  price: "",
  cost: "",
  active: true
};
function Services() {
  const { services, appointments, addService, updateService, deleteService, company } = useStore();
  const { toast } = useUI();
  const [category, setCategory] = useState("all");
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(emptyService);
  const [error, setError] = useState("");
  const last30 = toISO(addDays(/* @__PURE__ */ new Date(), -29));
  const sales = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    appointments.filter((a) => a.status === "completed" && a.date >= last30).forEach((appointment) => {
      appointment.serviceIds.forEach((id) => {
        const service = services.find((s) => s.id === id);
        if (!service) return;
        const current = map.get(id) ?? { count: 0, revenue: 0 };
        current.count += 1;
        current.revenue += service.price;
        map.set(id, current);
      });
    });
    return map;
  }, [appointments, services, last30]);
  const categories = [...new Set(services.map((s) => s.category))];
  const filtered = services.filter((service) => (category === "all" || service.category === category) && (showInactive || service.active)).sort((a, b) => (sales.get(b.id)?.count ?? 0) - (sales.get(a.id)?.count ?? 0));
  const topSales = Math.max(1, ...filtered.map((service) => sales.get(service.id)?.count ?? 0));
  const monthlyRevenue = sum([...sales.values()], (entry) => entry.revenue);
  const topService = [...filtered].sort((a, b) => (sales.get(b.id)?.count ?? 0) - (sales.get(a.id)?.count ?? 0))[0];
  const openNew = () => {
    setEditing(null);
    setForm(emptyService);
    setError("");
    setModalOpen(true);
  };
  const openEdit = (service) => {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description,
      category: service.category,
      duration: String(service.duration),
      price: String(service.price),
      cost: String(service.cost),
      active: service.active
    });
    setError("");
    setModalOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) return setError("Informe o nome do serviço.");
    if (!form.price || Number(form.price) <= 0) return setError("Informe um preço válido.");
    const payload = {
      name: form.name.trim(),
      description: form.description,
      category: form.category,
      duration: Number(form.duration) || 30,
      price: Number(form.price),
      cost: Number(form.cost) || 0,
      active: form.active
    };
    if (editing) {
      updateService(editing.id, payload);
      toast("Serviço atualizado.", "success", "Catálogo");
    } else {
      addService({ ...payload, id: uid("svc"), companyId: company.id });
      toast(`${payload.name} foi adicionado ao catálogo.`, "success", "Novo serviço");
    }
    setModalOpen(false);
  };
  return <div className="anim-in">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8e85]"><Scissors size={12} /> Catálogo · Serviços</div>
          <h1 className="text-[25px] font-extrabold tracking-[-0.035em] text-ink">Seu catálogo, sua margem</h1>
          <p className="mt-0.5 text-[12px] text-[#7c8179]">Precificação, duração e desempenho de cada experiência oferecida.</p>
        </div>
        <Button onClick={openNew}><Plus size={15} /> Novo serviço</Button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {[
    { label: "Serviços ativos", value: String(services.filter((s) => s.active).length), sub: `${categories.length} categorias`, icon: <Layers size={14} /> },
    { label: "Ticket médio", value: brl(sum(services, (s) => s.price) / Math.max(1, services.length)), sub: "média do catálogo", icon: <Tag size={14} /> },
    { label: "Mais vendido (30d)", value: String(sales.get(topService?.id ?? "")?.count ?? 0), sub: topService?.name ?? "—", icon: <TrendingUp size={14} /> },
    { label: "Receita do catálogo", value: brl(monthlyRevenue, true), sub: "últimos 30 dias", icon: <Sparkles size={14} /> }
  ].map((item, index) => <Card key={item.label} className="flex items-center gap-2.5 px-3.5 py-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${index === 0 ? "bg-[var(--brand-soft)] text-[#4f6230]" : "border border-[#eeede6] bg-[#faf9f5] text-[#7c8179]"}`}>{item.icon}</span>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-[#9a9d95]">{item.label}</p>
              <p className="num text-[16px] font-extrabold leading-tight text-ink">{item.value}</p>
              <p className="truncate text-[8.5px] text-[#a2a69d]">{item.sub}</p>
            </div>
          </Card>)}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-1">
          {["all", ...categories].map((item) => <button
    key={item}
    onClick={() => setCategory(item)}
    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${category === item ? "border-ink bg-ink text-white" : "border-[#e4e2d8] bg-white text-[#6d726a] hover:border-[#cfcdc2]"}`}
  >
              {item === "all" ? "Todos os serviços" : item}
            </button>)}
        </div>
        <button onClick={() => setShowInactive(!showInactive)} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition ${showInactive ? "border-[#cfd6be] bg-[#f5f8ec] text-[#5d7042]" : "border-[#e4e2d8] bg-white text-[#8a8e85]"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${showInactive ? "bg-[#6d8d41]" : "bg-[#c9c7bc]"}`} /> Incluir inativos
        </button>
      </div>

      {!filtered.length ? <Card><EmptyState icon={<Scissors size={22} />} title="Nenhum serviço encontrado" description="Crie seu primeiro serviço para começar a agendar e faturar." action={<Button size="sm" onClick={openNew}><Plus size={13} /> Criar serviço</Button>} /></Card> : <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => {
    const style = CATEGORY_STYLES[service.category] ?? CATEGORY_STYLES.Cabelo;
    const stat = sales.get(service.id) ?? { count: 0, revenue: 0 };
    return <Card key={service.id} className={`group relative overflow-hidden transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_36px_-26px_rgba(16,19,16,0.4)] ${!service.active ? "opacity-60" : ""}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold" style={{ backgroundColor: style.bg, color: style.text }}>
                      <span>{style.icon}</span> {service.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {!service.active && <Badge className="border-[#e5e3da] bg-[#f5f4ef] text-[#9a9d95]">Inativo</Badge>}
                      <Dropdown
      align="right"
      panelClassName="w-[172px]"
      trigger={() => <button className="rounded-md p-1 text-[#a2a69d] transition hover:bg-[#f4f3ee] hover:text-ink" aria-label="Ações do serviço"><MoreHorizontal size={15} /></button>}
    >
                        <MenuItem icon={<Pencil size={13} />} onClick={() => openEdit(service)}>Editar serviço</MenuItem>
                        <MenuItem icon={<Tag size={13} />} onClick={() => {
      updateService(service.id, { active: !service.active });
      toast(service.active ? "Serviço desativado." : "Serviço reativado.", "info", service.name);
    }}>
                          {service.active ? "Desativar" : "Reativar"}
                        </MenuItem>
                        <div className="my-1 h-px bg-[#f0efe9]" />
                        <MenuItem icon={<Trash2 size={13} />} danger onClick={() => setDeleting(service)}>Excluir serviço</MenuItem>
                      </Dropdown>
                    </div>
                  </div>
                  <h3 className="mt-2.5 text-[14px] font-extrabold tracking-[-0.02em] text-ink">{service.name}</h3>
                  <p className="mt-0.5 line-clamp-2 min-h-[28px] text-[10.5px] leading-relaxed text-[#8a8e85]">{service.description}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="num text-[19px] font-extrabold leading-none tracking-[-0.04em] text-ink">{brl(service.price)}</p>
                      <p className="mt-1 flex items-center gap-1 text-[9px] text-[#9a9d95]"><Clock3 size={10} /> {service.duration} min · custo {brl(service.cost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="num text-[12px] font-extrabold text-ink">{stat.count}</p>
                      <p className="text-[8.5px] text-[#9a9d95]">vendas / 30d</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Progress value={stat.count / topSales * 100} className="h-1 flex-1" barClassName={service.active ? "bg-[#9db36b]" : "bg-[#c9c7bc]"} />
                    <span className="num text-[8.5px] font-semibold text-[#8a8e85]">{brl(stat.revenue, true)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[#f3f2ec] bg-[#fcfbf8] px-4 py-2">
                  <span className="text-[9px] text-[#9a9d95]">Margem de {Math.round((service.price - service.cost) / Math.max(1, service.price) * 100)}%</span>
                  <button onClick={() => openEdit(service)} className="text-[9.5px] font-bold text-[#687d47] transition hover:underline">Editar</button>
                </div>
              </Card>;
  })}
          <button onClick={openNew} className="flex min-h-[210px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#dcdacf] bg-white/40 p-5 text-center transition hover:border-[#bcc8a6] hover:bg-[#fbfcf7]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e4e2d8] bg-white text-[#7c8179]"><Plus size={17} /></span>
            <span className="text-[11.5px] font-bold text-[#555a52]">Adicionar novo serviço</span>
            <span className="max-w-[170px] text-[9.5px] leading-relaxed text-[#9a9d95]">Crie experiências e defina preço, duração e categoria.</span>
          </button>
        </div>}

      <Modal
    open={modalOpen}
    onClose={() => setModalOpen(false)}
    title={editing ? "Editar serviço" : "Novo serviço"}
    subtitle="Defina os detalhes para manter o catálogo organizado."
    footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={save}>{editing ? "Salvar alterações" : "Criar serviço"}</Button></>}
  >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Nome do serviço" required className="sm:col-span-2"><Input value={form.name} placeholder="Ex.: Corte Signature" onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Descrição" className="sm:col-span-2"><Textarea rows={2} value={form.description} placeholder="O que está incluso neste serviço?" onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          <Field label="Categoria"><Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["Cabelo", "Barba", "Combos", "Coloração", "Tratamentos", "Detalhes"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
          <Field label="Duração (minutos)"><Input type="number" min="5" step="5" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} /></Field>
          <Field label="Preço (R$)" required><Input type="number" min="0" step="0.01" value={form.price} placeholder="0,00" onChange={(event) => setForm({ ...form, price: event.target.value })} /></Field>
          <Field label="Custo (R$)" hint="Produtos e insumos utilizados"><Input type="number" min="0" step="0.01" value={form.cost} placeholder="0,00" onChange={(event) => setForm({ ...form, cost: event.target.value })} /></Field>
          <div className="rounded-lg border border-[#eeede6] bg-white px-3 py-2.5 sm:col-span-2">
            <Switch checked={form.active} onChange={(active) => setForm({ ...form, active })} label="Serviço ativo" description="Serviços inativos não aparecem ao criar novos agendamentos." />
          </div>
        </div>
        {error && <p className="mt-3 rounded-lg border border-[#f3d9d4] bg-[#fbeeec] px-3 py-2 text-[11.5px] font-medium text-[#b64c40]">{error}</p>}
      </Modal>

      <ConfirmDialog
    open={!!deleting}
    onClose={() => setDeleting(null)}
    onConfirm={() => {
      if (deleting) {
        deleteService(deleting.id);
        toast("Serviço removido do catálogo.", "info", deleting.name);
      }
    }}
    title="Excluir serviço"
    description={`O serviço “${deleting?.name}” será removido do catálogo. Atendimentos históricos continuam registrados.`}
    confirmLabel="Excluir serviço"
  />
    </div>;
}
export {
  Services as default
};
