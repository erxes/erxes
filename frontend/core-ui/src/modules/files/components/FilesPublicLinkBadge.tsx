import { IconLink } from '@tabler/icons-react';
import { cn, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const FilesPublicLinkBadge = ({
  labelled,
  className,
}: {
  labelled?: boolean;
  className?: string;
}) => {
  const { t } = useTranslation('files');

  return (
    <Tooltip delayDuration={100}>
      <Tooltip.Trigger asChild>
        <span
          className={cn(
            'inline-flex h-5 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary',
            className,
          )}
          aria-label={t('public-link-on')}
        >
          <IconLink className="size-3" />
          {labelled && t('public-link-on')}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>{t('public-link-hint')}</Tooltip.Content>
    </Tooltip>
  );
};
