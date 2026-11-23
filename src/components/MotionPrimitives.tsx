import React, {useEffect, useRef, useState} from 'react';
import {motion, useInView, useReducedMotion} from 'motion/react';
import {Compass} from 'lucide-react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
}

export function Reveal({children, delay = 0, className = '', yOffset = 40}: RevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{opacity: 0, y: yOffset}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.12}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface CountUpProps {
  target: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export function CountUp({target, suffix = '', durationMs = 1100, className = ''}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, {once: true, amount: 0.4});
  const prefersReduced = useReducedMotion();
  const [value, setValue] = useState(prefersReduced ? target : 0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [inView, target, durationMs, prefersReduced]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
      {suffix}
    </span>
  );
}

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  loading = 'lazy',
  ...rest
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1F5C] via-[#173688] to-[#0B1F5C] text-white/90 p-4 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackTitle || 'Horizo Tour'}
      >
        <Compass className="w-8 h-8 text-[#FF8A00] mb-2" />
        <span className="text-xs font-medium tracking-wide opacity-80">
          {fallbackTitle || alt || 'Horizo Tour'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
