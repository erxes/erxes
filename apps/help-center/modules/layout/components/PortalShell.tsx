import type { ReactNode } from 'react';
import { Breadcrumbs, type Crumb } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';
import { HeroBand } from './HeroBand';

export const PortalShell = ({
  breadcrumbs,
  title,
  description,
  meta,
  heroExtra,
  children,
}: {
  breadcrumbs?: Crumb[];
  title?: string;
  description?: string;
  meta?: ReactNode;
  heroExtra?: ReactNode;
  children: ReactNode;
}) => {
  const hasBand = !!(breadcrumbs?.length || title || heroExtra);

  return (
    <>
      {hasBand ? (
        <HeroBand className="pb-12 pt-10 lg:pb-14 lg:pt-20">
          {breadcrumbs?.length ? (
            <Breadcrumbs items={breadcrumbs} tone="onHero" />
          ) : null}

          {title ? (
            <header className={breadcrumbs?.length ? 'mt-5' : undefined}>
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <div className="min-w-0">
                  <h1 className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both text-balance text-[30px] font-semibold leading-tight tracking-[-0.03em] duration-500 sm:text-[36px]">
                    {title}
                  </h1>
                  {description ? (
                    <p className="animate-in fade-in fill-mode-both mt-2 max-w-2xl text-[15px] leading-relaxed text-white/70 delay-100 duration-500">
                      {description}
                    </p>
                  ) : null}
                </div>
                {meta ? <div className="shrink-0 pb-1.5">{meta}</div> : null}
              </div>
            </header>
          ) : null}

          {heroExtra ? (
            <div className="animate-in fade-in fill-mode-both mt-7 max-w-xl delay-150 duration-500">
              {heroExtra}
            </div>
          ) : null}
        </HeroBand>
      ) : null}

      <Container className="py-10 lg:py-14">{children}</Container>
    </>
  );
};
