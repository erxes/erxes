import { AutomationActionFormProps, splitAutomationNodeType } from 'ui-modules';
import { TChecklistActionConfigForm } from '../../states/checklistActionConfigFormDefinitions';
import { TSalesActionConfigForm } from '../../states/salesActionConfigFormDefinitions';
import { CreateChecklistActionConfigForm } from './CreateChecklistActionConfigForm';
import { CreateDealActionConfigForm } from './CreateDealActionConfigForm';

type TSalesAutomationActionConfigForm =
  | TSalesActionConfigForm
  | TChecklistActionConfigForm;

export const SalesActionConfigForm = ({
  type,
  ...props
}: AutomationActionFormProps<TSalesAutomationActionConfigForm>) => {
  const [, , collectionType] = splitAutomationNodeType(type);

  if (collectionType === 'deals') {
    return (
      <CreateDealActionConfigForm
        {...props}
        currentAction={props.currentAction}
        onSaveActionConfig={props.onSaveActionConfig}
        type={type}
      />
    );
  }

  if (collectionType === 'checklist') {
    return (
      <CreateChecklistActionConfigForm
        {...props}
        currentAction={props.currentAction}
        onSaveActionConfig={props.onSaveActionConfig}
        type={type}
      />
    );
  }

  return <SalesActionConfigEmptyState />;
};

const SalesActionConfigEmptyState = () => {
  return null;
};
