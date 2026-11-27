import { NAVIGATION_EASE } from '@/navigation/constants/navigationMotion';
import {
  IconAlertTriangle,
  IconLoader2,
  IconSearch,
  IconSearchOff,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const StateShell = ({ children }: { children: React.ReactNode }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: NAVIGATION_EASE }}
      className="flex min-h-32 flex-col items-center justify-center gap-2.5 px-4 py-6 text-center"
    >
      {children}
    </motion.div>
  );
};

export const GlobalSearchMinimumLength = () => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <StateShell>
      <span className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-muted/50 text-muted-foreground">
        <IconSearch className="size-4" />
      </span>
      <span className="text-sm text-muted-foreground">
        {t('minimum-length', 'Enter at least 2 characters to search content')}
      </span>
    </StateShell>
  );
};

export const GlobalSearchLoading = () => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <StateShell>
      <span className="flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        <IconLoader2 className="size-4 animate-spin" />
      </span>
      <span className="text-sm text-muted-foreground">
        {t('loading', 'Loading...')}
      </span>
    </StateShell>
  );
};

export const GlobalSearchEmpty = () => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <StateShell>
      <span className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-muted/50 text-muted-foreground">
        <IconSearchOff className="size-4" />
      </span>
      <span className="text-sm text-muted-foreground">
        {t('no-results', 'No results')}
      </span>
    </StateShell>
  );
};

export const GlobalSearchFailure = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <StateShell>
      <span className="flex size-9 items-center justify-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive">
        <IconAlertTriangle className="size-4" />
      </span>
      <span className="text-sm text-muted-foreground">
        {t('search-failed', "Couldn't load search results")}
      </span>
      <Button
        size="sm"
        variant="secondary"
        className="transition-transform active:scale-95"
        onClick={onRetry}
        type="button"
      >
        {t('retry', 'Retry')}
      </Button>
    </StateShell>
  );
};
