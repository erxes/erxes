import { useCallback, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Block } from '@blocknote/core';
import { IconCommand, IconCornerDownLeft } from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  Kbd,
  Spinner,
  getMentionedUserIds,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';
import { AssignMemberInEditor, Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

// Scoping mod+enter to the composer keeps it from firing while focus is
// elsewhere in the detail sheet.
const NOTE_COMPOSER_HOTKEY_SCOPE = 'deal-note-composer';

const INTERNAL_NOTE_ADD = gql`
  mutation salesDealInternalNoteAdd(
    $contentType: String!
    $contentTypeId: String
    $content: String
    $mentionedUserIds: [String]
  ) {
    internalNotesAdd(
      contentType: $contentType
      contentTypeId: $contentTypeId
      content: $content
      mentionedUserIds: $mentionedUserIds
    ) {
      _id
      content
      createdAt
    }
  }
`;

export const DealNoteComposer = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('sales');
  const editor = useBlockEditor({ placeholder: t('leave-a-note') });

  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);

  const [addInternalNote, { loading }] = useMutation(INTERNAL_NOTE_ADD);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleChange = useCallback(async () => {
    const blocks = await editor?.document;
    if (!blocks) return;

    const trimmed = blocks.slice(0, -1) as Block[];
    setContent(trimmed);
    setMentionedUserIds(
      getMentionedUserIds(
        trimmed as unknown as Parameters<typeof getMentionedUserIds>[0],
      ),
    );
  }, [editor]);

  const isEmpty = !content?.length;

  const handleSubmit = useCallback(() => {
    if (isEmpty || loading) return;

    addInternalNote({
      variables: {
        contentType: 'sales:deal',
        contentTypeId: dealId,
        content: JSON.stringify(content),
        mentionedUserIds,
      },
      onCompleted: () => {
        if (content?.length) {
          editor?.removeBlocks(content);
        }
        setContent(undefined);
        setMentionedUserIds([]);
        toast({ title: t('note-added'), variant: 'success' });
      },
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  }, [
    isEmpty,
    loading,
    addInternalNote,
    dealId,
    content,
    mentionedUserIds,
    editor,
    t,
  ]);

  useScopedHotkeys('mod+enter', handleSubmit, NOTE_COMPOSER_HOTKEY_SCOPE, [
    handleSubmit,
  ]);

  return (
    <Can action="internalNotesManage">
      <div className="flex flex-col px-4 py-3 border rounded-lg min-h-14">
        <BlockEditor
          editor={editor}
          onChange={handleChange}
          disabled={loading}
          className="sales-note-editor w-full max-h-64 overflow-y-auto"
          onFocus={() =>
            setHotkeyScopeAndMemorizePreviousScope(NOTE_COMPOSER_HOTKEY_SCOPE)
          }
          onBlur={goBackToPreviousHotkeyScope}
        >
          <AssignMemberInEditor editor={editor} />
        </BlockEditor>

        <div className="flex justify-end">
          <Button
            size="lg"
            className="ml-auto"
            disabled={isEmpty || loading}
            onClick={handleSubmit}
          >
            {loading ? <Spinner size="sm" /> : t('send')}
            <Kbd className="ml-1">
              <IconCommand size={12} />
              <IconCornerDownLeft size={12} />
            </Kbd>
          </Button>
        </div>
      </div>
    </Can>
  );
};
