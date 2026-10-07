import type { ReactNode } from 'react';
import { Container } from '@/modules/ui/components/Container';
import { cn } from '@/modules/ui/lib/cn';
import { getPortalSettings } from '../api';

export const HeroBand = async ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  const { theme } = await getPortalSettings();
  const image = theme?.heroImage;

  return (
    <section
      className={cn('relative overflow-hidden bg-shell text-white', className)}
    >
      {image ? (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-40"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-shell/75"
          />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="animate-aurora pointer-events-none absolute -left-40 -top-56 size-144 rounded-full bg-brand/25 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="animate-aurora-slow pointer-events-none absolute -right-32 top-10 size-112 rounded-full bg-brand/10 blur-[120px]"
          />
        </>
      )}

      <div
        aria-hidden="true"
        className="hero-grid pointer-events-none absolute inset-0"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent"
      />

      <Container className="relative">{children}</Container>
    </section>
  );
};
