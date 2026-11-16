import { useEmailDocumentPlaceholder } from '@/automations/hooks/useEmailDocumentPlaceholder';
import { useSendEmailLinkInsert } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailLinkInsert';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { insertEmailLink } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailLinkUtils';
import {
  EmailEditorBlock,
  renderEmailBlocks,
} from '@/automations/components/builder/nodes/actions/sendEmail/utils/renderEmailBlocks';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { IBlockEditor } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  insertAutomationVariableInBlockEditor,
  TAutomationVariableDragPayload,
  useAutomationVariableBlockEditorDrop,
} from 'ui-modules';

/**
 * The block email editor's sheet: dropping and inserting variables, the slash
 * commands it adds, and saving the blocks with their html beside them.
 */
export const useSendEmailEmailContentEditorSheet = ({
  editor,
  variableSourceNodes,
  setIsSheetOpen,
  onChange,
}: {
  editor: IBlockEditor;
  variableSourceNodes: TAutomationVariableSourceNode[];
  setIsSheetOpen: (isOpen: boolean) => void;
  onChange: (content: string) => void;
}) => {
  const { setValue } = useFormContext<TAutomationSendEmailConfig>();
  const drop = useAutomationVariableBlockEditorDrop({ editor });
  const { additionalSlashMenuItems, documentPlaceholderPicker } =
    useEmailDocumentPlaceholder({ editor });
  const { linkSlashMenuItems, linkDialog } = useSendEmailLinkInsert({
    editor,
    variableSourceNodes,
  });

  const slashMenuItems = useMemo(
    () => [...additionalSlashMenuItems, ...linkSlashMenuItems],
    [additionalSlashMenuItems, linkSlashMenuItems],
  );

  const handleInsertVariable = useCallback(
    (payload: TAutomationVariableDragPayload) =>
      insertAutomationVariableInBlockEditor({ editor, payload }),
    [editor],
  );

  const handleInsertVariableAsLink = useCallback(
    (payload: TAutomationVariableDragPayload) =>
      insertEmailLink(editor, payload.token, payload.label),
    [editor],
  );

  const onSave = useCallback(() => {
    onChange(JSON.stringify(editor.document));
    setValue(
      'html',
      renderEmailBlocks(editor.document as readonly EmailEditorBlock[]),
    );
    setIsSheetOpen(false);
  }, [editor, onChange, setValue, setIsSheetOpen]);

  return {
    drop,
    slashMenuItems,
    documentPlaceholderPicker,
    linkDialog,
    handleInsertVariable,
    handleInsertVariableAsLink,
    onSave,
  };
};
