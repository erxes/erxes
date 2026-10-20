import { useBlockNoteEditor } from '@blocknote/react';
import { useState } from 'react';
import { useToast } from 'erxes-ui/hooks';

export const useBlockEditorCommentComposer = (): {
  value: string;
  setValue: (value: string) => void;
  saving: boolean;
  saveComment: () => Promise<void>;
} => {
  const editor = useBlockNoteEditor();
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const saveComment = async (): Promise<void> => {
    const comments = editor.comments;
    if (!comments || !value.trim() || saving) return;
    setSaving(true);
    try {
      await comments.createThread({
        initialComment: {
          body: value.split('\n').map((text) => ({
            id: crypto.randomUUID(),
            type: 'paragraph',
            props: {},
            content: text ? [{ type: 'text', text, styles: {} }] : [],
            children: [],
          })),
        },
      });
      comments.stopPendingComment();
    } catch (error) {
      toast({
        title: 'Could not save comment',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  return { value, setValue, saving, saveComment };
};
