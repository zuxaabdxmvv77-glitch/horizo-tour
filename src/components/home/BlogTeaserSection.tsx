import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {useLanguage} from '../../context/LanguageContext';
import {BLOG_ARTICLES} from '../../data/blog';
import {Reveal, SafeImage} from '../MotionPrimitives';
import {PillButton} from '../PillButton';

export function BlogTeaserSection() {
  const {lang, t} = useLanguage();

  const [first, second] = BLOG_ARTICLES;

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto space-y-10 md:space-y-12">
        {/* Heading Row */}
        <div className="rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Reveal>
              <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                {t.blogSection.label}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-[clamp(1.85rem,3.4vw,3.1rem)] font-light leading-[1.12] tracking-[-0.03em] text-[#111111] dark:text-white">
                {t.blogSection.heading}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.14}>
            <PillButton label={t.blogSection.allArticlesCta} to="/blog" />
          </Reveal>
        </div>

        {/* One wide (7-col) + one narrow (5-col) rounded editorial blog cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {first && (
            <Reveal className="lg:col-span-7">
              <Link
                to={`/blog/${first.slug}`}
                className="group relative block overflow-hidden rounded-[24px] md:rounded-[30px] aspect-[4/3] lg:aspect-[16/11] bg-[#0B1F5C]"
              >
                <SafeImage
                  src={first.image}
                  alt={first.title[lang]}
                  width={900}
                  height={620}
                  className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <span
                  aria-hidden="true"
                  className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/18 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-colors duration-300 group-hover:bg-[#FF8A00] group-hover:border-[#FF8A00]"
                >
                  <ArrowUpRight className="w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-45" />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white space-y-2">
                  <p className="text-[13px] text-white/80">
                    {first.date[lang]} · {first.readTime[lang]}
                  </p>
                  <h3 className="text-[22px] sm:text-[26px] font-normal leading-tight tracking-[-0.02em]">
                    {first.title[lang]}
                  </h3>
                </div>
              </Link>
            </Reveal>
          )}

          {second && (
            <Reveal delay={0.1} className="lg:col-span-5">
              <Link
                to={`/blog/${second.slug}`}
                className="group relative block overflow-hidden rounded-[24px] md:rounded-[30px] aspect-[4/3] lg:aspect-auto lg:h-full bg-[#0B1F5C]"
              >
                <SafeImage
                  src={second.image}
                  alt={second.title[lang]}
                  width={700}
                  height={620}
                  className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <span
                  aria-hidden="true"
                  className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/18 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-colors duration-300 group-hover:bg-[#FF8A00] group-hover:border-[#FF8A00]"
                >
                  <ArrowUpRight className="w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-45" />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white space-y-2">
                  <p className="text-[13px] text-white/80">
                    {second.date[lang]} · {second.readTime[lang]}
                  </p>
                  <h3 className="text-[22px] sm:text-[24px] font-normal leading-tight tracking-[-0.02em]">
                    {second.title[lang]}
                  </h3>
                </div>
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
