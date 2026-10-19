import { Button, Spinner } from 'erxes-ui';
import {
  CustomerWidget,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
  SelectCustomersBulk,
  useManageRelations,
  useRelations,
} from 'ui-modules';
import { IconPlus, IconUserSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const CustomerWidgets = ({
  contentId,
  contentType,
  customerId,
  access,
}: IRelationWidgetProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'widgets' });
  const { manageRelations } = useManageRelations();
  const { relatedIds, loading } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'core:customer',
    },
    skip: !!customerId,
  });

  const canWrite = access === 'write';

  const handleSelectCustomers = (customerIds: string[]) => {
    manageRelations({
      contentType,
      contentId,
      relatedContentType: 'core:customer',
      relatedContentIds: customerIds,
    });
  };

  if (loading) {
    return <Spinner className="size-4" />;
  }

  const customerIds = customerId ? [customerId] : relatedIds;

  if (!customerIds.length) {
    return (
      <RelationWidgetEmptyState
        icon={IconUserSearch}
        message={t('no-customers')}
      >
        {canWrite && (
          <SelectCustomersBulk onSelect={handleSelectCustomers}>
            <Button variant="outline" size="sm">
              <IconPlus className="mr-2 w-4 h-4" />
              {t('add-customer')}
            </Button>
          </SelectCustomersBulk>
        )}
      </RelationWidgetEmptyState>
    );
  }

  return (
    <CustomerWidget
      customerIds={customerIds}
      scope=" "
      onManageCustomers={handleSelectCustomers}
      access={access}
    />
  );
};
