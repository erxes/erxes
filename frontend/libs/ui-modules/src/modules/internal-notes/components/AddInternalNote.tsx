import { IconCommand, IconCornerDownLeft } from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  getMentionedUserIds,
  Kbd,
  Spinner,
  toast,
  useBlockEditor,
} from 'erxes-ui';
import { useState, useCallback } from 'react';
import { useMutation, gql } from '@apollo/client';
import { AssignMemberInEditor } from '../../team-members';

const INTERNAL_NOTE_ADD = gql`
  mutation internalNotesAdd(
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

export function AddInternalNote({
  contentTypeId,
  contentType,
}: {
  contentTypeId: string;
  contentType: string;
}) {
  const editor = useBlockEditor({ placeholder: 'Leave a note...' });
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [content, setContent] = useState<string>('');
  const [addInternalNote, { loading }] = useMutation(INTERNAL_NOTE_ADD);

  const handleChange = async () => {
    const editorContent = await editor?.document;
    if (!editorContent) return;
    const trimmed = [...editorContent];
    trimmed.pop();
    setContent(JSON.stringify(trimmed));
    const ids = getMentionedUserIds(trimmed);
    setMentionedUserIds(ids);
  };

  const handleSubmit = useCallback(() => {
    if (!content || content === '[]') return;

    addInternalNote({
      variables: {
        mentionedUserIds,
        content,
        contentType,
        contentTypeId,
      },
      onCompleted: () => {
        editor?.removeBlocks(editor?.document);
        setContent('');
        setMentionedUserIds([]);
        toast({
          title: 'Note added successfully',
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['activityLogs'],
    });
  }, [
    content,
    mentionedUserIds,
    contentType,
    contentTypeId,
    addInternalNote,
    editor,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div
      className="flex flex-col border rounded-lg min-h-14 px-4 py-3 ml-10 mr-8"
      onKeyDown={handleKeyDown}
    >
      <BlockEditor
        editor={editor}
        onChange={handleChange}
        className="read-only"
      >
        <AssignMemberInEditor editor={editor} />
      </BlockEditor>
      <div className="flex justify-end">
        <Button
          size="lg"
          className="ml-auto"
          onClick={handleSubmit}
          disabled={loading || !content || content === '[]'}
        >
          {loading ? <Spinner size="sm" /> : 'Send'}
          <Kbd className="ml-1">
            <IconCommand size={12} />
            <IconCornerDownLeft size={12} />
          </Kbd>
        </Button>
      </div>
    </div>
  );
}
