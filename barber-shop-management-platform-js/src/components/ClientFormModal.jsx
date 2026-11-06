import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Button, Field, Input, Modal, Select, Textarea } from "@/components/ui";
import { todayISO, uid } from "@/lib/utils";
const emptyForm = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  birthDate: "",
  cpf: "",
  address: "",
  preferences: "",
  preferredProfessionalId: "",
  notes: ""
};
function ClientFormModal({
  open,
  onClose,
  client,
  onSaved
}) {
  const { company, professionals, addClient, updateClient } = useStore();
  const { toast } = useUI();
  const [form, setForm] = useState(
    () => client ? {
      name: client.name,
      phone: client.phone,
      whatsapp: client.whatsapp,
      email: client.email,
      birthDate: client.birthDate,
      cpf: client.cpf,
      address: client.address,
      preferences: client.preferences,
      preferredProfessionalId: client.preferredProfessionalId,
      notes: client.notes
    } : emptyForm
  );
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      client ? {
        name: client.name,
        phone: client.phone,
        whatsapp: client.whatsapp,
        email: client.email,
        birthDate: client.birthDate,
        cpf: client.cpf,
        address: client.address,
        preferences: client.preferences,
        preferredProfessionalId: client.preferredProfessionalId,
        notes: client.notes
      } : emptyForm
    );
  }, [open, client]);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const onSubmit = () => {
    if (!form.name.trim()) return setError("Informe o nome completo do cliente.");
    if (!form.phone.trim()) return setError("Informe pelo menos um telefone de contato.");
    const id = client?.id ?? uid("cli");
    if (client) {
      updateClient(client.id, form);
      toast("Cadastro do cliente atualizado.", "success", "CRM");
    } else {
      addClient({
        ...form,
        id,
        companyId: company.id,
        createdAt: todayISO(),
        whatsapp: form.whatsapp || form.phone,
        cpf: form.cpf
      });
      toast(`${form.name.split(" ")[0]} entrou para a sua base de clientes.`, "success", "Novo cliente");
    }
    onSaved?.(id);
    onClose();
  };
  return <Modal
    open={open}
    onClose={onClose}
    title={client ? "Editar cliente" : "Novo cliente"}
    subtitle={client ? "Mantenha os dados e preferências sempre atualizados." : "Cadastre o cliente e comece a construir um relacionamento."}
    size="lg"
    footer={<>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSubmit}>{client ? "Salvar alterações" : "Cadastrar cliente"}</Button>
        </>}
  >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo" required className="sm:col-span-2">
          <Input placeholder="Ex.: Gabriel Almeida" value={form.name} onChange={(event) => set("name", event.target.value)} />
        </Field>
        <Field label="Telefone" required>
          <Input placeholder="(11) 99999-9999" value={form.phone} onChange={(event) => set("phone", event.target.value)} />
        </Field>
        <Field label="WhatsApp" hint="Deixe em branco para usar o telefone">
          <Input placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} />
        </Field>
        <Field label="E-mail">
          <Input type="email" placeholder="cliente@email.com" value={form.email} onChange={(event) => set("email", event.target.value)} />
        </Field>
        <Field label="Data de nascimento">
          <Input type="date" value={form.birthDate} onChange={(event) => set("birthDate", event.target.value)} />
        </Field>
        <Field label="CPF (opcional)">
          <Input placeholder="000.000.000-00" value={form.cpf} onChange={(event) => set("cpf", event.target.value)} />
        </Field>
        <Field label="Barbeiro preferido">
          <Select value={form.preferredProfessionalId} onChange={(event) => set("preferredProfessionalId", event.target.value)}>
            <option value="">Sem preferência</option>
            {professionals.filter((p) => p.active).map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
          </Select>
        </Field>
        <Field label="Endereço" className="sm:col-span-2">
          <Input placeholder="Rua, número, bairro — cidade" value={form.address} onChange={(event) => set("address", event.target.value)} />
        </Field>
        <Field label="Preferências de atendimento" className="sm:col-span-2">
          <Textarea
    rows={2}
    placeholder="Ex.: degradê baixo, toalha quente na barba, sem conversa durante o corte..."
    value={form.preferences}
    onChange={(event) => set("preferences", event.target.value)}
  />
        </Field>
        <Field label="Anotações internas" className="sm:col-span-2" hint="Visível apenas para a equipe.">
          <Textarea
    rows={2}
    placeholder="Informações relevantes para o atendimento..."
    value={form.notes}
    onChange={(event) => set("notes", event.target.value)}
  />
        </Field>
      </div>
      {error && <p className="mt-4 rounded-lg border border-[#f3d9d4] bg-[#fbeeec] px-3 py-2 text-[11.5px] font-medium text-[#b64c40]">{error}</p>}
    </Modal>;
}
export {
  ClientFormModal
};
