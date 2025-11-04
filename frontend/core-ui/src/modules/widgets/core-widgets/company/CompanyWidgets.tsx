import { IRelationWidgetProps, useRelations } from 'ui-modules';

export const CompanyWidgets = ({
  contentId,
  contentType,
}: IRelationWidgetProps) => {
  const { ownEntities } = useRelations({
    contentId,
    contentType,
  });

  return <div>{ownEntities?.map((entity) => entity.contentId)}</div>;
};
