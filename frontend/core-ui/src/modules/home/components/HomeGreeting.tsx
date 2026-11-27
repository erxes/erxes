import { NAVIGATION_EASE } from '@/navigation/constants/navigationMotion';
import { IconMoonStars, IconSun, IconSunset2 } from '@tabler/icons-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';

const getGreetingMeta = (hour: number) => {
  if (hour < 12) {
    return { key: 'good-morning' as const, Icon: IconSun };
  }

  if (hour < 18) {
    return { key: 'good-afternoon' as const, Icon: IconSunset2 };
  }

  return { key: 'good-evening' as const, Icon: IconMoonStars };
};

export const HomeGreeting = () => {
  const currentUser = useAtomValue(currentUserState);
  const { t, i18n } = useTranslation('common', { keyPrefix: 'home' });
  const prefersReducedMotion = useReducedMotion();
  const now = new Date();
  const { key: greetingKey, Icon: TimeIcon } = getGreetingMeta(now.getHours());
  const name =
    currentUser?.details?.firstName ||
    currentUser?.details?.fullName ||
    currentUser?.email ||
    '';

  return (
    <div className="space-y-2">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: NAVIGATION_EASE }}
        className="group/date inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-xs"
      >
        <TimeIcon className="size-3.5 text-primary transition-transform duration-300 group-hover/date:rotate-12 group-hover/date:scale-110" />
        <span>
          {now.toLocaleDateString(i18n.language, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </motion.div>
      <motion.h1
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.05, ease: NAVIGATION_EASE }}
        className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]"
      >
        {t(greetingKey, { name })}
      </motion.h1>
      <motion.p
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.1, ease: NAVIGATION_EASE }}
        className="text-sm text-muted-foreground"
      >
        {t('subtitle')}
      </motion.p>
    </div>
  );
};
