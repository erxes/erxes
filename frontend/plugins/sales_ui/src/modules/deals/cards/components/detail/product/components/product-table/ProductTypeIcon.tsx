import { Badge, cn, Tooltip } from 'erxes-ui';
import { IconBox, IconFileInvoice } from '@tabler/icons-react';

import { useTranslation } from 'react-i18next';

export const ProductTypeIcon = ({
  type,
  compact = false,
}: {
  type: string;
  compact?: boolean;
}) => {
  const { t } = useTranslation('sales');
  const badgeClassName = compact ? 'size-4 justify-center p-0' : undefined;
  const iconClassName = compact ? 'size-2.5 text-white' : 'size-4 text-white';
  switch (type) {
    case 'service':
      return (
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Badge className={cn('bg-red-400', badgeClassName)}>
                <IconFileInvoice className={iconClassName} stroke={2} />
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>{t('service')}</Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      );
    case 'product':
      return (
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Badge className={cn('bg-blue-400', badgeClassName)}>
                <IconBox className={iconClassName} stroke={2} />
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>{t('product')}</Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      );
    default:
      return null;
  }
};
