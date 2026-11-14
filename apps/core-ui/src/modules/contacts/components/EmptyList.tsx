import { IconInbox } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/** Under an empty list's header: nothing here (yet, or for these filters). */
export const EmptyList = () => {
  const { t } = useTranslation('common');

  return (
    <div className="pointer-events-none absolute inset-x-0 top-2/5 flex flex-col items-center gap-2 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <IconInbox className="size-5" />
      </span>
      <p className="text-sm font-medium">{t('empty-list', 'Nothing here')}</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        {t('empty-list-hint', 'Add one, or change the filters and search.')}
      </p>
    </div>
  );
};
