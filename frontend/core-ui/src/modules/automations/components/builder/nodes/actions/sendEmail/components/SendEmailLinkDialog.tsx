import { SendEmailLinkFields } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailLinkFields';
import { useSendEmailLinkDialog } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailLinkDialog';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { Button, Dialog, IBlockEditor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SendEmailLinkDialog = ({
  editor,
  open,
  onOpenChange,
  variableSourceNodes,
}: {
  editor: IBlockEditor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variableSourceNodes: TAutomationVariableSourceNode[];
}) => {
  const { t } = useTranslation('automations');
  const {
    textValue,
    urlValue,
    setTextValue,
    setUrlValue,
    canInsert,
    close,
    handleOpenChange,
    handleInsert,
  } = useSendEmailLinkDialog({ editor, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>{t('insert-link-title')}</Dialog.Title>
          <Dialog.Description>
            {t('insert-link-description')}
          </Dialog.Description>
        </Dialog.Header>
        <SendEmailLinkFields
          textValue={textValue}
          urlValue={urlValue}
          onTextChange={setTextValue}
          onUrlChange={setUrlValue}
          onSubmit={handleInsert}
          variableSourceNodes={variableSourceNodes}
        />
        <Dialog.Footer>
          <Button variant="outline" onClick={close}>
            {t('cancel')}
          </Button>
          <Button onClick={handleInsert} disabled={!canInsert}>
            {t('insert')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
