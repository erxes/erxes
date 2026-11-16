import { IconCaretLeftRight, IconPlus } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  getHostContacts,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
  RelationWidgetList,
} from 'ui-modules';
import { useContactDeals } from '~/widgets/contact/useContactDeals';
import { useDealConnectionAccess } from '~/widgets/contact/useDealConnectionAccess';
import { DealWidget } from './DealWidget';

const getConnectionContact = ({
  customerId,
  companyId,
}: {
  customerId?: string;
  companyId?: string;
}) => {
  if (customerId)
    return { contentType: 'core:customer', contentId: customerId };
  if (companyId) return { contentType: 'core:company', contentId: companyId };
  return null;
};

export const Deal = ({
  contentId,
  contentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: Omit<IRelationWidgetProps, 'module' | 'pluginName'>) => {
  const { t } = useTranslation('sales');
  const contacts = getHostContacts({
    contentType,
    contentId,
    customerId,
    companyId,
    customerIds,
    companyIds,
  });
  const { dealsById, loading } = useContactDeals({
    ...contacts,
    excludeId: contentId,
  });
  const { canAdd, addDeal } = useDealConnectionAccess();

  const handleAdd = () => addDeal(getConnectionContact(contacts), contacts);

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  const dealIds = [...dealsById.keys()];

  if (dealIds.length === 0) {
    return (
      <RelationWidgetEmptyState
        icon={IconCaretLeftRight}
        message={t('no-deals-to-display')}
      >
        {canAdd && (
          <Button variant="secondary" onClick={handleAdd}>
            <IconPlus />
            {t('add-a-deal')}
          </Button>
        )}
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      label={t('deals')}
      actions={
        canAdd && (
          <Button
            variant="secondary"
            onClick={handleAdd}
            aria-label={t('add-a-deal')}
          >
            <IconPlus />
          </Button>
        )
      }
    >
      {dealIds.map((dealId) => (
        <DealWidget key={dealId} dealId={dealId} />
      ))}
    </RelationWidgetList>
  );
};
