import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Scissors, UserRound, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Button, Field, Input, Modal, Select, Textarea } from "@/components/ui";
import { addMinutes, brl, minutesToTime, parseTime, todayISO, uid } from "@/lib/utils";
import { serviceDuration } from "@/lib/utils";
const TIME_OPTIONS = Array.from({ length: 28 }, (_, index) => minutesToTime(8 * 60 + index * 30));
const STATUS_OPTIONS = [
  { value: "scheduled", label: "Agendado" },
  { value: "confirmed", label: "Confirmado" },
  { value: "in_progress", label: "Em atendimento" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
  { value: "no_show", label: "Não compareceu" }
];
function AppointmentModal({
  preset,
  editId,
  onClose
}) {
  const { company, clients, professionals, services, appointments, addAppointment, updateAppointment } = useStore();
  const { toast } = useUI();
  const editing = editId ? appointments.find((a) => a.id === editId) : void 0;
  const activePros = professionals.filter((p) => p.active);
  const activeServices = services.filter((s) => s.active);
  const [clientId, setClientId] = useState(editing?.clientId ?? preset?.clientId ?? clients[0]?.id ?? "");
  const [professionalId, setProfessionalId] = useState(
    editing?.professionalId ?? preset?.professionalId ?? activePros[0]?.id ?? ""
  );
  const [serviceIds, setServiceIds] = useState(editing?.serviceIds ?? []);
  const [date, setDate] = useState(editing?.date ?? preset?.date ?? todayISO());
  const [start, setStart] = useState(editing?.start ?? preset?.start ?? "09:00");
  const [status, setStatus] = useState(editing?.status ?? "confirmed");
  const [paymentMethod, setPaymentMethod] = useState(editing?.paymentMethod ?? "");
  const [discount, setDiscount] = useState(String(editing?.discount ?? 0));
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [priceOverride, setPriceOverride] = useState(editing ? String(editing.price) : "");
  const [error, setError] = useState("");
  const selectedServices = useMemo(
    () => serviceIds.map((id) => services.find((s) => s.id === id)).filter(Boolean),
    [serviceIds, services]
  );
  const autoPrice = selectedServices.reduce((acc, service) => acc + (service?.price ?? 0), 0);
  const duration = serviceDuration(serviceIds, services) || 30;
  const price = priceOverride === "" ? autoPrice : Number(priceOverride) || 0;
  const end = addMinutes(start, duration);
  useEffect(() => {
    if (editing) return;
    if (serviceIds.length === 0 && activeServices.length) {
      setServiceIds([activeServices[0].id]);
      setPriceOverride(String(activeServices[0].price));
    }
  }, [activeServices, editing, serviceIds.length]);
  const toggleService = (id) => {
    setServiceIds((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      const total = next.reduce((acc, serviceId) => acc + (services.find((s) => s.id === serviceId)?.price ?? 0), 0);
      setPriceOverride(String(total));
      return next;
    });
  };
  const save = () => {
    setError("");
    if (!clientId) return setError("Selecione um cliente.");
    if (!professionalId) return setError("Selecione um profissional.");
    if (!serviceIds.length) return setError("Selecione pelo menos um serviço.");
    if (!date || !start) return setError("Informe data e horário.");
    const conflict = appointments.find(
      (a) => a.id !== editId && a.date === date && a.professionalId === professionalId && ["scheduled", "confirmed", "in_progress", "completed"].includes(a.status) && parseTime(start) < parseTime(a.end) && parseTime(end) > parseTime(a.start)
    );
    if (conflict) {
      const conflictClient = clients.find((c) => c.id === conflict.clientId)?.name ?? "outro cliente";
      return setError(`Conflito de horário: ${conflict.start}–${conflict.end} com ${conflictClient}.`);
    }
    const payload = {
      id: editing?.id ?? uid("apt"),
      companyId: company.id,
      clientId,
      professionalId,
      serviceIds,
      date,
      start,
      end,
      status,
      price,
      discount: Number(discount) || 0,
      paymentMethod: status === "completed" ? paymentMethod || "pix" : paymentMethod,
      notes,
      createdAt: editing?.createdAt ?? todayISO()
    };
    if (editing) {
      updateAppointment(editing.id, payload);
      toast("Agendamento atualizado com sucesso.", "success", "Agenda");
    } else {
      addAppointment(payload);
      toast(`${clients.find((c) => c.id === clientId)?.name ?? "Cliente"} · ${date.split("-").reverse().join("/")} às ${start}`, "success", "Agendamento criado");
    }
    onClose();
  };
  return <Modal
    open
    onClose={onClose}
    title={editing ? "Editar agendamento" : "Novo agendamento"}
    subtitle={editing ? "Atualize os detalhes do atendimento na agenda." : "Reserve um horário em poucos segundos."}
    size="lg"
    footer={<>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>{editing ? "Salvar alterações" : "Confirmar agendamento"}</Button>
        </>}
  >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cliente" required className="sm:col-span-2">
          <Select value={clientId} onChange={(event) => setClientId(event.target.value)}>
            <option value="">Selecione um cliente</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </Select>
        </Field>

        <Field label="Profissional" required>
          <Select value={professionalId} onChange={(event) => setProfessionalId(event.target.value)}>
            <option value="">Selecione</option>
            {activePros.map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
          </Select>
        </Field>

        <Field label="Data" required>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-[#555a52]">Serviços <span className="text-[#cf5a4d]">*</span></span>
            {duration > 0 && <span className="text-[10.5px] font-medium text-[#8a8e85]">{duration} min no total</span>}
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {activeServices.map((service) => {
    const selected = serviceIds.includes(service.id);
    return <button
      key={service.id}
      type="button"
      onClick={() => toggleService(service.id)}
      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition ${selected ? "border-[#a9b48a] bg-[var(--brand-soft)] shadow-[0_0_0_1px_rgba(160,180,110,0.35)]" : "border-[#e7e5dc] bg-white hover:border-[#cfcdc2]"}`}
    >
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold text-ink">{service.name}</span>
                    <span className="block text-[10px] text-[#8a8e85]">{service.duration} min · {service.category}</span>
                  </span>
                  <span className="shrink-0 text-[11.5px] font-bold text-ink">{brl(service.price)}</span>
                </button>;
  })}
          </div>
        </div>

        <Field label="Início" required hint={serviceIds.length ? `Término previsto às ${end}` : void 0}>
          <Select value={start} onChange={(event) => setStart(event.target.value)}>
            {TIME_OPTIONS.map((time) => <option key={time} value={time}>{time}</option>)}
          </Select>
        </Field>

        <Field label="Status">
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </Field>

        <Field label="Valor do serviço" hint={`Sugerido: ${brl(autoPrice)}`}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9a9d95]">R$</span>
            <Input
    type="number"
    min="0"
    step="0.01"
    className="pl-8"
    value={priceOverride}
    onChange={(event) => setPriceOverride(event.target.value)}
  />
          </div>
        </Field>

        <Field label="Desconto (R$)">
          <Input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} />
        </Field>

        <Field label="Forma de pagamento">
          <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="">A definir</option>
            <option value="pix">Pix</option>
            <option value="credit">Cartão de crédito</option>
            <option value="debit">Cartão de débito</option>
            <option value="cash">Dinheiro</option>
            <option value="transfer">Transferência</option>
          </Select>
        </Field>

        <Field label="Observações" className="sm:col-span-2">
          <Textarea rows={2} placeholder="Preferências, pedidos especiais, lembretes..." value={notes} onChange={(event) => setNotes(event.target.value)} />
        </Field>
      </div>

      {error && <p className="mt-4 rounded-lg border border-[#f3d9d4] bg-[#fbeeec] px-3 py-2 text-[11.5px] font-medium text-[#b64c40]">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[#ebe9e1] bg-white px-4 py-3 text-[11.5px] text-[#6d726a]">
        <span className="flex items-center gap-1.5"><UserRound size={13} /> {clients.find((c) => c.id === clientId)?.name ?? "Cliente"}</span>
        <span className="flex items-center gap-1.5"><Scissors size={13} /> {selectedServices.length} serviço(s)</span>
        <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {date.split("-").reverse().join("/")}</span>
        <span className="flex items-center gap-1.5"><Clock3 size={13} /> {start} – {end}</span>
        <span className="ml-auto flex items-center gap-1.5 font-bold text-ink"><Wallet size={13} /> {brl(price - (Number(discount) || 0))}</span>
      </div>
    </Modal>;
}
export {
  AppointmentModal
};
