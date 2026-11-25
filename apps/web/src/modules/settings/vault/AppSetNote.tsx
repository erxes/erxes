import { IconCircleCheckFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/** The organisation's own app is saved: which one, so the next step reads as the next step. */
export const AppSetNote = ({ name, detail }: { name: string; detail: string | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-success/20 bg-success/5 p-3 text-sm">
      <IconCircleCheckFilled className="size-4 shrink-0 text-(--success-text)" />
      <span className="min-w-0 flex-1 truncate">
        {t('app-set', '{{name}} is set up', { name })}
        {detail && <span className="text-muted-foreground"> · {detail}</span>}
      </span>
    </div>
  );
};
