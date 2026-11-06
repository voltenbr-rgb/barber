import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Database,
  Download,
  Globe,
  HardDrive,
  Palette,
  RefreshCcw,
  Save,
  Settings2,
  Shield,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  Zap
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  Field,
  Input,
  Select,
  Switch
} from "@/components/ui";
import { CompanyAvatar } from "@/components/Brand";
import { PALETTE, makeHours } from "@/data/demo";
import { brl, WEEKDAYS } from "@/lib/utils";
const TABS = [
  { key: "identity", label: "Identidade", icon: <Palette size={14} />, description: "Marca, contato e endereço" },
  { key: "hours", label: "Horários", icon: <Clock3 size={14} />, description: "Funcionamento semanal" },
  { key: "preferences", label: "Preferências", icon: <Settings2 size={14} />, description: "Regras de operação" },
  { key: "data", label: "Dados & PWA", icon: <Database size={14} />, description: "Armazenamento e instalação" }
];
function Settings() {
  const { company, updateCompany, restoreDemo, resetAll, db, clients, appointments, professionals, services } = useStore();
  const { toast } = useUI();
  const [tab, setTab] = useState("identity");
  const [form, setForm] = useState(company);
  const [saved, setSaved] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  useEffect(() => {
    setForm(company);
  }, [company]);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const save = () => {
    updateCompany(company.id, {
      name: form.name,
      slogan: form.slogan,
      owner: form.owner,
      document: form.document,
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      plan: form.plan,
      brand: form.brand,
      hours: form.hours,
      settings: form.settings
    });
    setSaved(true);
    toast("Configurações da empresa salvas e aplicadas.", "success", "Tudo atualizado");
    window.setTimeout(() => setSaved(false), 2200);
  };
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `barberpro-backup-${company.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast("Backup completo gerado em JSON.", "success", "Dados exportados");
  };
  const storageCount = clients.length + appointments.length + professionals.length + services.length;
  return <div className="anim-in">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8e85]"><Settings2 size={12} /> Sistema · Configurações</div>
          <h1 className="text-[25px] font-extrabold tracking-[-0.035em] text-ink">Ajustes da barbearia</h1>
          <p className="mt-0.5 text-[12px] text-[#7c8179]">Tudo que define a experiência da {company.name}.</p>
        </div>
        <Button onClick={save} size="sm">{saved ? <Check size={14} /> : <Save size={14} />} {saved ? "Salvo" : "Salvar alterações"}</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Card className="sticky top-[76px] overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-[#f0efe9] px-3.5 py-3">
              <CompanyAvatar company={company} size={34} />
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-bold text-ink">{company.name}</p>
                <p className="text-[9px] text-[#9a9d95]">Plano {company.plan} · {company.city}</p>
              </div>
            </div>
            <nav className="p-1.5">
              {TABS.map((item) => <button
    key={item.key}
    onClick={() => setTab(item.key)}
    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${tab === item.key ? "bg-[#f4f6ec] text-ink" : "text-[#7c8179] hover:bg-[#f8f7f2]"}`}
  >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md ${tab === item.key ? "bg-[var(--brand)] text-[#101310]" : "bg-[#f4f3ee] text-[#9a9d95]"}`}>{item.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10.5px] font-semibold">{item.label}</span>
                    <span className="block truncate text-[8.5px] text-[#a2a69d]">{item.description}</span>
                  </span>
                  <ChevronRight size={11} className={tab === item.key ? "text-[#8a9b62]" : "text-[#c9ccc3]"} />
                </button>)}
            </nav>
            <div className="border-t border-[#f0efe9] p-3">
              <div className="rounded-lg border border-[#dfe6d2] bg-[#f6f9ee] px-2.5 py-2">
                <p className="flex items-center gap-1 text-[9px] font-bold text-[#5d7042]"><Shield size={10} /> Dados locais e privados</p>
                <p className="mt-0.5 text-[8.5px] leading-relaxed text-[#7c8a65]">Tudo fica no seu navegador, com backup em IndexedDB.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-3 lg:col-span-9">
          {tab === "identity" && <>
              <Card>
                <CardHeader title="Identidade da empresa" subtitle="Esses dados aparecem no seu painel, agenda e comunicações." action={<Badge className="border-[#e7e5dc] bg-[#f7f6f1] text-[#7c8179]">Empresa #{company.id.slice(-6)}</Badge>} />
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <Field label="Nome comercial" required><Input value={form.name} onChange={(event) => set("name", event.target.value)} /></Field>
                  <Field label="Proprietário" required><Input value={form.owner} onChange={(event) => set("owner", event.target.value)} /></Field>
                  <Field label="Slogan" className="sm:col-span-2"><Input value={form.slogan} onChange={(event) => set("slogan", event.target.value)} /></Field>
                  <Field label="CNPJ / CPF"><Input value={form.document} onChange={(event) => set("document", event.target.value)} /></Field>
                  <Field label="Plano"><Select value={form.plan} onChange={(event) => set("plan", event.target.value)}><option value="Essential">Essential</option><option value="Pro">Pro</option><option value="Future">Future</option></Select></Field>
                  <Field label="Logotipo (URL)" hint="Opcional — iniciais são usadas como fallback" className="sm:col-span-2"><Input value={form.logo ?? ""} placeholder="https://.../logo.png" onChange={(event) => set("logo", event.target.value)} /></Field>
                  <Field label="Telefone"><Input value={form.phone} onChange={(event) => set("phone", event.target.value)} /></Field>
                  <Field label="WhatsApp"><Input value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} /></Field>
                  <Field label="E-mail" className="sm:col-span-2"><Input value={form.email} onChange={(event) => set("email", event.target.value)} /></Field>
                  <Field label="Endereço" className="sm:col-span-2"><Input value={form.address} onChange={(event) => set("address", event.target.value)} /></Field>
                  <Field label="Cidade"><Input value={form.city} onChange={(event) => set("city", event.target.value)} /></Field>
                  <Field label="Estado"><Input value={form.state} maxLength={2} onChange={(event) => set("state", event.target.value.toUpperCase())} /></Field>
                </div>
              </Card>

              <Card>
                <CardHeader title="Identidade visual" subtitle="A cor principal é aplicada em toda a plataforma ao salvar as alterações." action={<Palette size={15} className="text-[#a2a69d]" />} />
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {PALETTE.map((color) => <button
    key={color.primary}
    onClick={() => set("brand", { ...form.brand, primary: color.primary, secondary: color.secondary })}
    className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition ${form.brand.primary === color.primary ? "border-ink bg-[#fbfaf6]" : "border-[#e6e4db] bg-white hover:border-[#c9c7bc]"}`}
  >
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color.primary }} />
                        <span className="text-[9.5px] font-semibold text-[#555a52]">{color.name}</span>
                        {form.brand.primary === color.primary && <Check size={10} className="text-[#5d7042]" />}
                      </button>)}
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-[#d9d7cc] px-2 py-1.5 text-[9.5px] font-semibold text-[#7c8179]">
                      <input type="color" value={form.brand.primary} onChange={(event) => set("brand", { ...form.brand, primary: event.target.value })} className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0" />
                      Personalizada
                    </label>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-[#eeede6] bg-[#101310] p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded" style={{ backgroundColor: form.brand.primary }}><Zap size={10} className="text-[#101310]" /></span>
                        <span className="text-[7.5px] font-bold tracking-[0.16em] text-white">BARBER</span>
                      </div>
                      <p className="mt-3 text-[11px] font-bold text-white">{form.name}</p>
                      <p className="text-[7.5px] text-white/40">Navegação & marca</p>
                    </div>
                    <div className="rounded-lg border border-[#eeede6] bg-white p-3">
                      <p className="text-[7.5px] font-semibold uppercase tracking-[0.06em] text-[#9a9d95]">Botão principal</p>
                      <button className="mt-2 w-full rounded-md py-1.5 text-[9px] font-bold" style={{ backgroundColor: form.brand.primary, color: "#101310" }}>Novo agendamento</button>
                      <p className="mt-2 text-[8px] text-[#9a9d95]">Alto contraste em toda a interface.</p>
                    </div>
                    <div className="rounded-lg border border-[#eeede6] bg-white p-3">
                      <p className="text-[7.5px] font-semibold uppercase tracking-[0.06em] text-[#9a9d95]">Destaque</p>
                      <p className="num mt-1.5 text-[17px] font-extrabold" style={{ color: form.brand.primary }}>{brl(1250)}</p>
                      <div className="mt-1 h-1 w-full rounded-full" style={{ backgroundColor: form.brand.primary }} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Tema visual">
                      <Select value={form.brand.theme} onChange={(event) => set("brand", { ...form.brand, theme: event.target.value })}>
                        <option value="minimal">Minimalista</option>
                        <option value="classic">Clássico</option>
                        <option value="noir">Noir</option>
                      </Select>
                    </Field>
                    <Field label="Cor secundária">
                      <div className="flex items-center gap-2">
                        <input type="color" value={form.brand.secondary} onChange={(event) => set("brand", { ...form.brand, secondary: event.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border border-[#e2e0d6] bg-white p-1" />
                        <Input value={form.brand.secondary} onChange={(event) => set("brand", { ...form.brand, secondary: event.target.value })} />
                      </div>
                    </Field>
                  </div>
                </div>
              </Card>
            </>}

          {tab === "hours" && <Card>
              <CardHeader
    title="Horário de funcionamento"
    subtitle="A agenda respeita estes horários ao criar e visualizar atendimentos."
    action={<Button variant="outline" size="sm" onClick={() => {
      set("hours", makeHours());
      toast("Horários padrão restaurados. Salve para aplicar.", "info");
    }}><RefreshCcw size={12} /> Restaurar padrão</Button>}
  />
              <div className="divide-y divide-[#f3f2ec] p-4 pt-2">
                {WEEKDAYS.map((day) => {
    const schedule = form.hours[day.index] ?? makeHours()[day.index];
    return <div key={day.index} className="flex flex-wrap items-center gap-2 py-2.5">
                      <span className="flex w-[120px] items-center gap-2 text-[11px] font-semibold text-ink">
                        <span className={`h-1.5 w-1.5 rounded-full ${schedule.closed ? "bg-[#c9c7bc]" : "bg-[#6d8d41]"}`} />
                        {day.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Input type="time" value={schedule.open} disabled={schedule.closed} onChange={(event) => set("hours", { ...form.hours, [day.index]: { ...schedule, open: event.target.value } })} className="!h-8 w-[102px] !text-[10.5px] disabled:opacity-40" />
                        <span className="text-[9px] text-[#a2a69d]">às</span>
                        <Input type="time" value={schedule.close} disabled={schedule.closed} onChange={(event) => set("hours", { ...form.hours, [day.index]: { ...schedule, close: event.target.value } })} className="!h-8 w-[102px] !text-[10.5px] disabled:opacity-40" />
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <span className={`text-[9px] font-semibold ${schedule.closed ? "text-[#b64c40]" : "text-[#637a42]"}`}>{schedule.closed ? "Fechado" : "Aberto"}</span>
                        <Switch checked={!schedule.closed} onChange={(open) => set("hours", { ...form.hours, [day.index]: { ...schedule, closed: !open } })} />
                      </div>
                    </div>;
  })}
              </div>
              <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg border border-[#eeede6] bg-[#fbfaf6] px-3 py-2.5">
                <Sparkles size={12} className="mt-0.5 shrink-0 text-[#8a9b62]" />
                <p className="text-[9.5px] leading-relaxed text-[#7c8179]">Respeitamos os feriados nacionais ao sugerir horários? Em breve. Nesta versão, os horários da empresa definem a grade da agenda e o cálculo de ocupação.</p>
              </div>
            </Card>}

          {tab === "preferences" && <>
              <Card>
                <CardHeader title="Preferências de operação" subtitle="Regras aplicadas aos agendamentos e ao relacionamento com clientes." />
                <div className="divide-y divide-[#f3f2ec] px-4 pb-2">
                  <div className="py-3"><Switch checked={form.settings.onlineBooking} onChange={(value) => set("settings", { ...form.settings, onlineBooking: value })} label="Agendamento online" description="Permite que clientes reservem horários por um link público (em breve)." /></div>
                  <div className="py-3"><Switch checked={form.settings.loyaltyProgram} onChange={(value) => set("settings", { ...form.settings, loyaltyProgram: value })} label="Programa de fidelidade" description="Ativa a classificação automática de clientes VIP e frequentes." /></div>
                  <div className="py-3"><Switch checked={form.settings.showPrices} onChange={(value) => set("settings", { ...form.settings, showPrices: value })} label="Exibir preços na agenda" description="Mostra o valor dos serviços nos cartões da agenda e no portal." /></div>
                  <div className="py-3"><Switch checked={form.settings.requireDeposit} onChange={(value) => set("settings", { ...form.settings, requireDeposit: value })} label="Exigir sinal para reservas" description="Solicita depósito antecipado em agendamentos online." /></div>
                </div>
              </Card>
              <Card>
                <CardHeader title="Automação e comissões" subtitle="Parâmetros usados nos cálculos e lembretes." />
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <Field label="Lembrete antes do atendimento (horas)"><Input type="number" min="1" value={form.settings.reminderHours} onChange={(event) => set("settings", { ...form.settings, reminderHours: Number(event.target.value) })} /></Field>
                  <Field label="Comissão padrão (%)"><Input type="number" min="0" max="100" value={form.settings.defaultCommission} onChange={(event) => set("settings", { ...form.settings, defaultCommission: Number(event.target.value) })} /></Field>
                  <div className="rounded-lg border border-[#eeede6] bg-[#fbfaf6] px-3 py-2.5 sm:col-span-2">
                    <p className="text-[9.5px] font-bold text-[#555a52]">Como os lembretes funcionam nesta versão</p>
                    <p className="mt-0.5 text-[9px] leading-relaxed text-[#8a8e85]">A plataforma é estática e funciona sem backend. Os lembretes são exibidos na central de notificações e podem ser enviados manualmente pelo WhatsApp do cliente.</p>
                  </div>
                </div>
              </Card>
            </>}

          {tab === "data" && <>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
    { label: "Registros locais", value: String(storageCount), icon: <Database size={14} /> },
    { label: "Agendamentos", value: String(appointments.length), icon: <Clock3 size={14} /> },
    { label: "Clientes da empresa", value: String(clients.length), icon: <Building2 size={14} /> }
  ].map((item) => <Card key={item.label} className="flex items-center gap-2.5 px-3.5 py-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eeede6] bg-[#faf9f5] text-[#7c8179]">{item.icon}</span>
                    <div>
                      <p className="text-[8.5px] font-semibold uppercase tracking-[0.06em] text-[#9a9d95]">{item.label}</p>
                      <p className="num text-[17px] font-extrabold text-ink">{item.value}</p>
                    </div>
                  </Card>)}
              </div>

              <Card>
                <CardHeader title="Aplicativo instalável (PWA)" subtitle="Barber Pro Future funciona offline e pode ser instalado em celulares e computadores." action={<Badge className="border-[#dfe6d2] bg-[#f4f8ea] text-[#637a42]"><Smartphone size={10} /> PWA Ready</Badge>} />
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-[#eeede6] bg-[#fbfaf6] p-3">
                    <p className="text-[10px] font-bold text-ink">Instalar no computador</p>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-[#8a8e85]">No Chrome ou Edge, clique no ícone de instalação na barra de endereço. O app abre em janela própria, sem barra do navegador.</p>
                  </div>
                  <div className="rounded-lg border border-[#eeede6] bg-[#fbfaf6] p-3">
                    <p className="text-[10px] font-bold text-ink">Instalar no celular</p>
                    <p className="mt-1 text-[9.5px] leading-relaxed text-[#8a8e85]">No Safari (iOS), toque em Compartilhar → Adicionar à Tela de Início. No Android, use o menu → Instalar aplicativo.</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-[#dfe6d2] bg-[#f6f9ee] px-3 py-2.5 sm:col-span-2">
                    <Zap size={14} className="text-[#6d8d41]" />
                    <p className="text-[9.5px] leading-relaxed text-[#637a45]">Armazenamento offline-first: LocalStorage para sessão rápida + IndexedDB para histórico completo. Os dados sobrevivem ao fechamento do navegador.</p>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader title="Backup e dados locais" subtitle="Exporte, restaure ou recomece a demonstração." action={<HardDrive size={15} className="text-[#a2a69d]" />} />
                <div className="divide-y divide-[#f3f2ec] px-4 pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-[10.5px] font-semibold text-ink">Exportar backup completo</p>
                      <p className="text-[9px] text-[#9a9d95]">Todas as empresas, clientes, agenda e financeiro em JSON.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={exportBackup}><Download size={12} /> Baixar JSON</Button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-[10.5px] font-semibold text-ink">Restaurar demonstração</p>
                      <p className="text-[9px] text-[#9a9d95]">Recria as 3 empresas fictícias com dados completos.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setRestoreOpen(true)}><RefreshCcw size={12} /> Restaurar demo</Button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-[10.5px] font-semibold text-[#b64c40]">Apagar todos os dados</p>
                      <p className="text-[9px] text-[#9a9d95]">Remove o armazenamento local e reinicia com a demonstração padrão.</p>
                    </div>
                    <Button size="sm" variant="danger" onClick={() => setResetOpen(true)}><Trash2 size={12} /> Limpar dados</Button>
                  </div>
                </div>
              </Card>

              <Card className="relative overflow-hidden border-[#232a21] bg-ink p-4 text-white">
                <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full blur-3xl" style={{ background: "color-mix(in srgb, var(--brand) 25%, transparent)" }} />
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--brand)]"><Globe size={11} /> Barber Pro Future · v1.0</p>
                    <p className="mt-1 text-[13px] font-extrabold">Arquitetura pronta para cloud</p>
                    <p className="mt-0.5 max-w-md text-[9.5px] leading-relaxed text-white/45">Estrutura modular e multi-tenant, com cada registro escopado por empresa. Pronta para publicar no Cloudflare Pages e evoluir para uma API.</p>
                  </div>
                  <Badge className="border-white/15 bg-white/[0.06] text-white/70"><Upload size={10} /> Offline-first</Badge>
                </div>
              </Card>
            </>}
        </div>
      </div>

      <ConfirmDialog
    open={restoreOpen}
    onClose={() => setRestoreOpen(false)}
    onConfirm={() => {
      restoreDemo();
      toast("Demonstração restaurada com sucesso.", "success", "Dados recriados");
    }}
    title="Restaurar demonstração"
    description="Os dados atuais serão substituídos por três barbearias completas de demonstração. Deseja continuar?"
    confirmLabel="Restaurar dados"
    danger={false}
  />
      <ConfirmDialog
    open={resetOpen}
    onClose={() => setResetOpen(false)}
    onConfirm={() => {
      resetAll();
      toast("Armazenamento local limpo e demonstração recriada.", "info", "Dados reiniciados");
    }}
    title="Apagar todos os dados"
    description="Essa ação apaga o snapshot local e o espelho no IndexedDB, retornando à demonstração original. Não pode ser desfeita."
    confirmLabel="Apagar e reiniciar"
  />
    </div>;
}
export {
  Settings as default
};
