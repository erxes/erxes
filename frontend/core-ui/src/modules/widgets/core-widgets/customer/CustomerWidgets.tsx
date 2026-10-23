import {
  CustomerWidget,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
} from 'ui-modules';
import { IconUserSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/**
 * The host record's customer: the one it keeps itself (`customerId`). Records
 * set it in their own form; no relation is read or written here.
 */
export const CustomerWidgets = ({ customerId, access }: IRelationWidgetProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'widgets' });

  if (!customerId) {
    return (
      <RelationWidgetEmptyState
        icon={IconUserSearch}
        message={t('no-customers')}
      />
    );
  }

  return (
    <CustomerWidget customerIds={[customerId]} scope=" " access={access} />
  );
};
