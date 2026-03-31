import { Input, useMultiQueryState } from 'erxes-ui';

export const LogDocIdFilter = () => {
  const [queries, setQueries] = useMultiQueryState<{
    docId: string;
    docIdOperator: string;
  }>(['docId', 'docIdOperator']);
  const { docId } = queries;

  return (
    <div className="p-2">
      <Input
        autoFocus
        defaultValue={docId || ''}
        placeholder="Paste document ID"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setQueries({
              docId: e.currentTarget.value.trim() || null,
              docIdOperator: null,
            });
          }
        }}
      />
    </div>
  );
};
