import { AutomationActionFormProps, splitAutomationNodeType } from 'ui-modules';
import { TPosOrderActionConfigForm } from '../../states/posOrderActionConfigFormDefinitions';
import { CreatePosOrderActionConfigForm } from './CreatePosOrderActionConfigForm';

export const PosActionConfigForm = ({
  type,
  ...props
}: AutomationActionFormProps<TPosOrderActionConfigForm>) => {
  const [, , collectionType] = splitAutomationNodeType(type);

  if (collectionType === 'orders') {
    return <CreatePosOrderActionConfigForm {...props} type={type} />;
  }

  return <PosActionConfigEmptyState />;
};

const PosActionConfigEmptyState = () => {
  return null;
};
