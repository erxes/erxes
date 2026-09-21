import type { ReactNode } from 'react';
import { Breadcrumbs, type Crumb } from '@/modules/ui/components/Breadcrumbs';
import { Container } from '@/modules/ui/components/Container';

export const PortalShell = ({
  breadcrumbs,
  title,
  description,
  meta,
  children,
}: {
  breadcrumbs?: Crumb[];
  title?: string;
  description?: string;
  meta?: ReactNode;
  children: ReactNode;
}) => (
  <Container className="py-10 lg:py-14">
    {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}

    {title ? (
      <header className={breadcrumbs?.length ? 'mt-5' : undefined}>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[36px]">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {meta ? <div className="shrink-0 pb-1.5">{meta}</div> : null}
        </div>
      </header>
    ) : null}

    <div className={title || breadcrumbs?.length ? 'mt-9' : undefined}>
      {children}
    </div>
  </Container>
);
