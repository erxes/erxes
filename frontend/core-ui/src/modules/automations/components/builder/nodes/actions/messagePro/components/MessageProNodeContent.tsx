import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { SelectDocument } from 'ui-modules';
import { TMessageProConfigForm } from '../states/messageProConfigForm';

export const MessageProNodeContent = ({
  config,
}: NodeContentComponentProps<TMessageProConfigForm>) => {
  const documentId = config?.documentId;

  if (!documentId) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No document configured
      </p>
    );
  }

  return (
    <SelectDocument.Provider
      mode="single"
      value={documentId}
      onValueChange={() => {}}
    >
      <SelectDocument.Value />
    </SelectDocument.Provider>
  );
};
