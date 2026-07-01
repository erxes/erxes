import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { SelectDocument } from 'ui-modules';
import { TMessageProConfigForm } from '../states/messageProConfigForm';
import { useTranslation } from 'react-i18next';

export const MessageProNodeContent = ({
  config,
}: NodeContentComponentProps<TMessageProConfigForm>) => {
  const { t } = useTranslation('automations');
  const documentId = config?.documentId;

  if (!documentId) {
    return (
      <p className="text-xs text-muted-foreground italic">
        {t('no-document-configured', 'No document configured')}
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
