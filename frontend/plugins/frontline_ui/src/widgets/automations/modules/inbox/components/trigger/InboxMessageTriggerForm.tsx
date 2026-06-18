import { useImperativeHandle } from 'react';
import { AutomationTriggerFormProps } from 'ui-modules';

export const InboxMessageTriggerForm = ({
  formRef,
  onSaveTriggerConfig,
}: AutomationTriggerFormProps) => {
  useImperativeHandle(formRef, () => ({
    submit: () => onSaveTriggerConfig({ configured: true }),
  }));

  return (
    <div className="p-4 text-sm text-muted-foreground">
      This trigger fires whenever a customer sends a message in the messenger
      widget. Make sure the integration has bot mode enabled.
    </div>
  );
};
