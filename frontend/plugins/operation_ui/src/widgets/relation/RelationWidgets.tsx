import { IRelationWidgetProps } from 'ui-modules';
import { Task } from './modules/Task';

export const RelationWidgets = ({
  module,
  contentId,
  contentType,
}: IRelationWidgetProps) => {
  console.log('module', module);
  if (module === 'tasks') {
    return <Task contentId={contentId} contentType={contentType} />;
  }

  return <div>Operation Widget</div>;
};

export default RelationWidgets;
