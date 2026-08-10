import { buildTicketNumberPreview } from '@/pipelines/utils/ticketNumberPreview';
import { useTranslation } from 'react-i18next';

type TicketNumberPreviewProps = {
  numberConfig?: string;
  numberSize?: string;
};

export const TicketNumberPreview = ({
  numberConfig,
  numberSize,
}: TicketNumberPreviewProps) => {
  const { t } = useTranslation('frontline');
  const preview = buildTicketNumberPreview(numberConfig, numberSize);

  return (
    <div className="flex items-baseline gap-3 rounded-lg bg-muted/60 px-3 py-2">
      <span className="font-mono text-xs uppercase text-accent-foreground">
        {t('preview')}
      </span>
      <span
        aria-live="polite"
        className="min-w-0 truncate font-mono text-sm tabular-nums"
      >
        {preview ? (
          <>
            <span className="text-muted-foreground">{preview.prefix}</span>
            <span className="font-medium text-foreground">
              {preview.sequence}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">{t('none')}</span>
        )}
      </span>
    </div>
  );
};
