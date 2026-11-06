import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRoundPlus,
  Users,
  X
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
  MenuItem,
  Select
} from "@/components/ui";
import { ClientFormModal } from "@/components/ClientFormModal";
import { appointmentServiceLabel, getClientStats } from "@/lib/selectors";
import {
  brl,
  downloadCSV,
  fmtDate,
  relativeDay,
  TIER_META,
  todayISO
} from "@/lib/utils";
const PAGE_SIZE = 10;
const TIER_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "vip", label: "VIP" },
  { value: "frequent", label: "Frequentes" },
  { value: "new", label: "Novos" },
  { value: "inactive", label: "Inativos" }
];
function Clients() {
  const { clients, appointments, services, professionals, deleteClient } = useStore();
  const { openClient, openAppointment, toast } = useUI();
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("all");
  const [proId, setProId] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const enriched = useMemo(
    () => clients.map((client) => ({ client, stats: getClientStats(client, appointments, services) })),
    [clients, appointments, services]
  );
  const counts = useMemo(
    () => ({
      all: clients.length,
      vip: enriched.filter((entry) => entry.stats.tier === "vip").length,
      frequent: enriched.filter((entry) => entry.stats.tier === "frequent").length,
      new: enriched.filter((entry) => entry.stats.tier === "new").length,
      inactive: enriched.filter((entry) => entry.stats.tier === "inactive").length
    }),
    [clients.length, enriched]
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter(({ client, stats }) => {
      const matchQuery = !q || client.name.toLowerCase().includes(q) || client.phone.toLowerCase().includes(q) || client.email.toLowerCase().includes(q) || client.whatsapp.toLowerCase().includes(q);
      const matchTier = tier === "all" || stats.tier === tier;
      const matchPro = proId === "all" || client.preferredProfessionalId === proId;
      return matchQuery && matchTier && matchPro;
    }).sort((a, b) => {
      if (sort === "name") return a.client.name.localeCompare(b.client.name);
      if (sort === "spent") return b.stats.totalSpent - a.stats.totalSpent;
      if (sort === "visits") return b.stats.visits - a.stats.visits;
      if (sort === "last") return (b.stats.lastVisit ?? "").localeCompare(a.stats.lastVisit ?? "");
      return b.client.createdAt.localeCompare(a.client.createdAt);
    });
  }, [enriched, search, tier, proId, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const totalSpent = enriched.reduce((acc, entry) => acc + entry.stats.totalSpent, 0);
  const exportCsv = () => {
    downloadCSV("barberpro-clientes.csv", [
      ["Nome", "Telefone", "E-mail", "Classificação", "Visitas", "Total gasto", "Última visita", "Desde"],
      ...filtered.map(({ client, stats }) => [
        client.name,
        client.phone,
        client.email,
        TIER_META[stats.tier].label,
        stats.visits,
        stats.totalSpent.toFixed(2),
        stats.lastVisit ?? "",
        client.createdAt
      ])
    ]);
    toast(`${filtered.length} clientes exportados em CSV.`, "success", "Exportação concluída");
  };
  return <div className="anim-in">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8e85]">
            <Users size={12} /> Relacionamento · CRM
          </div>
          <h1 className="text-[25px] font-extrabold tracking-[-0.035em] text-ink">Clientes</h1>
          <p className="mt-0.5 text-[12px] text-[#7c8179]">Conheça cada cliente, entenda o histórico e aumente a recorrência.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}><Download size={13} /> Exportar</Button>
          <Button size="sm" onClick={() => {
    setEditing(null);
    setFormOpen(true);
  }}><Plus size={14} /> Novo cliente</Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {[
    { label: "Base total", value: String(clients.length), sub: `${counts.new} novos este mês`, icon: <Users size={14} /> },
    { label: "Clientes VIP", value: String(counts.vip), sub: "alto valor e recorrência", icon: <UserRoundPlus size={14} /> },
    { label: "Frequentes", value: String(counts.frequent), sub: "retornam com constância", icon: <MessageCircle size={14} /> },
    { label: "Receita histórica", value: brl(totalSpent, true), sub: "em atendimentos concluídos", icon: <ArrowUpDown size={14} /> }
  ].map((item, index) => <Card key={item.label} className="flex items-center gap-2.5 px-3.5 py-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${index === 0 ? "bg-[var(--brand-soft)] text-[#4f6230]" : "border border-[#eeede6] bg-[#faf9f5] text-[#7c8179]"}`}>
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-[#9a9d95]">{item.label}</p>
              <p className="num text-[17px] font-extrabold leading-tight text-ink">{item.value}</p>
              <p className="truncate text-[8.5px] text-[#a2a69d]">{item.sub}</p>
            </div>
          </Card>)}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#eeede6] px-3.5 py-3">
          <div className="relative min-w-[180px] flex-1 sm:max-w-[300px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9a9d95]" />
            <input
    value={search}
    onChange={(event) => {
      setSearch(event.target.value);
      setPage(1);
    }}
    placeholder="Buscar por nome, telefone ou e-mail..."
    className="h-8 w-full rounded-lg border border-[#e5e3da] bg-white pl-8 pr-3 text-[11.5px] text-ink placeholder:text-[#a9aca4] focus:border-[#b8bcae] focus:ring-2 focus:ring-[#101310]/[0.03]"
  />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#e5e3da] bg-white py-0.5 pl-2">
            <Filter size={11} className="text-[#9a9d95]" />
            <select
    value={proId}
    onChange={(event) => {
      setProId(event.target.value);
      setPage(1);
    }}
    className="h-7 cursor-pointer bg-transparent pr-6 text-[10.5px] font-semibold text-[#555a52] focus:outline-none"
  >
              <option value="all">Barbeiro preferido</option>
              {professionals.map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
            </select>
          </div>
          <Select value={sort} onChange={(event) => setSort(event.target.value)} className="!h-8 w-auto !text-[10.5px] font-semibold !text-[#555a52]">
            <option value="recent">Mais recentes</option>
            <option value="name">Nome A–Z</option>
            <option value="spent">Maior valor gasto</option>
            <option value="visits">Mais visitas</option>
            <option value="last">Última visita</option>
          </Select>
          {(search || tier !== "all" || proId !== "all") && <button onClick={() => {
    setSearch("");
    setTier("all");
    setProId("all");
  }} className="flex items-center gap-1 text-[10px] font-semibold text-[#b64c40] hover:underline"><X size={11} /> Limpar</button>}
          <span className="ml-auto text-[9.5px] text-[#9a9d95]">{filtered.length} clientes</span>
        </div>

        <div className="flex overflow-x-auto border-b border-[#eeede6] px-2 no-scrollbar">
          {TIER_FILTERS.map((item) => <button
    key={item.value}
    onClick={() => {
      setTier(item.value);
      setPage(1);
    }}
    className={`relative flex items-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-[10.5px] font-semibold transition ${tier === item.value ? "text-ink" : "text-[#8a8e85] hover:text-[#555a52]"}`}
  >
              {item.label}
              <span className={`num rounded-full px-1.5 py-[1px] text-[8px] font-bold ${tier === item.value ? "bg-[var(--brand-soft)] text-[#55683a]" : "bg-[#f4f3ee] text-[#9a9d95]"}`}>
                {counts[item.value]}
              </span>
              {tier === item.value && <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full bg-[#7f9c3f]" />}
            </button>)}
        </div>

        {visible.length === 0 ? <EmptyState icon={<Users size={22} />} title="Nenhum cliente encontrado" description="Tente ajustar os filtros ou cadastre um novo cliente para começar." action={<Button size="sm" onClick={() => {
    setEditing(null);
    setFormOpen(true);
  }}><Plus size={13} /> Cadastrar cliente</Button>} /> : <>
            {
    /* Desktop table */
  }
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#eeede6] bg-[#fbfaf7] text-[8.5px] font-bold uppercase tracking-[0.08em] text-[#9a9d95]">
                    <th className="px-4 py-2.5">Cliente</th>
                    <th className="px-3 py-2.5">Contato</th>
                    <th className="px-3 py-2.5">Classificação</th>
                    <th className="px-3 py-2.5 text-center">Visitas</th>
                    <th className="px-3 py-2.5 text-right">Total gasto</th>
                    <th className="px-3 py-2.5">Última visita</th>
                    <th className="px-3 py-2.5">Próximo</th>
                    <th className="px-4 py-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f3ee]">
                  {visible.map(({ client, stats }) => <tr key={client.id} className="group cursor-pointer transition hover:bg-[#fbfaf6]" onClick={() => openClient(client.id)}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={client.name} size={30} />
                          <div className="min-w-0">
                            <p className="truncate text-[11.5px] font-bold text-ink">{client.name}</p>
                            <p className="truncate text-[9px] text-[#9a9d95]">Cliente desde {fmtDate(client.createdAt, { month: "short", year: "numeric" })}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-[10.5px] font-medium text-[#555a52]">{client.phone}</p>
                        <p className="max-w-[170px] truncate text-[9px] text-[#9a9d95]">{client.email}</p>
                      </td>
                      <td className="px-3 py-2.5"><Badge className={TIER_META[stats.tier].className}>{TIER_META[stats.tier].label}</Badge></td>
                      <td className="num px-3 py-2.5 text-center text-[10.5px] font-semibold text-[#555a52]">{stats.visits}</td>
                      <td className="num px-3 py-2.5 text-right text-[10.5px] font-bold text-ink">{brl(stats.totalSpent)}</td>
                      <td className="px-3 py-2.5 text-[10px] text-[#6d726a]">{stats.lastVisit ? relativeDay(stats.lastVisit) : "—"}</td>
                      <td className="px-3 py-2.5">
                        {stats.nextVisit ? <div>
                            <p className="text-[9.5px] font-semibold text-[#3f6a3f]">{relativeDay(stats.nextVisit.date)}</p>
                            <p className="max-w-[110px] truncate text-[8.5px] text-[#9a9d95]">{stats.nextVisit.start} · {appointmentServiceLabel(stats.nextVisit, services)}</p>
                          </div> : <span className="text-[9.5px] text-[#b0b3aa]">Sem agendamento</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right" onClick={(event) => event.stopPropagation()}>
                        <Dropdown
    align="right"
    panelClassName="w-[168px]"
    trigger={() => <button className="rounded-md p-1.5 text-[#9a9d95] transition hover:bg-[#f1f0e9] hover:text-ink" aria-label="Ações do cliente">
                              <MoreHorizontal size={15} />
                            </button>}
  >
                          <MenuItem icon={<UserRoundPlus size={13} />} onClick={() => openClient(client.id)}>Abrir ficha</MenuItem>
                          <MenuItem icon={<CalendarPlusIcon />} onClick={() => openAppointment({ clientId: client.id, professionalId: client.preferredProfessionalId || void 0 })}>Agendar</MenuItem>
                          <MenuItem icon={<Pencil size={13} />} onClick={() => {
    setEditing(client);
    setFormOpen(true);
  }}>Editar cadastro</MenuItem>
                          <div className="my-1 h-px bg-[#f0efe9]" />
                          <MenuItem icon={<Trash2 size={13} />} danger onClick={() => setDeleting(client)}>Excluir cliente</MenuItem>
                        </Dropdown>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {
    /* Mobile cards */
  }
            <div className="divide-y divide-[#f4f3ee] md:hidden">
              {visible.map(({ client, stats }) => <button key={client.id} onClick={() => openClient(client.id)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-[#faf9f5]">
                  <Avatar name={client.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[12px] font-bold text-ink">{client.name}</p>
                      <Badge className={TIER_META[stats.tier].className}>{TIER_META[stats.tier].label}</Badge>
                    </div>
                    <p className="text-[10px] text-[#8a8e85]">{client.phone}</p>
                    <p className="text-[9px] text-[#9a9d95]">{stats.visits} visitas · {brl(stats.totalSpent)}</p>
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-[#c2c4bc]" />
                </button>)}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eeede6] bg-[#fbfaf7] px-3.5 py-2.5">
              <p className="text-[9.5px] text-[#9a9d95]">
                Mostrando <strong className="font-semibold text-[#555a52]">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}</strong> de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button disabled={safePage === 1} onClick={() => setPage(safePage - 1)} className="rounded-md border border-[#e7e5dc] p-1 text-[#7c8179] transition hover:bg-[#f5f4ef] disabled:opacity-35"><ChevronLeft size={13} /></button>
                {Array.from({ length: pages }, (_, index) => index + 1).slice(Math.max(0, safePage - 2), Math.max(0, safePage - 2) + 5).map((pageNumber) => <button key={pageNumber} onClick={() => setPage(pageNumber)} className={`h-6 w-6 rounded-md text-[10px] font-bold transition ${pageNumber === safePage ? "bg-ink text-white" : "text-[#7c8179] hover:bg-[#f2f1ea]"}`}>{pageNumber}</button>)}
                <button disabled={safePage === pages} onClick={() => setPage(safePage + 1)} className="rounded-md border border-[#e7e5dc] p-1 text-[#7c8179] transition hover:bg-[#f5f4ef] disabled:opacity-35"><ChevronRight size={13} /></button>
              </div>
            </div>
          </>}
      </Card>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
    { title: "Aniversariantes do mês", text: `${clients.filter((c) => c.birthDate.slice(5, 7) === todayISO().slice(5, 7) && c.birthDate).length} clientes fazem aniversário`, icon: "🎂" },
    { title: "Oportunidade de retorno", text: `${counts.inactive} clientes inativos há mais de 60 dias`, icon: "🔁" },
    { title: "Potencial VIP", text: `${enriched.filter((entry) => entry.stats.totalSpent > 500 && entry.stats.tier !== "vip").length} clientes perto do próximo nível`, icon: "✨" }
  ].map((item) => <Card key={item.title} className="flex items-start gap-2.5 px-3.5 py-3">
            <span className="text-[16px]">{item.icon}</span>
            <div>
              <p className="text-[10.5px] font-bold text-ink">{item.title}</p>
              <p className="mt-0.5 text-[10px] text-[#8a8e85]">{item.text}</p>
            </div>
          </Card>)}
      </div>

      <ClientFormModal open={formOpen} onClose={() => setFormOpen(false)} client={editing} onSaved={(id) => {
    if (!editing) openClient(id);
  }} />
      <ConfirmDialog
    open={!!deleting}
    onClose={() => setDeleting(null)}
    onConfirm={() => {
      if (!deleting) return;
      deleteClient(deleting.id);
      toast("Cliente removido da base.", "info", deleting.name.split(" ")[0]);
      setDeleting(null);
    }}
    title="Excluir cliente"
    description={`Todos os agendamentos e o histórico de ${deleting?.name ?? "cliente"} serão removidos permanentemente.`}
    confirmLabel="Excluir cliente"
  />
    </div>;
}
function CalendarPlusIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M12 14v4M10 16h4" />
    </svg>;
}
export {
  Clients as default
};
