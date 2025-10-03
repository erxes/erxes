import { ConversationDetail } from './conversation/ConversationDetail';
import { useRelations } from './hooks/useRelations';

export const Widgets = ({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: string;
}) => {
  const { ownEntities, loading } = useRelations({
    contentId,
    contentType,
  });

  if (loading) {
    return <div>loading...</div>;
  }

  return ownEntities?.map((entity) => {
    return <ConversationDetail conversationId={entity.contentId} />;
  });
};
