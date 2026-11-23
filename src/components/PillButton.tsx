import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';

interface PillButtonProps {
  label: string;
  to?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  variant?: 'navy' | 'white' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function PillButton({
  label,
  to,
  href,
  external = false,
  onClick,
  variant = 'navy',
  className = '',
  type = 'button',
  disabled = false,
}: PillButtonProps) {
  const pillStyles =
    variant === 'white'
      ? 'bg-white text-[#0B1F5C] group-hover:bg-white group-hover:shadow-[0_10px_28px_rgba(255,255,255,0.28)]'
      : variant === 'outline'
        ? 'bg-white/90 dark:bg-[#141926]/90 text-[#0B1F5C] dark:text-white border border-[#0B1F5C]/25 dark:border-white/25 group-hover:border-[#FF8A00] dark:group-hover:border-[#FF8A00] group-hover:text-[#0B1F5C] dark:group-hover:text-white group-hover:shadow-[0_10px_24px_rgba(255,138,0,0.16)]'
        : 'bg-[#0B1F5C] dark:bg-white text-white dark:text-[#0B1F5C] group-hover:bg-[#14338f] dark:group-hover:bg-[#FFF6EB] group-hover:shadow-[0_12px_28px_rgba(11,31,92,0.26)] dark:group-hover:shadow-[0_12px_28px_rgba(255,138,0,0.2)]';

  const circleStyles =
    variant === 'white'
      ? 'bg-white text-[#0B1F5C] group-hover:bg-[#FF8A00] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(255,138,0,0.45)]'
      : variant === 'outline'
        ? 'bg-white dark:bg-[#141926] text-[#0B1F5C] dark:text-white border border-[#0B1F5C]/25 dark:border-white/25 group-hover:bg-[#FF8A00] group-hover:text-white group-hover:border-[#FF8A00] group-hover:shadow-[0_8px_20px_rgba(255,138,0,0.45)]'
        : 'bg-[#0B1F5C] dark:bg-white text-white dark:text-[#0B1F5C] group-hover:bg-[#FF8A00] group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(255,138,0,0.45)]';

  const content = (
    <>
      <span
        className={`relative overflow-hidden inline-flex items-center justify-center rounded-full px-6 py-3 min-h-[44px] text-[14px] md:text-[15px] font-medium whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${pillStyles}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
        <span className="relative z-10">{label}</span>
      </span>
      <span
        className={`inline-flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 group-hover:rotate-6 ${circleStyles}`}
        aria-hidden="true"
      >
        <ArrowUpRight className="w-[18px] h-[18px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </>
  );

  const wrapperClass = `group inline-flex items-center gap-1.5 cursor-pointer transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00] rounded-full disabled:opacity-55 disabled:pointer-events-none ${className}`;

  if (to) {
    return (
      <Link to={to} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={wrapperClass}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={wrapperClass}>
      {content}
    </button>
  );
}
