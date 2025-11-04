import { IRelationWidgetProps, useRelations } from 'ui-modules';

export const CompanyWidgets = ({
  contentId,
  contentType,
}: IRelationWidgetProps) => {
  const { ownEntities } = useRelations({
    variables: {
      contentId,
      contentType,
    },
  });

  return <div>{ownEntities?.map((entity) => entity.contentId)}</div>;
};
