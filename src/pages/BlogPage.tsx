import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {BLOG_ARTICLES} from '../data/blog';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {Reveal, SafeImage} from '../components/MotionPrimitives';
import {FinalCtaSection} from '../components/home/FinalCtaSection';

export function BlogPage() {
  const {lang, t} = useLanguage();
  useDocumentMeta(t.seo.blogTitle, t.blogPage.subtitle);

  return (
    <main className="pt-28 md:pt-36">
      <section className="px-4 sm:px-6 lg:px-10 pb-16">
        <div className="max-w-[1440px] mx-auto space-y-12">
          <div className="max-w-3xl rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-3">
            <Reveal>
              <p className="text-[13px] font-medium text-[#5A5A56] dark:text-[#A1A7B8]">
                {t.blogPage.label}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="text-[clamp(2.2rem,4.4vw,3.8rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#111111] dark:text-white">
                {t.blogPage.title}
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-[15px] sm:text-[16px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                {t.blogPage.subtitle}
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BLOG_ARTICLES.map((article, idx) => (
              <Reveal key={article.slug} delay={idx * 0.1}>
                <Link
                  to={`/blog/${article.slug}`}
                  className="group block rounded-[28px] bg-white/95 dark:bg-[#141926]/95 p-4 sm:p-5 border border-black/5 dark:border-white/10 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden rounded-[22px] aspect-[16/10] bg-[#0B1F5C] mb-5">
                    <SafeImage
                      src={article.image}
                      alt={article.title[lang]}
                      width={900}
                      height={560}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white text-[#0B1F5C] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#FF8A00] group-hover:text-white"
                    >
                      <ArrowUpRight className="w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </div>

                  <div className="px-2 pb-2 space-y-2.5">
                    <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                      {article.category[lang]} · {article.date[lang]} · {article.readTime[lang]}
                    </p>
                    <h2 className="text-2xl font-normal text-[#111111] dark:text-white tracking-[-0.02em] group-hover:text-[#0B1F5C] dark:group-hover:text-[#FF8A00] transition-colors">
                      {article.title[lang]}
                    </h2>
                    <p className="text-[15px] text-[#5A5A56] dark:text-[#A1A7B8] leading-relaxed">
                      {article.excerpt[lang]}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaSection />
    </main>
  );
}
