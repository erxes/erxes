import { BlockEditorReadOnly } from 'erxes-ui';
import { useGetNote } from '@/task/hooks/useGetNote';

interface NoteInputReadOnlyProps {
  newValueId: string | null | undefined;
}

export const NoteInputReadOnly = ({ newValueId }: NoteInputReadOnlyProps) => {
  const { note, loading } = useGetNote(newValueId);

  return (
    <div className="flex flex-col border rounded-lg min-w-0 min-h-14 px-3 py-2 ml-7 [overflow-wrap:anywhere]">
      {!loading && (
        <BlockEditorReadOnly
          content={note?.content || ''}
          className="read-only"
        />
      )}
    </div>
  );
};
