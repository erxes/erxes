import { Button, Spinner } from 'erxes-ui';
import {
  CustomerWidget,
  IRelationWidgetProps,
  SelectCustomersBulk,
  useCreateMultipleRelations,
  useRelations,
} from 'ui-modules';
import { IconPlus, IconUserSearch } from '@tabler/icons-react';

export const CustomerWidgets = ({
  contentId,
  contentType,
  customerId,
}: IRelationWidgetProps) => {
  const { createMultipleRelations } = useCreateMultipleRelations();
  const { ownEntities, loading } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'core:customer',
    },
    skip: customerId ? true : false,
  });

  const handleSelectCustomers = (customerIds: string[]) => {
    const relations = customerIds.map((customerId) => ({
      entities: [
        { contentType, contentId },
        { contentType: 'core:customer', contentId: customerId },
      ],
    }));

    createMultipleRelations(relations);
  };

  if (loading) {
    return <Spinner className="size-4" />;
  }

  const customerIds = customerId
    ? [customerId]
    : ownEntities?.map((entity) => entity.contentId);

  if (ownEntities?.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconUserSearch />
        </div>
        <span className="text-sm">No customers to display at the moment.</span>
        <SelectCustomersBulk onSelect={handleSelectCustomers}>
          <Button variant="outline" size="sm">
            <IconPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </SelectCustomersBulk>
      </div>
    );
  }

  return (
    <CustomerWidget
      customerIds={customerIds}
      scope=" "
      onManageCustomers={handleSelectCustomers}
    />
  );
};
