import { IRelationWidgetProps, useRelations } from 'ui-modules';
import { CustomerWidget } from 'ui-modules';

export const CustomerWidgets = ({
  contentId,
  contentType,
  customerId,
}: IRelationWidgetProps) => {
  const { ownEntities } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'core:customer',
    },
    skip: customerId ? true : false,
  });

  const customerIds = customerId
    ? [customerId]
    : ownEntities?.map((entity) => entity.contentId);

  return <CustomerWidget customerIds={customerIds} scope=" " />;
};
