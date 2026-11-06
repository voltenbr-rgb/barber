import {
  useEffect,
  useId,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2, X, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";
import { initials } from "@/lib/utils";
function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...props
}) {
  const variants = {
    primary: "bg-[var(--brand)] text-[var(--brand-ink)] hover:brightness-[0.96] active:brightness-90 shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_-12px_rgba(0,0,0,0.55)]",
    dark: "bg-ink text-white hover:bg-[#232823] active:bg-[#0b0d0b]",
    outline: "border border-[#dedcd2] bg-white text-ink hover:border-[#c4c2b6] hover:bg-[#fafaf6]",
    ghost: "text-[#5d625b] hover:bg-[#efeee7] hover:text-ink",
    danger: "bg-[#cf5a4d] text-white hover:bg-[#bd4d41]",
    soft: "bg-[#f1f0e9] text-ink hover:bg-[#e8e6dd]"
  };
  const sizes = {
    sm: "h-8 rounded-lg px-3 text-[12px] gap-1.5",
    md: "h-10 rounded-[10px] px-4 text-[13px] gap-2",
    lg: "h-12 rounded-xl px-5 text-[14px] gap-2",
    icon: "h-9 w-9 rounded-[10px] justify-center"
  };
  return <button
    className={cn(
      "focus-ring inline-flex select-none items-center justify-center font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50",
      variants[variant],
      sizes[size],
      className
    )}
    disabled={loading || props.disabled}
    {...props}
  >
      {loading ? <Loader2 size={15} className="animate-spin" /> : null}
      {children}
    </button>;
}
function Card({
  className,
  children,
  ...rest
}) {
  return <div className={cn("card-surface rounded-2xl", className)} {...rest}>
      {children}
    </div>;
}
function CardHeader({
  title,
  subtitle,
  action,
  className
}) {
  return <div className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-5", className)}>
      <div className="min-w-0">
        <h3 className="text-[14px] font-bold tracking-[-0.01em] text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11.5px] text-[#8a8e85]">{subtitle}</p>}
      </div>
      {action}
    </div>;
}
function Badge({
  children,
  className,
  dot
}) {
  return <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[10.5px] font-bold leading-none tracking-[0.01em]",
      className ?? "border-[#e5e3da] bg-[#f4f3ee] text-[#666b63]"
    )}
  >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
      {children}
    </span>;
}
const fieldBase = "w-full rounded-[10px] border border-[#e2e0d6] bg-white text-[13px] text-ink placeholder:text-[#a9aca4] transition focus:border-[#b8bcae] focus:ring-4 focus:ring-[#101310]/[0.04] disabled:bg-[#f7f6f1]";
function Field({
  label,
  hint,
  error,
  required,
  children,
  className
}) {
  return <label className={cn("block", className)}>
      {label && <span className="mb-1.5 flex items-center gap-1 text-[11.5px] font-semibold text-[#555a52]">
          {label}
          {required && <span className="text-[#cf5a4d]">*</span>}
        </span>}
      {children}
      {hint && !error && <span className="mt-1 block text-[10.5px] text-[#9a9d95]">{hint}</span>}
      {error && <span className="mt-1 block text-[10.5px] font-medium text-[#cf5a4d]">{error}</span>}
    </label>;
}
function Input({ className, ...props }) {
  return <input className={cn(fieldBase, "h-10 px-3", className)} {...props} />;
}
function Textarea({ className, ...props }) {
  return <textarea className={cn(fieldBase, "min-h-[88px] resize-y px-3 py-2.5", className)} {...props} />;
}
function Select({
  className,
  children,
  ...props
}) {
  return <select className={cn(fieldBase, "select-field h-10 cursor-pointer pl-3", className)} {...props}>
      {children}
    </select>;
}
function Switch({
  checked,
  onChange,
  label,
  description
}) {
  return <div className="flex items-start justify-between gap-4">
      {(label || description) && <div className="min-w-0">
          {label && <p className="text-[12.5px] font-semibold text-ink">{label}</p>}
          {description && <p className="mt-0.5 text-[11px] leading-relaxed text-[#8a8e85]">{description}</p>}
        </div>}
      <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      "focus-ring relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200",
      checked ? "bg-ink" : "bg-[#d8d7ce]"
    )}
  >
        <span
    className={cn(
      "absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
      checked ? "left-[19px] bg-[var(--brand)]" : "left-[3px]"
    )}
  />
      </button>
    </div>;
}
function Avatar({
  name,
  src,
  size = 36,
  className,
  ring
}) {
  const [failed, setFailed] = useState(false);
  const hues = ["#6c7d5a", "#7c6a58", "#607080", "#7a6579", "#88755b", "#5c766a"];
  const hue = hues[name.charCodeAt(0) % hues.length];
  return <span
    className={cn(
      "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e7df] font-bold text-white",
      ring && "ring-2 ring-white",
      className
    )}
    style={{ width: size, height: size, fontSize: Math.max(9, size * 0.34), backgroundColor: src && !failed ? "#e8e7df" : hue }}
    aria-label={name}
  >
      {src && !failed ? <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} loading="lazy" /> : initials(name)}
    </span>;
}
function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md"
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);
  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
      <div className="anim-in fixed inset-0 bg-[#0b0e0b]/55 backdrop-blur-[3px]" onClick={onClose} />
      <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "anim-pop relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#e6e4db] bg-[#fbfbf8] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.5)] sm:rounded-2xl",
        widths[size]
      )}
    >
        {(title || subtitle) && <div className="flex items-start justify-between gap-4 border-b border-[#ebe9e1] bg-white px-5 py-4">
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold tracking-[-0.02em] text-ink">{title}</h2>
              {subtitle && <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#8a8e85]">{subtitle}</p>}
            </div>
            <button
      onClick={onClose}
      className="focus-ring -mr-1 rounded-lg p-2 text-[#8a8e85] transition hover:bg-[#f2f1ea] hover:text-ink"
      aria-label="Fechar"
    >
              <X size={17} />
            </button>
          </div>}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#ebe9e1] bg-white px-5 py-3.5">
            {footer}
          </div>}
      </div>
    </div>,
    document.body
  );
}
function Drawer({
  open,
  onClose,
  children,
  width = "max-w-[520px]"
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[65]">
      <div className="anim-in absolute inset-0 bg-[#0b0e0b]/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "anim-slide absolute inset-y-0 right-0 flex w-full flex-col overflow-hidden border-l border-[#e6e4db] bg-[#fbfbf8] shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.45)]",
        width
      )}
    >
        {children}
      </div>
    </div>,
    document.body
  );
}
function Dropdown({
  trigger,
  children,
  align = "right",
  className,
  panelClassName,
  open: controlledOpen,
  onOpenChange
}) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = (next) => {
    onOpenChange?.(next);
    if (controlledOpen === void 0) setUncontrolled(next);
  };
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  const close = () => setOpen(false);
  return <div ref={ref} className={cn("relative inline-block", className)}>
      <div onClick={() => setOpen(!open)}>{trigger(open)}</div>
      {open && <div
    className={cn(
      "anim-pop absolute z-40 mt-2 min-w-[190px] overflow-hidden rounded-xl border border-[#e6e4db] bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(16,19,16,0.35)]",
      align === "right" ? "right-0" : "left-0",
      panelClassName
    )}
  >
          {typeof children === "function" ? children(close) : children}
        </div>}
    </div>;
}
function MenuItem({
  children,
  onClick,
  icon,
  danger,
  className
}) {
  return <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium transition",
      danger ? "text-[#b64c40] hover:bg-[#fbeeec]" : "text-[#494e47] hover:bg-[#f4f3ee] hover:text-ink",
      className
    )}
  >
      {icon && <span className="shrink-0 opacity-80">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>;
}
function Segmented({
  options,
  value,
  onChange,
  size = "md",
  className
}) {
  return <div className={cn("inline-flex items-center gap-0.5 rounded-[10px] border border-[#e5e3da] bg-[#f5f4ef] p-[3px]", className)}>
      {options.map((option) => <button
    key={option.value}
    type="button"
    onClick={() => onChange(option.value)}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-[7px] font-semibold transition-all",
      size === "sm" ? "h-6 px-2 text-[10.5px]" : "h-7 px-2.5 text-[11.5px]",
      value === option.value ? "bg-white text-ink shadow-[0_1px_3px_rgba(16,19,16,0.12)]" : "text-[#868a81] hover:text-ink"
    )}
  >
          {option.icon}
          {option.label}
        </button>)}
    </div>;
}
function Progress({ value, className, barClassName }) {
  return <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[#efeee7]", className)}>
      <div
    className={cn("h-full rounded-full bg-[var(--brand)] transition-[width] duration-500", barClassName)}
    style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
  />
    </div>;
}
function EmptyState({ icon, title, description, action }) {
  return <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e6dd] bg-[#f7f6f1] text-[#868a81]">{icon}</div>}
      <p className="text-[13px] font-bold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-[#8a8e85]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>;
}
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  danger = true
}) {
  return <Modal
    open={open}
    onClose={onClose}
    size="sm"
    title={title}
    footer={<>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
      variant={danger ? "danger" : "dark"}
      onClick={() => {
        onConfirm();
        onClose();
      }}
    >
            {confirmLabel}
          </Button>
        </>}
  >
      <div className="flex gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", danger ? "bg-[#fbeeec] text-[#cf5a4d]" : "bg-[#f3f2ec] text-ink")}>
          <AlertTriangle size={19} />
        </span>
        <p className="pt-1.5 text-[12.5px] leading-relaxed text-[#5d625b]">{description}</p>
      </div>
    </Modal>;
}
function CheckItem({ children }) {
  return <div className="flex items-start gap-2 text-[12px] text-[#5d625b]">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#edf5e9] text-[#3f7a49]">
        <Check size={11} strokeWidth={3} />
      </span>
      {children}
    </div>;
}
function PageHeader({
  eyebrow,
  title,
  description,
  actions
}) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#8a8e85]">{eyebrow}</div>}
        <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-[27px]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-[#7c8179]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>;
}
function MiniSelect({
  value,
  onChange,
  options,
  className
}) {
  const id = useId();
  return <div className={cn("relative", className)}>
      <select
    id={id}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="select-field h-8 cursor-pointer rounded-lg border border-[#e3e1d8] bg-white pl-2.5 pr-7 text-[11.5px] font-semibold text-[#555a52] transition hover:border-[#cfcdc2] focus:border-[#b8bcae]"
  >
        {options.map((option) => <option key={option.value} value={option.value}>
            {option.label}
          </option>)}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8a8e85]" />
    </div>;
}
export {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  CheckItem,
  ConfirmDialog,
  Drawer,
  Dropdown,
  EmptyState,
  Field,
  Input,
  MenuItem,
  MiniSelect,
  Modal,
  PageHeader,
  Progress,
  Segmented,
  Select,
  Switch,
  Textarea
};
