import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[#0c3d6e] text-white hover:bg-[#0a3259] shadow-sm",
  secondary:
    "bg-white text-[#0c3d6e] border border-[#0c3d6e] hover:bg-accent",
  outline:
    "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50",
  ghost: "bg-transparent text-[#0c3d6e] hover:bg-accent",
};

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
