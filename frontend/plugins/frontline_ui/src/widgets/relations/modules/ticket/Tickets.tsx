import { IRelationWidgetProps, useRelations } from 'ui-modules';

export const TicketRelationWidget = ({
  contentId,
  contentType,
}: IRelationWidgetProps) => {
  const { ownEntities } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'frontline:ticket',
    },
  });

  return ownEntities?.map((entity) => {
    return <div>ticket: {entity.contentId}</div>;
  });
};
