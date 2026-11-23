import React from 'react';
import {Link, useParams} from 'react-router-dom';
import {ArrowLeft} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {getBlogBySlug} from '../data/blog';
import {useDocumentMeta} from '../hooks/useDocumentMeta';
import {Reveal, SafeImage} from '../components/MotionPrimitives';
import {PillButton} from '../components/PillButton';

export function BlogDetailPage() {
  const {slug} = useParams();
  const {lang, t} = useLanguage();
  const article = getBlogBySlug(slug);

  useDocumentMeta(
    article ? `${article.title[lang]} — Horizo Tour` : t.blogPage.notFound,
    article ? article.excerpt[lang] : t.blogPage.subtitle
  );

  if (!article) {
    return (
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-3xl mx-auto rounded-[28px] bg-white dark:bg-[#141926] p-10 text-center space-y-6 border border-black/5 dark:border-white/10">
          <h1 className="text-3xl font-light text-[#111111] dark:text-white">
            {t.blogPage.notFound}
          </h1>
          <PillButton label={t.blogPage.backToBlog} to="/blog" />
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 md:pt-36 pb-20 px-4 sm:px-6 lg:px-10">
      <article className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-[24px] bg-[#F6F5F2]/90 dark:bg-[#0B0E17]/88 p-6 sm:p-8 border border-black/5 dark:border-white/10 space-y-5">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#5A5A56] dark:text-[#A1A7B8] hover:text-[#0B1F5C] dark:hover:text-white transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.blogPage.backToBlog}</span>
          </Link>

          <Reveal>
            <div className="space-y-4">
              <p className="text-[13px] text-[#5A5A56] dark:text-[#A1A7B8]">
                {article.category[lang]} · {article.date[lang]} · {article.readTime[lang]}
              </p>
              <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-light leading-[1.1] tracking-[-0.03em] text-[#111111] dark:text-white">
                {article.title[lang]}
              </h1>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.08}>
          <div className="overflow-hidden rounded-[24px] md:rounded-[32px] aspect-[16/9] bg-[#0B1F5C]">
            <SafeImage
              src={article.image}
              alt={article.title[lang]}
              loading="eager"
              width={1200}
              height={675}
              className="w-full h-full object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-[24px] md:rounded-[30px] bg-white dark:bg-[#141926] p-6 sm:p-10 border border-black/5 dark:border-white/10 space-y-5">
            {article.paragraphs[lang].map((p, idx) => (
              <p
                key={idx}
                className="text-[16px] sm:text-[17px] text-[#111111]/90 dark:text-[#F4F5F7]/90 leading-[1.75]"
              >
                {p}
              </p>
            ))}

            <div className="pt-6 mt-6 border-t border-black/8 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium text-[#111111] dark:text-white">
                  {t.blogPage.ctaTitle}
                </h2>
                <p className="text-[14px] text-[#5A5A56] dark:text-[#A1A7B8] mt-1">
                  {t.blogPage.ctaText}
                </p>
              </div>
              <PillButton label={t.intro.cta} to="/contact" />
            </div>
          </div>
        </Reveal>
      </article>
    </main>
  );
}
