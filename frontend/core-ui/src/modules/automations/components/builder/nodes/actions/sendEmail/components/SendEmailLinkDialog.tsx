import { SendEmailLinkFields } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailLinkFields';
import {
  insertEmailLink,
  normalizeLinkUrl,
} from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailLinkUtils';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { IconLink } from '@tabler/icons-react';
import { Button, Dialog, IBlockEditor } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SendEmailLinkDialog = ({
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
  const [textValue, setTextValue] = useState('');
  const [urlValue, setUrlValue] = useState('');

  const close = () => {
    onOpenChange(false);
    setTextValue('');
    setUrlValue('');
  };

  const handleInsert = () => {
    const url = normalizeLinkUrl(urlValue);

    if (!url) {
      return;
    }

    insertEmailLink(editor, url, textValue.trim());
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? null : close())}>
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
          <Button onClick={handleInsert} disabled={!urlValue.trim()}>
            {t('insert')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};

export const useSendEmailLinkInsert = ({
  editor,
  variableSourceNodes,
}: {
  editor: IBlockEditor;
  variableSourceNodes: TAutomationVariableSourceNode[];
}) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);

  const linkSlashMenuItems = useMemo<DefaultReactSuggestionItem[]>(
    () => [
      {
        title: t('insert-link'),
        subtext: t('insert-link-description'),
        aliases: ['link', 'url', 'href', 'anchor'],
        group: t('email-content'),
        icon: <IconLink size={18} />,
        onItemClick: () => {
          editor.suggestionMenus.clearQuery();
          editor.suggestionMenus.closeMenu();
          setOpen(true);
        },
      },
    ],
    [editor, t],
  );

  return {
    linkSlashMenuItems,
    linkDialog: (
      <SendEmailLinkDialog
        editor={editor}
        open={open}
        onOpenChange={setOpen}
        variableSourceNodes={variableSourceNodes}
      />
    ),
  };
};
