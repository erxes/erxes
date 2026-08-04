import { Button, Spinner } from 'erxes-ui';
import {
  CustomerWidget,
  IRelationWidgetProps,
  SelectCustomersBulk,
  useManageRelations,
  useRelations,
} from 'ui-modules';
import { IconPlus, IconUserSearch } from '@tabler/icons-react';

export const CustomerWidgets = ({
  contentId,
  contentType,
  customerId,
  access,
}: IRelationWidgetProps) => {
  const { manageRelations } = useManageRelations();
  const { ownEntities, loading } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'core:customer',
    },
    skip: customerId ? true : false,
  });

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

  const customerIds = customerId
    ? [customerId]
    : ownEntities?.map((entity) => entity.contentId);

  if (ownEntities?.length === 0 && !customerId) {
    return (
      <div className="flex flex-col flex-auto justify-center items-center gap-4 text-muted-foreground">
        <div className="bg-background p-6 border border-dashed rounded-xl">
          <IconUserSearch />
        </div>
        <span className="text-sm">No customers to display at the moment.</span>
        <SelectCustomersBulk onSelect={handleSelectCustomers}>
          {access === 'write' && (
            <Button variant="outline" size="sm">
              <IconPlus className="mr-2 w-4 h-4" />
              Add Customer
            </Button>
          )}
        </SelectCustomersBulk>
      </div>
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
