import { BlockEditorReadOnly, Card } from 'erxes-ui';
import { useGetNote } from '@/task/hooks/useGetNote';

interface NoteInputReadOnlyProps {
  newValueId: string | null | undefined;
}

export const NoteInputReadOnly = ({ newValueId }: NoteInputReadOnlyProps) => {
  const { note, loading } = useGetNote(newValueId);

  return (
    <Card className="min-w-0 min-h-14 ml-7 rounded-lg border bg-background text-foreground shadow-none [overflow-wrap:anywhere]">
      <Card.Content className="px-3 py-2">
        {!loading && (
          <BlockEditorReadOnly
            content={note?.content || ''}
            className="read-only"
          />
        )}
      </Card.Content>
    </Card>
  );
};
