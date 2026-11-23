import { NAVIGATION_EASE } from '@/navigation/constants/navigationMotion';
import { motion, useReducedMotion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { MouseEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { currentOrganizationState } from 'ui-modules';
import { Polygons } from '../components/Polygons';
import { Logo } from './Logo';

export const DynamicBanner = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const organization = useAtomValue(currentOrganizationState);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const rect = element.getBoundingClientRect();
    element.style.setProperty(
      '--spotlight-x',
      `${event.clientX - rect.left}px`,
    );
    element.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="ui-banner-spotlight relative z-10 hidden h-dvh overflow-hidden bg-foreground lg:block lg:w-1/2 dark:bg-background"
    >
      <div
        aria-hidden
        className="ui-orb-float pointer-events-none absolute -top-28 -left-24 size-[28rem] rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden
        className="ui-orb-float-delayed pointer-events-none absolute -right-24 -bottom-28 size-[26rem] rounded-full bg-info/20 blur-3xl"
      />
      <Polygons className="pointer-events-none opacity-80" />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-10 text-primary-foreground">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: NAVIGATION_EASE }}
          className="absolute top-8"
        >
          <Logo className="transition-transform duration-200 hover:scale-105" />
        </motion.div>
        <div className="flex max-w-[500px] flex-col justify-center gap-4">
          <motion.span
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: NAVIGATION_EASE }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-3 py-1 text-xs font-medium tracking-wide text-primary-foreground/90 backdrop-blur-sm"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {organization?.orgShortName || organization?.name || 'erxes XOS'}
          </motion.span>
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: NAVIGATION_EASE }}
            className="text-3xl font-semibold leading-tight tracking-tight text-background dark:text-foreground"
          >
            {organization?.orgLoginText || t('banner-title')}
          </motion.h1>
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: NAVIGATION_EASE }}
            className="text-base font-normal leading-relaxed text-muted-foreground"
          >
            {organization?.orgLoginDescription || t('banner-description')}
          </motion.p>
        </div>
      </div>
    </div>
  );
};
