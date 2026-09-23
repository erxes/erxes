import { useMultiQueryState } from 'erxes-ui';

/**
 * Both the sub-header count and the record table read the same filters, so
 * the variables are built once — Apollo shares a cache entry only when the
 * two callers pass identical variables.
 */
export const useImportExportHistoryVariables = () => {
  const [{ type, status }] = useMultiQueryState<{
    type: string;
    status: string;
  }>(['type', 'status']);

  return {
    entityTypes: !type || type === 'all' ? undefined : [type],
    status: status || undefined,
  };
};
