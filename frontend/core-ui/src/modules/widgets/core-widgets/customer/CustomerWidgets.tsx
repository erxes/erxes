import { IRelationWidgetProps, useRelations } from 'ui-modules';
import { CustomerWidget } from 'ui-modules';
import { Spinner } from 'erxes-ui';

export const CustomerWidgets = ({
  contentId,
  contentType,
  customerId,
}: IRelationWidgetProps) => {
  const { ownEntities, loading } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'core:customer',
    },
    skip: customerId ? true : false,
  });

  if (loading) {
    return <Spinner className="size-4" />;
  }

  const customerIds = customerId
    ? [customerId]
    : ownEntities?.map((entity) => entity.contentId);

  return <CustomerWidget customerIds={customerIds} scope=" " />;
};
