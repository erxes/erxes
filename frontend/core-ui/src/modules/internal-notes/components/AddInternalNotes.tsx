import { getMentionedUserIds, BlockEditor, useBlockEditor } from 'erxes-ui';
import { AssignMemberInEditor } from 'ui-modules';
import { Button, Spinner, toast } from 'erxes-ui';
import { IconArrowUp } from '@tabler/icons-react';
import { useAddInternalNote } from '@/internal-notes/hooks/useAddInternalNote';
import { useState } from 'react';

export function AddInternalNotes({
  contentTypeId,
  contentType,
}: {
  contentTypeId: string;
  contentType: string;
}) {
  const editor = useBlockEditor();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [content, setContent] = useState<string>('');
  const { addInternalNote, loading } = useAddInternalNote();

  const handleChange = async () => {
    const content = await editor?.document;
    content.pop();
    setContent(JSON.stringify(content));
    const mentionedUserIds = getMentionedUserIds(content);
    setMentionedUserIds(mentionedUserIds);
  };

  const handleSubmit = () => {
    addInternalNote({
      variables: {
        mentionedUserIds,
        content: content,
        contentType,
        contentTypeId,
      },
      onCompleted: () => {
        editor?.removeBlocks(editor?.document);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
        });
      },
      refetchQueries: ['activityLogs'],
    });
  };

  return (
    <div className="py-4 h-full overflow-hidden flex flex-col gap-4">
      <BlockEditor
        editor={editor}
        onChange={handleChange}
        className="h-full overflow-auto"
      >
        <AssignMemberInEditor editor={editor} />
      </BlockEditor>

      <Button variant="secondary" onClick={handleSubmit} className="mx-4">
        {loading ? (
          <Spinner size="small" />
        ) : (
          <IconArrowUp className="w-4 h-4" />
        )}
        Post
      </Button>
    </div>
  );
}
