import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Command,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Scissors,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  X,
  Check,
  Clock3,
  Zap
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { cn } from "@/utils/cn";
import { Avatar, Badge, Button, Dropdown, MenuItem, Modal } from "@/components/ui";
import { BrandMark, CompanyAvatar, Wordmark } from "@/components/Brand";
import { ClientDrawer } from "@/components/ClientDrawer";
import { AppointmentModal } from "@/components/AppointmentModal";
import { appointmentServiceLabel } from "@/lib/selectors";
import { fmtDate, todayISO } from "@/lib/utils";
const NAV_GROUPS = [
  {
    label: "Operação",
    items: [
      { to: "/", label: "Visão geral", icon: LayoutDashboard, end: true },
      { to: "/agenda", label: "Agenda", icon: CalendarDays },
      { to: "/clientes", label: "Clientes", icon: Users, badge: "CRM" },
      { to: "/servicos", label: "Serviços", icon: Scissors },
      { to: "/equipe", label: "Equipe", icon: UserRound }
    ]
  },
  {
    label: "Gestão",
    items: [
      { to: "/financeiro", label: "Financeiro", icon: Wallet },
      { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
      { to: "/empresas", label: "Empresas", icon: Building2 }
    ]
  },
  {
    label: "Sistema",
    items: [{ to: "/configuracoes", label: "Configurações", icon: Settings }]
  }
];
const PAGE_TITLES = {
  "/": "Visão geral",
  "/agenda": "Agenda",
  "/clientes": "Clientes",
  "/servicos": "Serviços",
  "/equipe": "Equipe",
  "/financeiro": "Financeiro",
  "/relatorios": "Relatórios",
  "/empresas": "Empresas",
  "/configuracoes": "Configurações"
};
function AppShell({ children }) {
  const { company, companies, appointments, clients, services, setActiveCompany } = useStore();
  const { openAppointment, commandOpen, setCommandOpen, mobileNavOpen, setMobileNavOpen, clientId, appointmentEditId, appointmentPreset, closeAppointment } = useUI();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, setMobileNavOpen]);
  useEffect(() => {
    document.documentElement.style.setProperty("--brand", company.brand.primary);
    document.documentElement.style.setProperty("--brand-ink", "#101310");
  }, [company.brand.primary]);
  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandOpen, setCommandOpen]);
  const today = todayISO();
  const todayAppointments = appointments.filter((a) => a.date === today && ["scheduled", "confirmed", "in_progress"].includes(a.status));
  const newClients = clients.filter((c) => c.createdAt >= today).length;
  const notifications = [
    ...todayAppointments.slice(0, 2).map((appointment) => ({
      id: appointment.id,
      icon: <CalendarDays size={14} />,
      title: `${appointment.start} · ${clients.find((c) => c.id === appointment.clientId)?.name.split(" ")[0] ?? "Cliente"}`,
      text: appointmentServiceLabel(appointment, services),
      tone: "brand",
      action: () => openAppointment({}, appointment.id)
    })),
    ...newClients ? [{ id: "new-clients", icon: <Users size={14} />, title: `${newClients} novo(s) cliente(s) hoje`, text: "Sua base está crescendo.", tone: "blue", action: () => navigate("/clientes") }] : [],
    { id: "tip", icon: <Sparkles size={14} />, title: "Ocupação do dia", text: "Confira os horários livres na agenda.", tone: "amber", action: () => navigate("/agenda") }
  ].slice(0, 4);
  return <div
    className="min-h-screen bg-[#f4f3ee]"
    style={{ "--brand": company.brand.primary, "--brand-ink": "#101310" }}
  >
      {
    /* Desktop sidebar */
  }
      <aside className="sidebar-surface fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-white/[0.06] lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-4">
          <BrandMark size={32} />
          <Wordmark />
          <Badge className="ml-auto border-white/10 bg-white/[0.05] px-1.5 py-[2px] text-[7.5px] tracking-[0.12em] text-white/50">BETA</Badge>
        </div>

        <div className="px-3 pb-3 pt-1">
          <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[8.5px] font-bold uppercase tracking-[0.14em] text-white/30">
            <Building2 size={10} /> Empresa ativa
          </div>
          <CompanySwitcher company={company} companies={companies} onSelect={setActiveCompany} />
        </div>

        <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-3">
          {NAV_GROUPS.map((group) => <div key={group.label} className="mb-4">
              <p className="mb-1.5 px-2 text-[8.5px] font-bold uppercase tracking-[0.16em] text-white/28">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => <NavLink
    key={item.to}
    to={item.to}
    end={"end" in item ? item.end : false}
    className={({ isActive }) => cn(
      "group relative flex h-[36px] items-center gap-2.5 rounded-lg px-2.5 text-[12px] font-medium transition-all duration-150",
      isActive ? "bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "text-white/56 hover:bg-white/[0.045] hover:text-white/90"
    )}
  >
                    {({ isActive }) => <>
                        {isActive && <span className="absolute -left-3 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-[var(--brand)]" />}
                        <item.icon size={15.5} strokeWidth={isActive ? 2.2 : 1.9} className={isActive ? "text-[var(--brand)]" : "text-white/42 group-hover:text-white/70"} />
                        <span className="flex-1">{item.label}</span>
                        {"badge" in item && item.badge && <span className="rounded border border-white/10 bg-white/[0.06] px-1 py-[1px] text-[7.5px] font-bold tracking-[0.08em] text-white/45">{item.badge}</span>}
                        {item.to === "/agenda" && todayAppointments.length > 0 && <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[8.5px] font-extrabold text-[var(--brand-ink)]">
                            {todayAppointments.length}
                          </span>}
                      </>}
                  </NavLink>)}
              </div>
            </div>)}
        </nav>

        <div className="px-3 pb-2">
          <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] p-3">
            <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-[var(--brand)]/20 blur-2xl" />
            <div className="relative flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--brand)]/15 text-[var(--brand)]"><Zap size={12} /></span>
              <p className="text-[10.5px] font-bold text-white/90">Plano {company.plan}</p>
              <span className="ml-auto rounded-full bg-[var(--brand)]/15 px-1.5 py-[2px] text-[7.5px] font-bold uppercase tracking-[0.08em] text-[var(--brand)]">Ativo</span>
            </div>
            <p className="relative mt-2 text-[9.5px] leading-relaxed text-white/38">
              {company.plan === "Future" ? "Todos os recursos liberados. Sua barbearia no futuro." : "Evolua para o Future e libere relatórios avançados."}
            </p>
            <button onClick={() => navigate("/configuracoes")} className="relative mt-2.5 flex w-full items-center justify-between rounded-md border border-white/10 bg-white/[0.06] px-2 py-1.5 text-[9.5px] font-semibold text-white/80 transition hover:bg-white/10">
              Gerenciar plano <ArrowRight size={10} />
            </button>
          </div>
        </div>

        <div className="border-t border-white/[0.06] p-2.5">
          <Dropdown
    align="left"
    panelClassName="w-[224px]"
    trigger={() => <button className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-white/[0.05]">
                <Avatar name={company.owner} size={30} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold text-white/90">{company.owner}</span>
                  <span className="block truncate text-[9px] text-white/35">Proprietário · {company.city}</span>
                </span>
                <ChevronDown size={12} className="text-white/30" />
              </button>}
  >
            <MenuItem icon={<Settings size={14} />} onClick={() => navigate("/configuracoes")}>Configurações</MenuItem>
            <MenuItem icon={<Building2 size={14} />} onClick={() => navigate("/empresas")}>Gerenciar empresas</MenuItem>
            <MenuItem icon={<CircleHelp size={14} />}>Central de ajuda</MenuItem>
            <div className="my-1 h-px bg-[#f0efe9]" />
            <MenuItem icon={<LogOut size={14} />} danger onClick={() => navigate("/configuracoes")}>Encerrar sessão demo</MenuItem>
          </Dropdown>
        </div>
      </aside>

      {
    /* Mobile side drawer */
  }
      {mobileNavOpen && <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="anim-in absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <aside className="sidebar-surface anim-slide absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-white/10">
            <div className="flex h-16 items-center gap-2.5 px-4">
              <BrandMark size={32} />
              <Wordmark />
              <button onClick={() => setMobileNavOpen(false)} className="ml-auto rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"><X size={17} /></button>
            </div>
            <div className="px-3 pb-2">
              <CompanySwitcher company={company} companies={companies} onSelect={setActiveCompany} />
            </div>
            <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-2">
              {NAV_GROUPS.map((group) => <div key={group.label} className="mb-4">
                  <p className="mb-1.5 px-2 text-[8.5px] font-bold uppercase tracking-[0.16em] text-white/28">{group.label}</p>
                  {group.items.map((item) => <NavLink
    key={item.to}
    to={item.to}
    end={"end" in item ? item.end : false}
    className={({ isActive }) => cn(
      "flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-[12.5px] font-medium",
      isActive ? "bg-white/[0.09] text-white" : "text-white/55"
    )}
  >
                      {({ isActive }) => <>
                          <item.icon size={16} className={isActive ? "text-[var(--brand)]" : "text-white/40"} />
                          {item.label}
                          {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />}
                        </>}
                    </NavLink>)}
                </div>)}
            </nav>
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <Avatar name={company.owner} size={30} />
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] font-semibold text-white">{company.owner}</p>
                  <p className="truncate text-[9px] text-white/40">{company.email}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>}

      <div className="lg:pl-[252px]">
        {
    /* Top bar */
  }
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-[#e5e3da]/80 bg-[#f6f5f0]/90 px-3 backdrop-blur-lg sm:px-5 lg:px-7">
          <button onClick={() => setMobileNavOpen(true)} className="rounded-lg p-2 text-[#555a52] transition hover:bg-[#eae9e2] lg:hidden" aria-label="Abrir menu">
            <Menu size={19} />
          </button>
          <div className="hidden items-center gap-1.5 lg:flex">
            <span className="text-[10.5px] font-medium text-[#9a9d95]">Barber Pro</span>
            <ChevronRight size={11} className="text-[#b5b8b0]" />
            <span className="text-[10.5px] font-bold text-[#3f443e]">{PAGE_TITLES[location.pathname] ?? "Visão geral"}</span>
          </div>

          <button
    onClick={() => setCommandOpen(true)}
    className="group ml-0 flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-[#e2e0d6] bg-white px-3 text-left transition hover:border-[#cfcdc2] sm:ml-3 sm:max-w-[300px]"
  >
            <Search size={14} className="shrink-0 text-[#9a9d95]" />
            <span className="truncate text-[11.5px] text-[#9a9d95]">Buscar clientes, serviços...</span>
            <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-[#e7e5dc] bg-[#f7f6f1] px-1.5 py-0.5 text-[9px] font-semibold text-[#9a9d95] md:inline-flex">
              <Command size={9} /> K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            <div className="mr-1 hidden items-center gap-1.5 rounded-full border border-[#ddE0d0] bg-[#f4f8ea] px-2.5 py-1 xl:flex">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#5f8a3e]" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#5f7a45]">Modo demonstração</span>
            </div>

            <Dropdown
    open={notificationsOpen}
    onOpenChange={setNotificationsOpen}
    align="right"
    panelClassName="w-[320px] p-0 overflow-hidden"
    trigger={() => <button className="relative rounded-lg p-2 text-[#6d726a] transition hover:bg-[#eae9e2] hover:text-ink" aria-label="Notificações">
                  <Bell size={17} />
                  {notifications.length > 0 && <span className="absolute right-[7px] top-[6px] h-[6px] w-[6px] rounded-full border border-white bg-[#cf5a4d]" />}
                </button>}
  >
              <div className="flex items-center justify-between border-b border-[#eeede6] px-4 py-3">
                <p className="text-[12px] font-bold text-ink">Notificações</p>
                <Badge className="border-[#dfe6d2] bg-[#f5f8ec] text-[#637a42]">{notifications.length} novas</Badge>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notification) => <button
    key={notification.id}
    onClick={() => {
      notification.action();
      setNotificationsOpen(false);
    }}
    className="flex w-full items-start gap-2.5 border-b border-[#f3f2ec] px-4 py-2.5 text-left transition last:border-0 hover:bg-[#faf9f5]"
  >
                    <span className={cn(
    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
    notification.tone === "brand" ? "bg-[#f1f7e3] text-[#62813a]" : notification.tone === "blue" ? "bg-[#eef3ff] text-[#3d6fd3]" : "bg-[#fdf5e2] text-[#a57a1c]"
  )}>
                      {notification.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11.5px] font-semibold text-ink">{notification.title}</span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-[#8a8e85]">{notification.text}</span>
                    </span>
                    <ChevronRight size={12} className="mt-1.5 shrink-0 text-[#c2c4bc]" />
                  </button>)}
              </div>
              <button onClick={() => {
    navigate("/agenda");
    setNotificationsOpen(false);
  }} className="flex w-full items-center justify-center gap-1 border-t border-[#eeede6] bg-[#fbfaf7] py-2.5 text-[10.5px] font-bold text-[#5d7a3d] hover:bg-[#f5f4ee]">
                Abrir agenda do dia <ArrowRight size={11} />
              </button>
            </Dropdown>

            <Dropdown
    align="right"
    panelClassName="w-[228px]"
    trigger={() => <button className="hidden rounded-lg p-2 text-[#6d726a] transition hover:bg-[#eae9e2] hover:text-ink sm:block" aria-label="Ajuda">
                  <CircleHelp size={17} />
                </button>}
  >
              <MenuItem icon={<CircleHelp size={14} />}>Central de ajuda</MenuItem>
              <MenuItem icon={<ShieldCheck size={14} />}>Privacidade e dados</MenuItem>
              <MenuItem icon={<Sparkles size={14} />}>O que há de novo</MenuItem>
            </Dropdown>

            <div className="mx-1 hidden h-6 w-px bg-[#e0ded5] sm:block" />

            <div className="hidden sm:block">
              <Dropdown
    align="right"
    panelClassName="w-[240px]"
    trigger={() => <button className="flex items-center gap-2 rounded-lg p-1 pr-1.5 transition hover:bg-[#eae9e2]">
                    <Avatar name={company.owner} size={28} />
                    <ChevronDown size={12} className="text-[#9a9d95]" />
                  </button>}
  >
                <div className="px-2.5 pb-1 pt-1.5">
                  <p className="text-[11.5px] font-bold text-ink">{company.owner}</p>
                  <p className="text-[10px] text-[#9a9d95]">{company.email}</p>
                </div>
                <div className="my-1 h-px bg-[#f0efe9]" />
                <MenuItem icon={<Settings size={14} />} onClick={() => navigate("/configuracoes")}>Configurações</MenuItem>
                <MenuItem icon={<CreditCard size={14} />}>Plano e cobrança</MenuItem>
                <MenuItem icon={<Building2 size={14} />} onClick={() => navigate("/empresas")}>Gerenciar empresas</MenuItem>
                <MenuItem icon={<LogOut size={14} />} danger onClick={() => navigate("/configuracoes")}>Sair</MenuItem>
              </Dropdown>
            </div>

            <div className="hidden sm:block">
              <button
    onClick={() => navigate("/empresas")}
    className="flex items-center gap-1.5 rounded-lg border border-[#e2e0d6] bg-white px-2.5 py-[7px] text-[10.5px] font-bold text-[#555a52] transition hover:border-[#cfcdc2]"
    title="Gerenciador de empresas"
  >
                <Building2 size={13} /> Empresas
              </button>
            </div>

            <Button size="sm" className="h-9 gap-1.5 px-3" onClick={() => openAppointment()}>
              <Plus size={14} /> <span className="hidden xs:inline sm:inline">Novo</span>
              <span className="hidden md:inline">agendamento</span>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1480px] px-3.5 pb-24 pt-5 sm:px-5 lg:px-7 lg:pb-10">{children}</main>
      </div>

      {
    /* Mobile bottom nav */
  }
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e3e1d8] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        <div className="flex items-stretch justify-around px-1.5 py-1.5">
          {[
    { to: "/", label: "Início", icon: LayoutDashboard },
    { to: "/agenda", label: "Agenda", icon: CalendarDays },
    { to: "/clientes", label: "Clientes", icon: Users },
    { to: "/financeiro", label: "Financeiro", icon: Wallet },
    { to: "/empresas", label: "Empresas", icon: Building2 }
  ].map((item) => <NavLink
    key={item.to}
    to={item.to}
    end={item.to === "/"}
    className={({ isActive }) => cn(
      "relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[9px] font-semibold transition",
      isActive ? "text-ink" : "text-[#9a9d95]"
    )}
  >
              {({ isActive }) => <>
                  <span className={cn("flex h-7 w-9 items-center justify-center rounded-lg transition", isActive && "bg-[var(--brand-soft)]")}>
                    <item.icon size={17} strokeWidth={isActive ? 2.3 : 1.9} className={isActive ? "text-[#4d6230]" : ""} />
                  </span>
                  {item.label}
                  {isActive && <span className="absolute -top-1.5 h-[2.5px] w-6 rounded-full bg-[var(--brand)]" />}
                </>}
            </NavLink>)}
        </div>
      </nav>

      <CommandPalette />
      {clientId && <ClientDrawer />}
      {(appointmentPreset !== null || appointmentEditId) && <AppointmentModal preset={appointmentPreset} editId={appointmentEditId} onClose={closeAppointment} />}
    </div>;
}
function CompanySwitcher({ company, companies, onSelect }) {
  const navigate = useNavigate();
  const { toast } = useUI();
  return <Dropdown
    className="w-full"
    align="left"
    panelClassName="w-[230px]"
    trigger={() => <button className="flex w-full items-center gap-2.5 rounded-[10px] border border-white/[0.08] bg-white/[0.045] px-2 py-2 text-left transition hover:bg-white/[0.075]">
          <CompanyAvatar company={company} size={30} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11.5px] font-bold text-white/92">{company.name}</span>
            <span className="mt-0.5 block truncate text-[9px] text-white/38">{company.plan} · {company.city}</span>
          </span>
          <ChevronDown size={13} className="shrink-0 text-white/35" />
        </button>}
  >
      <p className="px-2.5 pb-1 pt-1.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-[#a0a49b]">Suas barbearias</p>
      {companies.map((item) => <MenuItem
    key={item.id}
    onClick={() => {
      onSelect(item.id);
      toast(`${item.name} agora é a empresa ativa.`, "success", "Empresa alterada");
    }}
  >
          <span className="flex items-center gap-2">
            <CompanyAvatar company={item} size={22} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-semibold text-ink">{item.name}</span>
              <span className="block text-[9px] text-[#9a9d95]">{item.plan} · {item.city || "Sem cidade"}</span>
            </span>
            {item.id === company.id && <Check size={13} className="text-[#5f7a3a]" />}
          </span>
        </MenuItem>)}
      <div className="my-1 h-px bg-[#f0efe9]" />
      <MenuItem icon={<Building2 size={14} />} onClick={() => navigate("/empresas")}>Gerenciar empresas</MenuItem>
      <MenuItem icon={<Plus size={14} />} onClick={() => navigate("/empresas?new=1")}>Cadastrar nova empresa</MenuItem>
    </Dropdown>;
}
function CommandPalette() {
  const { commandOpen, setCommandOpen, openClient, openAppointment } = useUI();
  const { clients, services, appointments, company } = useStore();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (commandOpen) {
      setQuery("");
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [commandOpen]);
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!commandOpen) return [];
    const pages = [
      { to: "/", label: "Visão geral" },
      { to: "/agenda", label: "Agenda" },
      { to: "/clientes", label: "Clientes" },
      { to: "/financeiro", label: "Financeiro" },
      { to: "/empresas", label: "Gerenciar empresas" },
      { to: "/configuracoes", label: "Configurações" }
    ].filter((page) => !q || page.label.toLowerCase().includes(q));
    return [
      ...q ? clients.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 4).map((c) => ({ kind: "client", id: c.id, label: c.name, meta: c.phone })) : [],
      ...q ? services.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 3).map((s) => ({ kind: "service", id: s.id, label: s.name, meta: `${s.duration} min` })) : [],
      ...q ? appointments.filter((a) => {
        const name = clients.find((c) => c.id === a.clientId)?.name ?? "";
        return name.toLowerCase().includes(q) && a.date >= todayISO();
      }).slice(0, 3).map((a) => ({ kind: "appointment", id: a.id, label: `${fmtDate(a.date)} · ${a.start}`, meta: clients.find((c) => c.id === a.clientId)?.name ?? "" })) : [],
      ...pages.map((p) => ({ kind: "page", id: p.to, label: p.label, meta: "Ir para" }))
    ];
  }, [q, commandOpen, clients, services, appointments]);
  const run = (result) => {
    setCommandOpen(false);
    if (result.kind === "client") openClient(result.id);
    else if (result.kind === "appointment") openAppointment({}, result.id);
    else if (result.kind === "page") navigate(result.id);
    else if (result.kind === "service") navigate("/servicos");
  };
  const grouped = [
    { key: "client", label: "Clientes", items: results.filter((r) => r.kind === "client") },
    { key: "appointment", label: "Agendamentos", items: results.filter((r) => r.kind === "appointment") },
    { key: "service", label: "Serviços", items: results.filter((r) => r.kind === "service") },
    { key: "page", label: "Navegação", items: results.filter((r) => r.kind === "page") }
  ].filter((group) => group.items.length);
  const flat = grouped.flatMap((g) => g.items);
  if (!commandOpen) return null;
  return <Modal open onClose={() => setCommandOpen(false)} size="md">
      <div className="-mx-5 -my-5">
        <div className="flex items-center gap-2.5 border-b border-[#eeede6] px-4 py-3.5">
          <Search size={17} className="text-[#9a9d95]" />
          <input
    ref={inputRef}
    value={query}
    onChange={(event) => {
      setQuery(event.target.value);
      setActive(0);
    }}
    onKeyDown={(event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive((prev) => Math.min(flat.length - 1, prev + 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive((prev) => Math.max(0, prev - 1));
      }
      if (event.key === "Enter" && flat[active]) run(flat[active]);
    }}
    placeholder="Busque por cliente, serviço ou navegue..."
    className="h-7 flex-1 bg-transparent text-[14px] text-ink placeholder:text-[#a9aca4]"
  />
          <kbd className="rounded border border-[#e7e5dc] bg-[#f7f6f1] px-1.5 py-0.5 text-[9px] font-semibold text-[#9a9d95]">ESC</kbd>
        </div>
        <div className="max-h-[380px] overflow-y-auto p-2">
          {!flat.length && <p className="px-3 py-10 text-center text-[12px] text-[#9a9d95]">Nada encontrado para “{query}”.</p>}
          {grouped.map((group) => <div key={group.key} className="mb-1.5">
              <p className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#a0a49b]">{group.label}</p>
              {group.items.map((result) => {
    const index = flat.indexOf(result);
    return <button
      key={`${result.kind}-${result.id}`}
      onClick={() => run(result)}
      onMouseEnter={() => setActive(index)}
      className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition", index === active ? "bg-[#f3f2ec]" : "hover:bg-[#f8f7f2]")}
    >
                    {result.kind === "client" ? <Avatar name={result.label} size={24} /> : <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f3f2ec] text-[#7c8179]">
                        {result.kind === "page" ? <ArrowRight size={12} /> : result.kind === "service" ? <Scissors size={12} /> : <Clock3 size={12} />}
                      </span>}
                    <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink">{result.label}</span>
                    <span className="shrink-0 text-[10px] text-[#9a9d95]">{result.meta}</span>
                  </button>;
  })}
            </div>)}
        </div>
        <div className="flex items-center justify-between border-t border-[#eeede6] bg-[#fbfaf7] px-4 py-2">
          <p className="text-[9.5px] text-[#9a9d95]">↑ ↓ navegar · ↵ abrir</p>
          <p className="flex items-center gap-1 text-[9.5px] font-semibold text-[#7c8179]"><Sparkles size={10} /> {company.name}</p>
        </div>
      </div>
    </Modal>;
}
export {
  AppShell
};
