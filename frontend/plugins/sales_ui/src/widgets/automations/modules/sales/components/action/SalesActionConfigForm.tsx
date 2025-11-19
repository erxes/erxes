import { AutomationActionFormProps, splitAutomationNodeType } from 'ui-modules';
import { TSalesActionConfigForm } from '../../states/salesActionConfigFormDefinitions';
import { CreateDealActionConfigForm } from './CreateDealActionConfigForm';

export const SalesActionConfigForm = ({
  type,
  ...props
}: AutomationActionFormProps<TSalesActionConfigForm>) => {
  const [, , collectionType] = splitAutomationNodeType(type);
  if (collectionType === 'deal') {
    return <CreateDealActionConfigForm {...props} type={type} />;
  }

  return null;
};
