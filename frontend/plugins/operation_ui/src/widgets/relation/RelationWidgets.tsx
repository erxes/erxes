import { Task } from './modules/Task';

export const RelationWidgets = ({
  module,
  contentId,
  contentType,
}: {
  module: any;
  contentId: string;
  contentType: string;
}) => {
  if (contentType === 'core:customer') {
    const conversation = { customerId: contentId };
    return <div>conversation</div>;
  }
  if (module === 'tasks') {
    return <Task contentId={contentId} contentType={contentType} />;
  }

  return <div>Operation Widget</div>;
};

export default RelationWidgets;
