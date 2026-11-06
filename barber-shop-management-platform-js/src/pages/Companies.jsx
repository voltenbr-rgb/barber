import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Wallet
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Dropdown,
  Field,
  Input,
  MenuItem,
  Modal,
  Select
} from "@/components/ui";
import { CompanyAvatar } from "@/components/Brand";
import { DEFAULT_HOURS, PALETTE, makeCompany, makeHours, makeStarterRecords } from "@/data/demo";
import { netValue } from "@/lib/selectors";
import { brl, fmtDate, sum, WEEKDAYS } from "@/lib/utils";
const emptyForm = {
  name: "",
  slogan: "",
  owner: "",
  document: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  state: "",
  plan: "Essential",
  primary: PALETTE[0].primary,
  secondary: PALETTE[0].secondary,
  theme: "minimal",
  logo: ""
};
function Companies() {
  const { company: currentCompany, companies, clients, appointments, professionals, services, setActiveCompany, addCompany, updateCompany, deleteCompany, duplicateCompany, restoreDemo, addProfessional, addService } = useStore();
  const activeCompanyId = currentCompany.id;
  const { toast } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [hours, setHours] = useState(makeHours());
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openNew();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const metricsByCompany = useMemo(
    () => Object.fromEntries(
      companies.map((company) => {
        const companyAppointments = appointments.filter((a) => a.companyId === company.id);
        const revenue = sum(companyAppointments.filter((a) => a.status === "completed"), netValue);
        return [company.id, {
          clients: clients.filter((c) => c.companyId === company.id).length,
          professionals: professionals.filter((p) => p.companyId === company.id).length,
          services: services.filter((s) => s.companyId === company.id).length,
          appointments: companyAppointments.length,
          revenue
        }];
      })
    ),
    [companies, clients, professionals, services, appointments]
  );
  const totalRevenue = Object.values(metricsByCompany).reduce((acc, item) => acc + item.revenue, 0);
  const totalClients = clients.length;
  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setHours(makeHours());
    setError("");
    setModalOpen(true);
  };
  const openEdit = (company) => {
    setEditing(company);
    setForm({
      name: company.name,
      slogan: company.slogan,
      owner: company.owner,
      document: company.document,
      phone: company.phone,
      whatsapp: company.whatsapp,
      email: company.email,
      address: company.address,
      city: company.city,
      state: company.state,
      plan: company.plan,
      primary: company.brand.primary,
      secondary: company.brand.secondary,
      theme: company.brand.theme,
      logo: company.logo ?? ""
    });
    setHours({ ...company.hours });
    setError("");
    setModalOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) return setError("Informe o nome comercial da barbearia.");
    if (!form.owner.trim()) return setError("Informe o nome do proprietário.");
    const payload = {
      name: form.name.trim(),
      slogan: form.slogan,
      owner: form.owner.trim(),
      document: form.document,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      plan: form.plan,
      brand: { primary: form.primary, secondary: form.secondary, theme: form.theme },
      hours,
      initials: companyInitials(form.name),
      logo: form.logo || void 0
    };
    if (editing) {
      updateCompany(editing.id, payload);
      toast(`${payload.name} atualizada com sucesso.`, "success", "Empresa atualizada");
    } else {
      const created = makeCompany({
        ...payload,
        settings: { onlineBooking: true, loyaltyProgram: true, reminderHours: 24, defaultCommission: 40, requireDeposit: false, showPrices: true },
        isDemo: false
      });
      addCompany(created);
      const starter = makeStarterRecords(created);
      starter.professionals.forEach(addProfessional);
      starter.services.forEach(addService);
      toast(`${created.name} criada com dados isolados e catálogo inicial.`, "success", "Nova empresa ativa");
    }
    setModalOpen(false);
  };
  const handleDuplicate = (company) => {
    const copy = duplicateCompany(company.id);
    if (copy) toast(`${company.name} duplicada para testes como “${copy.name}”.`, "success", "Empresa duplicada");
  };
  return <div className="anim-in">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8e85]"><Building2 size={12} /> Plataforma · Multiempresa</div>
          <h1 className="text-[25px] font-extrabold tracking-[-0.035em] text-ink">Gerenciador de empresas</h1>
          <p className="mt-0.5 text-[12px] text-[#7c8179]">Cada barbearia com identidade, dados e operação 100% isolados.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={() => setRestoreOpen(true)}><RefreshCcw size={13} /> Restaurar demo</Button>
          <Button size="sm" onClick={openNew}><Plus size={14} /> Nova empresa</Button>
        </div>
      </div>

      <Card className="relative mb-3 overflow-hidden border-[#232a21] bg-ink text-white">
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full blur-3xl" style={{ background: "color-mix(in srgb, var(--brand) 22%, transparent)" }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] opacity-30 lg:block" style={{ background: "radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--brand) 35%, transparent), transparent 60%)" }} />
        <div className="relative flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <Badge className="border-white/15 bg-white/[0.07] text-[var(--brand)]"><ShieldCheck size={10} /> Arquitetura multi-tenant</Badge>
            <h2 className="mt-2.5 text-[20px] font-extrabold leading-tight tracking-[-0.03em]">
              Uma plataforma. <span className="display font-normal italic text-[var(--brand)]">Todas as suas barbearias.</span>
            </h2>
            <p className="mt-1 max-w-md text-[11px] leading-relaxed text-white/45">
              Alterne entre unidades em um clique. Clientes, agenda, financeiro e configurações nunca se misturam — tudo escopado por <code className="rounded bg-white/10 px-1 text-[10px] text-white/70">companyId</code>.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Dados isolados", "Identidade própria", "Modo demonstração", "Pronto para API"].map((item) => <span key={item} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-[3px] text-[9px] font-medium text-white/60"><Check size={9} className="text-[var(--brand)]" /> {item}</span>)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:min-w-[330px]">
            {[
    { label: "Empresas", value: String(companies.length), icon: <Building2 size={12} /> },
    { label: "Clientes", value: String(totalClients), icon: <Users size={12} /> },
    { label: "Receita total", value: brl(totalRevenue, true), icon: <Wallet size={12} /> }
  ].map((item) => <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5">
                <span className="text-white/35">{item.icon}</span>
                <p className="num mt-1 text-[18px] font-extrabold leading-none text-white">{item.value}</p>
                <p className="mt-1 text-[8.5px] font-semibold uppercase tracking-[0.06em] text-white/35">{item.label}</p>
              </div>)}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => {
    const metrics = metricsByCompany[company.id];
    const isActive = company.id === activeCompanyId;
    return <Card key={company.id} className={`group relative overflow-hidden transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_20px_46px_-30px_rgba(16,19,16,0.45)] ${isActive ? "ring-1 ring-[#b9c99c]" : ""}`}>
              <div className="relative h-[62px] overflow-hidden" style={{ background: company.cover ? `url(${company.cover}) center/cover` : `linear-gradient(120deg, ${company.brand.primary}, ${company.brand.secondary})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d100e]/70 via-[#0d100e]/20 to-transparent" />
                <div className="relative flex items-start justify-between p-2.5">
                  <Badge className="border-white/20 bg-black/25 text-white/85">{company.plan}</Badge>
                  <Dropdown
      align="right"
      panelClassName="w-[180px]"
      trigger={() => <button className="rounded-md bg-black/25 p-1 text-white/80 backdrop-blur transition hover:bg-black/40 hover:text-white" aria-label="Ações da empresa"><MoreHorizontal size={14} /></button>}
    >
                    <MenuItem icon={<ArrowRight size={13} />} onClick={() => {
      setActiveCompany(company.id);
      toast(`${company.name} é agora a empresa ativa.`, "success", "Empresa alterada");
    }}>Acessar empresa</MenuItem>
                    <MenuItem icon={<Pencil size={13} />} onClick={() => openEdit(company)}>Editar cadastro</MenuItem>
                    <MenuItem icon={<Copy size={13} />} onClick={() => handleDuplicate(company)}>Duplicar para testes</MenuItem>
                    <div className="my-1 h-px bg-[#f0efe9]" />
                    <MenuItem icon={<Trash2 size={13} />} danger onClick={() => setDeleting(company)}>Excluir empresa</MenuItem>
                  </Dropdown>
                </div>
                {isActive && <Badge className="absolute bottom-2 right-2 border-[var(--brand)]/40 bg-[var(--brand)] text-[#101310]"><CheckCircle2 size={9} /> Ativa</Badge>}
              </div>
              <div className="-mt-5 flex items-end justify-between px-4">
                <CompanyAvatar company={company} size={40} />
                <span className="mb-1 flex items-center gap-1 text-[8.5px] font-medium text-[#9a9d95]">{company.isDemo ? "Demonstração" : "Produção"}<span className={`h-1.5 w-1.5 rounded-full ${company.isDemo ? "bg-[#d9a326]" : "bg-[#2f8f5b]"}`} /></span>
              </div>
              <div className="px-4 pb-3 pt-2">
                <h3 className="truncate text-[13.5px] font-extrabold tracking-[-0.01em] text-ink">{company.name}</h3>
                <p className="truncate text-[9.5px] text-[#8a8e85]">{company.owner} · {company.city || "Sem cidade"}/{company.state || "—"}</p>
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {[
      { label: "Clientes", value: String(metrics.clients) },
      { label: "Atendimentos", value: String(metrics.appointments) },
      { label: "Receita", value: brl(metrics.revenue, true) }
    ].map((item) => <div key={item.label} className="rounded-lg border border-[#f0efe8] bg-[#fbfaf6] px-2 py-1.5">
                      <p className="text-[7.5px] font-semibold uppercase tracking-[0.04em] text-[#9a9d95]">{item.label}</p>
                      <p className="num text-[11px] font-extrabold text-ink">{item.value}</p>
                    </div>)}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[#f3f2ec] pt-2.5">
                  <div className="flex items-center gap-1.5 text-[8.5px] text-[#9a9d95]">
                    <Users size={10} /> {metrics.professionals} barbeiros · {metrics.services} serviços
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(company)} className="rounded-md border border-[#e4e2d8] px-1.5 py-1 text-[8.5px] font-bold text-[#6d726a] transition hover:bg-[#f7f6f1]">Editar</button>
                    <button
      onClick={() => {
        setActiveCompany(company.id);
        toast(`Você está gerenciando ${company.name}.`, "success", "Empresa ativa");
      }}
      disabled={isActive}
      className={`rounded-md px-1.5 py-1 text-[8.5px] font-bold transition ${isActive ? "bg-[#f2f5ea] text-[#7a8b5d]" : "bg-ink text-white hover:bg-[#232823]"}`}
    >
                      {isActive ? "Gerenciando" : "Acessar"}
                    </button>
                  </div>
                </div>
              </div>
            </Card>;
  })}
        <button onClick={openNew} className="flex min-h-[248px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#dcdacf] bg-white/40 p-5 text-center transition hover:border-[#bcc8a6] hover:bg-[#fbfcf7]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4e2d8] bg-white text-[#7c8179]"><Plus size={18} /></span>
          <span className="text-[11.5px] font-bold text-[#555a52]">Cadastrar nova barbearia</span>
          <span className="max-w-[170px] text-[9.5px] leading-relaxed text-[#9a9d95]">Identidade, horários, equipe e catálogo próprios.</span>
        </button>
      </div>

      <Card className="mt-3 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eeede6] px-4 py-3">
          <div>
            <h3 className="text-[12px] font-bold text-ink">Visão consolidada</h3>
            <p className="text-[10px] text-[#9a9d95]">Compare o desempenho das suas operações.</p>
          </div>
          <Badge className="border-[#dfe6d2] bg-[#f4f8ea] text-[#637a42]"><Sparkles size={10} /> {companies.length} empresas conectadas</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eeede6] bg-[#fbfaf7] text-[8.5px] font-bold uppercase tracking-[0.08em] text-[#9a9d95]">
                <th className="px-4 py-2.5">Empresa</th>
                <th className="px-3 py-2.5">Plano</th>
                <th className="px-3 py-2.5 text-center">Clientes</th>
                <th className="px-3 py-2.5 text-center">Equipe</th>
                <th className="px-3 py-2.5 text-center">Atendimentos</th>
                <th className="px-3 py-2.5 text-right">Receita</th>
                <th className="px-4 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f3ee]">
              {companies.map((company) => {
    const metrics = metricsByCompany[company.id];
    return <tr key={company.id} className="transition hover:bg-[#fbfaf6]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <CompanyAvatar company={company} size={26} />
                        <div>
                          <p className="text-[11px] font-bold text-ink">{company.name}</p>
                          <p className="text-[8.5px] text-[#9a9d95]">Criada em {fmtDate(company.createdAt, { month: "short", year: "numeric" })}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><Badge className={company.plan === "Future" ? "border-[#dfe6d2] bg-[#f4f8ea] text-[#5d7042]" : "border-[#e7e5dc] bg-[#f7f6f1] text-[#7c8179]"}>{company.plan}</Badge></td>
                    <td className="num px-3 py-2.5 text-center text-[10.5px] text-[#555a52]">{metrics.clients}</td>
                    <td className="num px-3 py-2.5 text-center text-[10.5px] text-[#555a52]">{metrics.professionals}</td>
                    <td className="num px-3 py-2.5 text-center text-[10.5px] text-[#555a52]">{metrics.appointments}</td>
                    <td className="num px-3 py-2.5 text-right text-[10.5px] font-bold text-ink">{brl(metrics.revenue)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => setActiveCompany(company.id)} disabled={company.id === activeCompanyId} className={`rounded-md px-2 py-1 text-[9px] font-bold transition ${company.id === activeCompanyId ? "text-[#8a9b62]" : "border border-[#e4e2d8] text-[#6d726a] hover:bg-[#f5f4ef]"}`}>
                        {company.id === activeCompanyId ? "Ativa" : "Acessar"}
                      </button>
                    </td>
                  </tr>;
  })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
    open={modalOpen}
    onClose={() => setModalOpen(false)}
    title={editing ? "Editar empresa" : "Nova empresa"}
    subtitle="Cada empresa recebe um espaço de dados totalmente independente."
    size="lg"
    footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={save}>{editing ? "Salvar alterações" : "Criar empresa"}</Button></>}
  >
        <div className="space-y-5">
          <section>
            <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a8e85]"><Building2 size={12} /> Identidade</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome comercial" required><Input value={form.name} placeholder="Ex.: Barbearia Horizonte" onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
              <Field label="Proprietário" required><Input value={form.owner} placeholder="Nome do responsável" onChange={(event) => setForm({ ...form, owner: event.target.value })} /></Field>
              <Field label="Slogan" className="sm:col-span-2"><Input value={form.slogan} placeholder="Uma frase que representa a marca" onChange={(event) => setForm({ ...form, slogan: event.target.value })} /></Field>
              <Field label="CNPJ / CPF"><Input value={form.document} placeholder="Opcional" onChange={(event) => setForm({ ...form, document: event.target.value })} /></Field>
              <Field label="Plano"><Select value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })}><option value="Essential">Essential</option><option value="Pro">Pro</option><option value="Future">Future</option></Select></Field>
              <Field label="Logotipo (URL)" hint="Opcional — usamos as iniciais como fallback" className="sm:col-span-2"><Input value={form.logo} placeholder="https://.../logo.png" onChange={(event) => setForm({ ...form, logo: event.target.value })} /></Field>
            </div>
          </section>

          <section>
            <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a8e85]"><Users size={12} /> Contato e endereço</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Telefone"><Input value={form.phone} placeholder="(00) 0000-0000" onChange={(event) => setForm({ ...form, phone: event.target.value, whatsapp: form.whatsapp || event.target.value })} /></Field>
              <Field label="WhatsApp"><Input value={form.whatsapp} placeholder="(00) 90000-0000" onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} /></Field>
              <Field label="E-mail" className="sm:col-span-2"><Input type="email" value={form.email} placeholder="contato@barbearia.com" onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
              <Field label="Endereço" className="sm:col-span-2"><Input value={form.address} placeholder="Rua, número — bairro" onChange={(event) => setForm({ ...form, address: event.target.value })} /></Field>
              <Field label="Cidade"><Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
              <Field label="Estado"><Input value={form.state} maxLength={2} placeholder="SP" onChange={(event) => setForm({ ...form, state: event.target.value.toUpperCase() })} /></Field>
            </div>
          </section>

          <section>
            <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a8e85]"><Sparkles size={12} /> Identidade visual</p>
            <div className="rounded-lg border border-[#eeede6] bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                {PALETTE.map((color) => <button
    key={color.primary}
    type="button"
    onClick={() => setForm({ ...form, primary: color.primary, secondary: color.secondary })}
    className={`h-7 w-7 rounded-full border-2 transition ${form.primary === color.primary ? "border-ink" : "border-white"}`}
    style={{ backgroundColor: color.primary }}
    title={color.name}
  />)}
                <label className="ml-1 flex cursor-pointer items-center gap-1.5 rounded-md border border-[#e5e3da] bg-[#fbfaf6] px-2 py-1 text-[9.5px] font-semibold text-[#6d726a]">
                  <input type="color" value={form.primary} onChange={(event) => setForm({ ...form, primary: event.target.value })} className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0" />
                  Cor personalizada
                </label>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[9px] text-[#9a9d95]">Prévia:</span>
                <span className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[9px] font-bold" style={{ backgroundColor: form.primary, color: form.secondary }}>{form.name || "Sua barbearia"}</span>
                <span className="rounded-md bg-[#101310] px-2 py-1 text-[9px] font-bold text-white">{form.plan}</span>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a8e85]"><CheckCircle2 size={12} /> Horário de funcionamento</p>
              <button onClick={() => setHours(makeHours())} className="text-[9px] font-semibold text-[#7a8b5d] hover:underline">Restaurar padrão</button>
            </div>
            <div className="divide-y divide-[#f3f2ec] overflow-hidden rounded-lg border border-[#eeede6] bg-white">
              {WEEKDAYS.map((day) => {
    const schedule = hours[day.index] ?? DEFAULT_HOURS[day.index];
    return <div key={day.index} className="flex flex-wrap items-center gap-2 px-3 py-1.5">
                    <span className="w-[100px] text-[10px] font-semibold text-ink">{day.label}</span>
                    <input
      type="time"
      value={schedule.open}
      disabled={schedule.closed}
      onChange={(event) => setHours({ ...hours, [day.index]: { ...schedule, open: event.target.value } })}
      className="h-6 rounded border border-[#e5e3da] px-1.5 text-[9.5px] text-[#555a52] disabled:opacity-40"
    />
                    <span className="text-[9px] text-[#b0b3aa]">até</span>
                    <input
      type="time"
      value={schedule.close}
      disabled={schedule.closed}
      onChange={(event) => setHours({ ...hours, [day.index]: { ...schedule, close: event.target.value } })}
      className="h-6 rounded border border-[#e5e3da] px-1.5 text-[9.5px] text-[#555a52] disabled:opacity-40"
    />
                    <button
      type="button"
      onClick={() => setHours({ ...hours, [day.index]: { ...schedule, closed: !schedule.closed } })}
      className={`ml-auto rounded-full border px-2 py-[2px] text-[8.5px] font-bold transition ${schedule.closed ? "border-[#f3d9d4] bg-[#fbeeec] text-[#b64c40]" : "border-[#dfe6d2] bg-[#f4f8ea] text-[#637a42]"}`}
    >
                      {schedule.closed ? "Fechado" : "Aberto"}
                    </button>
                  </div>;
  })}
            </div>
          </section>
        </div>
        {error && <p className="mt-3 rounded-lg border border-[#f3d9d4] bg-[#fbeeec] px-3 py-2 text-[11.5px] font-medium text-[#b64c40]">{error}</p>}
      </Modal>

      <ConfirmDialog
    open={!!deleting}
    onClose={() => setDeleting(null)}
    onConfirm={() => {
      if (!deleting) return;
      if (companies.length <= 1) {
        toast("Mantenha pelo menos uma empresa cadastrada.", "error", "Ação bloqueada");
        return;
      }
      deleteCompany(deleting.id);
      toast(`${deleting.name} e todos os dados vinculados foram excluídos.`, "info", "Empresa excluída");
    }}
    title="Excluir empresa"
    description={`Isso remove permanentemente ${deleting?.name}, seus clientes, agendamentos, serviços, equipe e histórico financeiro. Os dados de outras empresas permanecem intactos.`}
    confirmLabel="Excluir empresa"
  />

      <ConfirmDialog
    open={restoreOpen}
    onClose={() => setRestoreOpen(false)}
    onConfirm={() => {
      restoreDemo();
      toast("Dados de demonstração recriados para as 3 barbearias.", "success", "Demonstração restaurada");
    }}
    title="Restaurar demonstração"
    description="Todos os dados atuais serão substituídos pelas três empresas fictícias com agenda, CRM e financeiro preenchidos. Deseja continuar?"
    confirmLabel="Restaurar dados demo"
    danger={false}
  />
    </div>;
}
const companyInitials = (name) => name.replace(/[^\p{L}\s]/gu, "").trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "BP";
export {
  Companies as default
};
