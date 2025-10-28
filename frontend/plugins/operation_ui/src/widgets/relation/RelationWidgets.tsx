import { IRelationWidgetProps } from 'ui-modules';
import { Task } from './modules/Task';

export const RelationWidgets = ({
  module,
  contentId,
  contentType,
}: IRelationWidgetProps) => {
  if (module === 'tasks') {
    return <Task contentId={contentId} contentType={contentType} />;
  }

  return <div>Project Widget</div>;
};

export default RelationWidgets;
