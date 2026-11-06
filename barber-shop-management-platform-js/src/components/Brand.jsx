import { Scissors } from "lucide-react";
import { cn } from "@/utils/cn";
function BrandMark({ size = 34, className }) {
  return <span
    className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[var(--brand)] text-[var(--brand-ink)]", className)}
    style={{ width: size, height: size }}
  >
      <Scissors size={size * 0.5} strokeWidth={2.4} className="-rotate-[18deg]" />
      <span className="absolute bottom-[4px] right-[4px] h-1 w-1 rounded-full bg-[var(--brand-ink)]/60" />
    </span>;
}
function Wordmark({ compact = false }) {
  return <span className="flex flex-col leading-none">
      <span className="text-[13.5px] font-extrabold tracking-[0.16em] text-white">BARBER</span>
      {!compact && <span className="mt-[3px] text-[8.5px] font-bold tracking-[0.28em] text-white/45">PRO FUTURE</span>}
    </span>;
}
function CompanyAvatar({ company, size = 32 }) {
  return <span
    className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[9px] font-extrabold"
    style={{
      width: size,
      height: size,
      fontSize: size * 0.32,
      backgroundColor: company.brand.primary,
      color: company.brand.secondary
    }}
  >
      {company.logo ? <img src={company.logo} alt={company.name} className="h-full w-full object-cover" /> : company.initials}
    </span>;
}
export {
  BrandMark,
  CompanyAvatar,
  Wordmark
};
