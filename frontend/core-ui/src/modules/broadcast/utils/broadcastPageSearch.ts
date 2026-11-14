/** Keeps list filters while removing navigation owned by a side panel. */
export const broadcastPageSearch = (search: string): string => {
  const params = new URLSearchParams(search);
  [
    'messageId',
    'editMessageId',
    'method',
    'panel',
    'panelHistory',
    'panelTab',
    'panelExpanded',
  ].forEach((key) => params.delete(key));
  const query = params.toString();
  return query ? `?${query}` : '';
};
