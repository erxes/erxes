import { useMultiQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { getSidePanelRecordPath } from 'ui-modules';

export const KnowledgeBaseDetailLink = ({
  contentType,
}: {
  contentType: string;
}) => {
  const [{ editId }, setQueries] = useMultiQueryState<{
    editId: string;
    panel: string;
  }>(['editId', 'panel']);

  useEffect(() => {
    if (!editId) return;

    setQueries({
      editId: null,
      panel: getSidePanelRecordPath({ contentType, contentId: editId }),
    });
  }, [contentType, editId, setQueries]);

  return null;
};
