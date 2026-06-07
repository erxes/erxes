import { AutomationActionFormProps, splitAutomationNodeType } from 'ui-modules';
import { TTicketActionConfigForm } from '../../states/ticketActionConfigFormDefinitions';
import { CreateTicketActionConfigForm } from './CreateTicketActionConfigForm';

export const TicketActionConfigForm = ({
  currentAction,
  ...props
}: AutomationActionFormProps<TTicketActionConfigForm>) => {
  const actionType = currentAction?.type || '';
  const collectionName = splitAutomationNodeType(actionType)[2];

  if (collectionName === 'tickets') {
    return (
      <CreateTicketActionConfigForm {...props} currentAction={currentAction} />
    );
  }

  return null;
};
