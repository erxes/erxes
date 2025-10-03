import { Widgets as InboxWidgets } from '@/inbox/widgets/Widgets';

const RelationWidget = ({
  contentType,
  contentId,
  moduleName,
}: {
  contentType: string;
  contentId: string;
  moduleName: string;
}) => {
  switch (moduleName) {
    case 'inbox':
      return <InboxWidgets contentId={contentId} contentType={contentType} />;
    default:
      return null;
  }
};

export default RelationWidget;
