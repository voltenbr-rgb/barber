import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
const UIContext = createContext(null);
let toastSeq = 0;
function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [appointmentPreset, setAppointmentPreset] = useState(null);
  const [appointmentEditId, setAppointmentEditId] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast2) => toast2.id !== id));
  }, []);
  const toast = useCallback(
    (message, tone = "success", title) => {
      const id = ++toastSeq;
      setToasts((prev) => [...prev.slice(-2), { id, message, tone, title }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );
  const value = useMemo(
    () => ({
      toasts,
      toast,
      dismissToast,
      clientId,
      openClient: (id) => setClientId(id),
      closeClient: () => setClientId(null),
      appointmentPreset,
      appointmentEditId,
      openAppointment: (preset = {}, editId = null) => {
        setAppointmentPreset(preset);
        setAppointmentEditId(editId);
      },
      closeAppointment: () => {
        setAppointmentPreset(null);
        setAppointmentEditId(null);
      },
      commandOpen,
      setCommandOpen,
      mobileNavOpen,
      setMobileNavOpen
    }),
    [toasts, toast, dismissToast, clientId, appointmentPreset, appointmentEditId, commandOpen, mobileNavOpen]
  );
  return <UIContext.Provider value={value}>
      {children}
      <Toaster />
    </UIContext.Provider>;
}
function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside UIProvider");
  return context;
}
const toneStyles = {
  success: {
    border: "border-l-[#2f8f5b]",
    icon: <CheckCircle2 size={18} className="text-[#2f8f5b]" />
  },
  error: {
    border: "border-l-[#cf5a4d]",
    icon: <AlertTriangle size={18} className="text-[#cf5a4d]" />
  },
  info: {
    border: "border-l-[#3d7bfa]",
    icon: <Info size={18} className="text-[#3d7bfa]" />
  }
};
function Toaster() {
  const { toasts, dismissToast } = useUI();
  return <div className="pointer-events-none fixed bottom-5 right-4 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6">
      {toasts.map((item) => <div
    key={item.id}
    className={`anim-slide pointer-events-auto flex items-start gap-3 rounded-xl border border-[#e7e5dc] border-l-[3px] bg-white px-4 py-3 shadow-[0_18px_50px_-20px_rgba(16,19,16,0.45)] ${toneStyles[item.tone].border}`}
    role="status"
  >
          <span className="mt-0.5 shrink-0">{toneStyles[item.tone].icon}</span>
          <div className="min-w-0 flex-1">
            {item.title && <p className="text-[13px] font-bold text-ink">{item.title}</p>}
            <p className="text-[12.5px] leading-snug text-[#5d625b]">{item.message}</p>
          </div>
          <button
    onClick={() => dismissToast(item.id)}
    className="rounded-md p-1 text-[#9a9d95] transition hover:bg-[#f3f2ec] hover:text-ink"
    aria-label="Fechar notificação"
  >
            <X size={14} />
          </button>
        </div>)}
    </div>;
}
export {
  UIProvider,
  useUI
};
