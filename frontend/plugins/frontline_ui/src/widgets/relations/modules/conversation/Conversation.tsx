import { IRelationWidgetProps, useRelations } from 'ui-modules';
import { ConversationRelationDetails } from './ConversationDetails';

export const ConversationRelationWidget = ({
  contentId,
  contentType,
  customerId,
}: IRelationWidgetProps) => {
  const { ownEntities } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'frontline:conversation',
    },
    skip: contentType === 'core:customer',
  });

  //content type  core customer baih ued use relation query duudah shaardlag bhq uchir n conversation customer id g ugaasa hadgalj bga
  //conversation ii detail awdag function duudn

  return ownEntities?.map((entity) => {
    return (
      <ConversationRelationDetails
        key={entity.contentId}
        conversationId={entity.contentId}
      />
    );
  });
};
