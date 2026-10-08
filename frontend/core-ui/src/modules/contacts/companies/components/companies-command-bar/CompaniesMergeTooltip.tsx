import { useTranslation } from 'react-i18next';
import { Tooltip } from 'erxes-ui';
import { ReactNode } from 'react';

export const CompaniesMergeTooltip = ({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled: boolean;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  if (disabled) return children;
  return (
    <Tooltip delayDuration={0}>
      <Tooltip.Trigger asChild>
        <div className="inline-block">{children}</div>
      </Tooltip.Trigger>
      <Tooltip.Content sideOffset={12}>
        <span>{t('merge-tooltip')}</span>
      </Tooltip.Content>
    </Tooltip>
  );
};
