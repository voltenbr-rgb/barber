import { useState } from "react";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { Button, Dropdown, Field, Input, MenuItem, Modal } from "@/components/ui";
import { addDays, DATE_PERIOD_OPTIONS, fmtDate, toISO } from "@/lib/utils";
const defaultPeriod = () => {
  const today = /* @__PURE__ */ new Date();
  return {
    key: "30d",
    start: toISO(addDays(today, -29)),
    end: toISO(today)
  };
};
const periodFromKey = (key, customStart, customEnd) => {
  const today = /* @__PURE__ */ new Date();
  const end = toISO(today);
  if (key === "today") return { key, start: end, end };
  if (key === "7d") return { key, start: toISO(addDays(today, -6)), end };
  if (key === "90d") return { key, start: toISO(addDays(today, -89)), end };
  if (key === "custom") return { key, start: customStart ?? toISO(addDays(today, -14)), end: customEnd ?? end };
  return { key: "30d", start: toISO(addDays(today, -29)), end };
};
function PeriodFilter({ value, onChange, label = "Período" }) {
  const [customOpen, setCustomOpen] = useState(false);
  const [start, setStart] = useState(value.start);
  const [end, setEnd] = useState(value.end);
  const activeLabel = value.key === "custom" ? `${fmtDate(value.start)} – ${fmtDate(value.end)}` : DATE_PERIOD_OPTIONS.find((option) => option.value === value.key)?.label ?? "30 dias";
  return <>
      <Dropdown
    align="right"
    panelClassName="w-[200px]"
    trigger={() => <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#e1dfd5] bg-white px-2.5 text-[11.5px] font-semibold text-[#555a52] transition hover:border-[#cfcdc2]">
            <CalendarDays size={13} className="text-[#8a8e85]" />
            <span className="text-[#9a9d95]">{label}:</span>
            {activeLabel}
            <ChevronDown size={12} className="ml-0.5 text-[#9a9d95]" />
          </button>}
  >
        {(close) => <>
            {DATE_PERIOD_OPTIONS.map((option) => <MenuItem
    key={option.value}
    onClick={() => {
      close();
      if (option.value === "custom") setCustomOpen(true);
      else onChange(periodFromKey(option.value));
    }}
    icon={value.key === option.value ? <Check size={13} /> : <span className="block h-[13px] w-[13px]" />}
  >
                {option.value === "custom" ? "Personalizado" : option.value === "today" ? "Hoje" : `Últimos ${option.label}`}
              </MenuItem>)}
          </>}
      </Dropdown>

      <Modal
    open={customOpen}
    onClose={() => setCustomOpen(false)}
    title="Período personalizado"
    subtitle="Escolha a data inicial e final para analisar os indicadores."
    size="sm"
    footer={<>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>Cancelar</Button>
            <Button
      onClick={() => {
        if (start > end) return;
        onChange({ key: "custom", start, end });
        setCustomOpen(false);
      }}
    >
              Aplicar período
            </Button>
          </>}
  >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data inicial">
            <Input type="date" value={start} max={end} onChange={(event) => setStart(event.target.value)} />
          </Field>
          <Field label="Data final">
            <Input type="date" value={end} min={start} onChange={(event) => setEnd(event.target.value)} />
          </Field>
        </div>
      </Modal>
    </>;
}
export {
  PeriodFilter,
  defaultPeriod,
  periodFromKey
};
