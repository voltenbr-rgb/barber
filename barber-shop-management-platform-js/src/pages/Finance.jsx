import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Download,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet
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
  Modal,
  Select,
  Segmented
} from "@/components/ui";
import { PeriodFilter, defaultPeriod } from "@/components/PeriodFilter";
import { appointmentServiceLabel, netValue, periodMetrics, professionalPerformance } from "@/lib/selectors";
import {
  brl,
  downloadCSV,
  fmtDate,
  PAYMENT_META,
  sum,
  todayISO,
  toISO,
  uid
} from "@/lib/utils";
const PAYMENT_COLORS = ["#7f9c3f", "#9DBBFF", "#E6B980", "#D6A6E8", "#9FE3C4"];
function Finance() {
  const { appointments, clients, expenses, services, professionals, addExpense, deleteExpense, company } = useStore();
  const { toast, openClient } = useUI();
  const [period, setPeriod] = useState(defaultPeriod);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ description: "", category: "Produtos", amount: "", date: todayISO(), paymentMethod: "pix" });
  const [error, setError] = useState("");
  const metrics = periodMetrics(appointments, clients, expenses, period.start, period.end);
  const monthStart = toISO(new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1));
  const month = periodMetrics(appointments, clients, expenses, monthStart, todayISO());
  const pending = appointments.filter((a) => ["scheduled", "confirmed", "in_progress"].includes(a.status) && a.date >= todayISO());
  const receivables = sum(pending, netValue);
  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth() - 5 + index, 1);
      const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
      const start = `${key}-01`;
      const end = toISO(new Date(date.getFullYear(), date.getMonth() + 1, 0));
      const current = periodMetrics(appointments, clients, expenses, start, end);
      return {
        mes: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        receita: Math.round(current.revenue),
        despesa: Math.round(current.expenses)
      };
    });
    return months;
  }, [appointments, clients, expenses]);
  const paymentMix = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "completed" && a.date >= period.start && a.date <= period.end);
    const grouped = /* @__PURE__ */ new Map();
    completed.forEach((appointment) => {
      const key = appointment.paymentMethod || "pix";
      grouped.set(key, (grouped.get(key) ?? 0) + netValue(appointment));
    });
    return [...grouped.entries()].map(([method, value]) => ({ name: PAYMENT_META[method]?.short ?? method, value }));
  }, [appointments, period]);
  const transactions = useMemo(() => {
    const income = appointments.filter((a) => a.status === "completed" && a.date >= period.start && a.date <= period.end).map((appointment) => ({
      id: appointment.id,
      kind: "income",
      description: clients.find((c) => c.id === appointment.clientId)?.name ?? "Atendimento",
      category: appointmentServiceLabel(appointment, services),
      date: appointment.date,
      method: appointment.paymentMethod || "pix",
      amount: netValue(appointment),
      appointmentId: appointment.id,
      clientId: appointment.clientId
    }));
    const out = expenses.filter((expense) => expense.date >= period.start && expense.date <= period.end).map((expense) => ({
      id: expense.id,
      kind: "expense",
      description: expense.description,
      category: expense.category,
      date: expense.date,
      method: expense.paymentMethod,
      amount: -expense.amount,
      appointmentId: "",
      clientId: ""
    }));
    const q = search.trim().toLowerCase();
    return [...income, ...out].filter((transaction) => tab === "all" || transaction.kind === tab).filter((transaction) => !q || transaction.description.toLowerCase().includes(q) || transaction.category.toLowerCase().includes(q)).sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments, expenses, clients, services, period, tab, search]);
  const performance = professionalPerformance(professionals, appointments, monthStart, todayISO());
  const saveExpense = () => {
    if (!expenseForm.description.trim()) return setError("Descreva a despesa.");
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) return setError("Informe um valor válido.");
    addExpense({
      id: uid("exp"),
      companyId: company.id,
      description: expenseForm.description,
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      paymentMethod: expenseForm.paymentMethod,
      recurring: false
    });
    toast("Despesa lançada no fluxo de caixa.", "success", "Financeiro");
    setExpenseForm({ description: "", category: "Produtos", amount: "", date: todayISO(), paymentMethod: "pix" });
    setError("");
    setExpenseOpen(false);
  };
  const exportCsv = () => {
    downloadCSV(`barberpro-financeiro-${period.start}.csv`, [
      ["Tipo", "Data", "Descrição", "Categoria", "Método", "Valor"],
      ...transactions.map((t) => [t.kind === "income" ? "Receita" : "Despesa", t.date, t.description, t.category, t.method, t.amount.toFixed(2)]),
      [],
      ["Receita", metrics.revenue.toFixed(2)],
      ["Despesas", metrics.expenses.toFixed(2)],
      ["Lucro", metrics.profit.toFixed(2)]
    ]);
    toast("Relatório financeiro exportado.", "success");
  };
  return <div className="anim-in">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8e85]"><Wallet size={12} /> Gestão · Financeiro</div>
          <h1 className="text-[25px] font-extrabold tracking-[-0.035em] text-ink">Fluxo de caixa</h1>
          <p className="mt-0.5 text-[12px] text-[#7c8179]">Receitas, despesas, comissões e resultado real da barbearia.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <PeriodFilter value={period} onChange={setPeriod} />
          <Button size="sm" variant="outline" onClick={exportCsv}><Download size={13} /> <span className="hidden sm:inline">Exportar</span></Button>
          <Button size="sm" onClick={() => setExpenseOpen(true)}><Plus size={14} /> Lançar despesa</Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {[
    { label: "Receita do período", value: brl(metrics.revenue), sub: `${metrics.completed} atendimentos`, icon: <ArrowUpRight size={14} />, tone: "green" },
    { label: "Despesas", value: brl(metrics.expenses), sub: "custos e operação", icon: <ArrowDownLeft size={14} />, tone: "red" },
    { label: "Lucro líquido", value: brl(metrics.profit), sub: `margem de ${metrics.revenue > 0 ? Math.round(metrics.profit / metrics.revenue * 100) : 0}%`, icon: <Banknote size={14} />, tone: "dark" },
    { label: "A receber", value: brl(receivables), sub: `${pending.length} agendamentos futuros`, icon: <CreditCard size={14} />, tone: "blue" }
  ].map((item) => <Card key={item.label} className="relative overflow-hidden px-3.5 py-3">
            <div className="flex items-start justify-between">
              <p className="text-[9px] font-semibold uppercase tracking-[0.07em] text-[#9a9d95]">{item.label}</p>
              <span className={`flex h-6 w-6 items-center justify-center rounded-md ${item.tone === "green" ? "bg-[#ecf7ef] text-[#2f8f5b]" : item.tone === "red" ? "bg-[#fbeeec] text-[#cf5a4d]" : item.tone === "blue" ? "bg-[#eef3ff] text-[#3d7bfa]" : "bg-ink text-[var(--brand)]"}`}>{item.icon}</span>
            </div>
            <p className="num mt-1.5 text-[19px] font-extrabold tracking-[-0.04em] text-ink">{item.value}</p>
            <p className="mt-0.5 text-[8.5px] text-[#a2a69d]">{item.sub}</p>
          </Card>)}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader
    title="Receita vs. despesa"
    subtitle="Últimos 6 meses de operação"
    action={<div className="flex items-center gap-3 text-[9px] text-[#8a8e85]"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[var(--brand)]" /> Receita</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#e3bfae]" /> Despesa</span></div>}
  />
          <div className="mt-3 h-[220px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 2, bottom: 0 }}>
                <defs>
                  <linearGradient id="finRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="finExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e3bfae" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#e3bfae" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#eeede6" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} dy={8} className="capitalize" />
                <YAxis tickLine={false} axisLine={false} width={42} tickFormatter={(value) => `${(value / 1e3).toFixed(0)}k`} />
                <Tooltip content={<FinanceTooltip />} cursor={{ stroke: "#c8ccb8", strokeDasharray: "3 4" }} />
                <Area type="monotone" dataKey="despesa" stroke="#c7a08d" strokeWidth={1.7} fill="url(#finExpense)" />
                <Area type="monotone" dataKey="receita" stroke="#8aa338" strokeWidth={2.2} fill="url(#finRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#efeee7] border-t border-[#f0efe9] px-2 py-2.5">
            {[
    { label: "Receita do mês", value: brl(month.revenue) },
    { label: "Despesa do mês", value: brl(month.expenses) },
    { label: "Resultado do mês", value: brl(month.profit) }
  ].map((item) => <div key={item.label} className="px-3 text-center">
                <p className="text-[8.5px] font-semibold uppercase tracking-[0.05em] text-[#9a9d95]">{item.label}</p>
                <p className="num text-[12px] font-extrabold text-ink">{item.value}</p>
              </div>)}
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader title="Meios de pagamento" subtitle="Mix de recebimento no período" />
          <div className="h-[150px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMix} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={3} strokeWidth={0}>
                  {paymentMix.map((entry, index) => <Cell key={entry.name} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<PaymentTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 px-4 pb-3">
            {paymentMix.map((entry, index) => <div key={entry.name} className="flex items-center gap-2 text-[10px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }} />
                <span className="text-[#6d726a]">{entry.name}</span>
                <span className="num ml-auto font-bold text-ink">{brl(entry.value)}</span>
                <span className="w-8 text-right text-[8.5px] text-[#9a9d95]">{metrics.revenue ? Math.round(entry.value / metrics.revenue * 100) : 0}%</span>
              </div>)}
            {!paymentMix.length && <p className="py-4 text-center text-[10.5px] text-[#9a9d95]">Sem recebimentos no período.</p>}
          </div>
        </Card>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <Card className="overflow-hidden xl:col-span-8">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#eeede6] px-3.5 py-2.5">
            <h3 className="text-[12px] font-bold text-ink">Lançamentos</h3>
            <Segmented
    size="sm"
    value={tab}
    onChange={setTab}
    options={[{ value: "all", label: "Tudo" }, { value: "income", label: "Entradas" }, { value: "expense", label: "Saídas" }]}
  />
            <div className="relative ml-auto min-w-[140px] flex-1 sm:max-w-[210px]">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9a9d95]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar lançamento..." className="h-7 w-full rounded-md border border-[#e5e3da] bg-white pl-7 pr-2 text-[10.5px] focus:border-[#b8bcae]" />
            </div>
          </div>
          <div className="max-h-[320px] divide-y divide-[#f3f2ec] overflow-y-auto">
            {transactions.slice(0, 16).map((transaction) => <div key={`${transaction.kind}-${transaction.id}`} className="group flex items-center gap-2.5 px-3.5 py-2.5 transition hover:bg-[#fbfaf6]">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${transaction.kind === "income" ? "bg-[#ecf7ef] text-[#2f8f5b]" : "bg-[#fbeeec] text-[#cf5a4d]"}`}>
                  {transaction.kind === "income" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                </span>
                <div className="min-w-0 flex-1">
                  <button
    onClick={() => transaction.clientId && openClient(transaction.clientId)}
    className={`block truncate text-left text-[11px] font-semibold text-ink ${transaction.clientId ? "hover:underline" : ""}`}
  >
                    {transaction.description}
                  </button>
                  <p className="truncate text-[9px] text-[#9a9d95]">{transaction.category} · {fmtDate(transaction.date)} · {PAYMENT_META[transaction.method]?.short ?? transaction.method}</p>
                </div>
                <span className={`num shrink-0 text-[11px] font-extrabold ${transaction.kind === "income" ? "text-[#27784c]" : "text-[#b64c40]"}`}>
                  {transaction.kind === "income" ? "+" : "−"}{brl(Math.abs(transaction.amount))}
                </span>
                {transaction.kind === "expense" && <button onClick={() => {
    const expense = expenses.find((e) => e.id === transaction.id);
    if (expense) setDeletingExpense(expense);
  }} className="rounded p-1 text-[#c2c4bc] opacity-0 transition hover:bg-[#fbeeec] hover:text-[#cf5a4d] group-hover:opacity-100" aria-label="Excluir despesa">
                    <Trash2 size={12} />
                  </button>}
              </div>)}
            {!transactions.length && <p className="px-4 py-10 text-center text-[11px] text-[#9a9d95]">Nenhum lançamento com esses filtros.</p>}
          </div>
          <div className="flex items-center justify-between border-t border-[#eeede6] bg-[#fbfaf7] px-3.5 py-2">
            <span className="text-[9px] text-[#9a9d95]">Exibindo {Math.min(16, transactions.length)} de {transactions.length} lançamentos</span>
            <button onClick={exportCsv} className="flex items-center gap-1 text-[9.5px] font-bold text-[#687d47] hover:underline"><Download size={11} /> Baixar CSV</button>
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader title="Comissões a pagar" subtitle={`Base: ${fmtDate(monthStart)} – hoje`} action={<Badge className="border-[#e7e5dc] bg-[#f7f6f1] text-[#7c8179]">Mês atual</Badge>} />
          <div className="mt-2 divide-y divide-[#f3f2ec] px-4">
            {performance.map((item) => <div key={item.professional.id} className="flex items-center gap-2.5 py-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-[8px] font-bold" style={{ backgroundColor: item.professional.color, color: "#1b2418" }}>
                  {item.professional.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-semibold text-ink">{item.professional.name}</p>
                  <p className="text-[8.5px] text-[#9a9d95]">{item.professional.commission}% de {brl(item.revenue, true)}</p>
                </div>
                <span className="num text-[10.5px] font-extrabold text-ink">{brl(item.commission)}</span>
              </div>)}
            {!performance.length && <p className="py-6 text-center text-[10.5px] text-[#9a9d95]">Sem comissões no período.</p>}
          </div>
          <div className="m-3 mt-1 flex items-center justify-between rounded-lg bg-[#f8f8f1] px-3 py-2">
            <span className="text-[9.5px] font-medium text-[#7c8179]">Total de comissões</span>
            <span className="num text-[12px] font-extrabold text-ink">{brl(sum(performance, (p) => p.commission))}</span>
          </div>
        </Card>
      </div>

      <Modal
    open={expenseOpen}
    onClose={() => setExpenseOpen(false)}
    title="Lançar despesa"
    subtitle="Registre uma saída para manter o fluxo de caixa preciso."
    size="sm"
    footer={<><Button variant="outline" onClick={() => setExpenseOpen(false)}>Cancelar</Button><Button variant="dark" onClick={saveExpense}>Lançar despesa</Button></>}
  >
        <div className="grid gap-3">
          <Field label="Descrição" required><Input value={expenseForm.description} placeholder="Ex.: Compra de pomadas e lâminas" onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)" required><Input type="number" min="0" step="0.01" value={expenseForm.amount} placeholder="0,00" onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} /></Field>
            <Field label="Data"><Input type="date" value={expenseForm.date} onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria"><Select value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}>{["Produtos", "Estrutura", "Marketing", "Pessoal", "Software", "Impostos", "Outros"].map((item) => <option key={item} value={item}>{item}</option>)}</Select></Field>
            <Field label="Pagamento"><Select value={expenseForm.paymentMethod} onChange={(event) => setExpenseForm({ ...expenseForm, paymentMethod: event.target.value })}><option value="pix">Pix</option><option value="credit">Crédito</option><option value="debit">Débito</option><option value="cash">Dinheiro</option><option value="transfer">Transferência</option></Select></Field>
          </div>
        </div>
        {error && <p className="mt-3 rounded-lg border border-[#f3d9d4] bg-[#fbeeec] px-3 py-2 text-[11.5px] font-medium text-[#b64c40]">{error}</p>}
      </Modal>

      <ConfirmDialog
    open={!!deletingExpense}
    onClose={() => setDeletingExpense(null)}
    onConfirm={() => {
      if (deletingExpense) {
        deleteExpense(deletingExpense.id);
        toast("Despesa excluída.", "info");
      }
    }}
    title="Excluir lançamento"
    description={`A despesa “${deletingExpense?.description}” será removida do fluxo de caixa.`}
    confirmLabel="Excluir"
  />
    </div>;
}
function FinanceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-[#e5e3da] bg-white px-3 py-2 shadow-xl">
      <p className="text-[9.5px] font-semibold capitalize text-[#9a9d95]">{label}</p>
      {payload.map((entry) => <p key={entry.dataKey} className="num mt-0.5 flex items-center gap-2 text-[10.5px] font-bold text-ink">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} /> {entry.dataKey === "receita" ? "Receita" : "Despesa"}: {brl(entry.value)}
        </p>)}
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
  Finance as default
};
