import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const StateShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-24 flex-col items-center justify-center gap-2 px-4 text-center">
    {children}
  </div>
);

export const GlobalSearchMinimumLength = () => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <StateShell>
      <span className="text-sm text-muted-foreground">
        {t('minimum-length', 'Enter at least 2 characters to search content')}
      </span>
    </StateShell>
  );
};

export const GlobalSearchLoading = () => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <div className="flex h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
      <IconLoader2 className="size-4 animate-spin" />
      {t('loading', 'Loading...')}
    </div>
  );
};

export const GlobalSearchEmpty = () => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
      {t('no-results', 'No results')}
    </div>
  );
};

export const GlobalSearchFailure = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <StateShell>
      <IconAlertTriangle className="size-5 text-destructive" />
      <span className="text-sm text-muted-foreground">
        {t('search-failed', "Couldn't load search results")}
      </span>
      <Button size="sm" variant="secondary" onClick={onRetry} type="button">
        {t('retry', 'Retry')}
      </Button>
    </StateShell>
  );
};