import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, useMultiQueryState } from 'erxes-ui';

export const LogDocIdFilter = () => {
  const { t } = useTranslation('common');
  const [queries, setQueries] = useMultiQueryState<{
    docId: string;
    docIdOperator: string;
  }>(['docId', 'docIdOperator']);
  const { docId } = queries;
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
        placeholder={t('logs.paste-document-id', 'Paste document ID')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setQueries({
              docId: value.trim() || null,
              docIdOperator: null,
            });
          }
        }}
      />
    </div>
  );
};
