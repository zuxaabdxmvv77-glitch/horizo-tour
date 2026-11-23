import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {TourDestination} from '../data/tours';
import {useLanguage} from '../context/LanguageContext';
import {SafeImage} from './MotionPrimitives';

interface TourCardProps {
  tour: TourDestination;
  className?: string;
}

export function TourCard({tour, className = ''}: TourCardProps) {
  const {lang, langMeta, formatPrice} = useLanguage();

  return (
    <Link
      to={`/tours/${tour.slug}`}
      dir={langMeta.dir}
      className={`group relative block overflow-hidden rounded-[22px] md:rounded-[26px] aspect-[4/3] bg-[#0B1F5C] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00] ${className}`}
    >
      <SafeImage
        src={tour.image}
        alt={tour.name[lang]}
        fallbackTitle={tour.name[lang]}
        width={800}
        height={600}
        className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
      />

      {/* Dark gradient scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/22 to-black/10 transition-opacity duration-300" />

      {/* Top-right circular arrow button */}
      <span
        aria-hidden="true"
        className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-white/18 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all duration-300 group-hover:bg-[#FF8A00] group-hover:border-[#FF8A00]"
      >
        <ArrowUpRight className="w-[17px] h-[17px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-45" />
      </span>

      {/* Bottom title & price */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
        <p className="text-[12px] text-white/75 mb-0.5">{tour.country[lang]}</p>
        <h3 className="text-[18px] sm:text-[20px] font-normal tracking-[-0.02em] leading-tight">
          {tour.name[lang]}
        </h3>
        <p className="mt-1 text-[14px] font-medium text-[#FF8A00] tabular-nums">
          {formatPrice(tour.priceUsd)}
        </p>
      </div>
    </Link>
  );
}
