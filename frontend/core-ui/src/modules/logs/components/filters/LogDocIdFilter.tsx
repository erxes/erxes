import { useEffect, useState } from 'react';
import { Input, useFilterContext, useMultiQueryState } from 'erxes-ui';

export const LogDocIdFilter = () => {
  const [queries, setQueries] = useMultiQueryState<{
    docId: string;
    docIdOperator: string;
  }>(['docId', 'docIdOperator']);
  const { docId } = queries;
  const { resetFilterState } = useFilterContext();
  const [value, setValue] = useState(docId || '');

  useEffect(() => {
    setValue(docId || '');
  }, [docId]);

  return (
    <div className="p-2">
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste document ID"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setQueries({
              docId: value.trim() || null,
              docIdOperator: null,
            });
            resetFilterState();
          }
        }}
      />
    </div>
  );
};
