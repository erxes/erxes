import { AutomationActionFormProps, splitAutomationNodeType } from 'ui-modules';
import { TOperationActionConfigForm } from '../../states/operationActionConfigFormDefinitions';
import { CreateProjectActionConfigForm } from './CreateProjectActionConfigForm';
import { CreateTaskActionConfigForm } from './CreateTaskActionConfigForm';

export const OperationActionConfigForm = ({
  type,
  ...props
}: AutomationActionFormProps<TOperationActionConfigForm>) => {
  const [, , collectionType] = splitAutomationNodeType(type);

  if (collectionType === 'tasks') {
    return <CreateTaskActionConfigForm {...props} type={type} />;
  }

  if (collectionType === 'projects') {
    return <CreateProjectActionConfigForm {...props} type={type} />;
  }

  return null;
};
