import { Badge, Tooltip } from 'erxes-ui';
import { IconBox, IconFileInvoice } from '@tabler/icons-react';

import { useTranslation } from 'react-i18next';

export const ProductTypeIcon = ({ type }: { type: string }) => {
  const { t } = useTranslation('sales');
  switch (type) {
    case 'service':
      return (
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Badge className="bg-red-400">
                <IconFileInvoice className="size-4 text-white" stroke={2} />
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
              <Badge className="bg-blue-400">
                <IconBox className="size-4 text-white" stroke={2} />
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
