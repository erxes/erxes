import { ContactRelationWidget } from '@/widgets/core-widgets/ContactRelationWidget';
import {
  CustomerWidget,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
} from 'ui-modules';
import { IconUserSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/** Shows reciprocal customer links for contacts and explicit host fields for other records. */
export const CustomerWidgets = (props: IRelationWidgetProps) => {
  const { customerId, access } = props;
  const { t } = useTranslation('common', { keyPrefix: 'widgets' });

  if (props.contentType === 'core:company') {
    return (
      <ContactRelationWidget {...props} relatedContentType="core:customer" />
    );
  }

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
