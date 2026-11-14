import { SendEmailLinkDialog } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailLinkDialog';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { IconLink } from '@tabler/icons-react';
import { IBlockEditor } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** The editor's "insert link" slash command and the dialog it opens. */
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
