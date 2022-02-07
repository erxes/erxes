export const isBoardKind = (contentType?: string) =>
  ['deal', 'ticket', 'task'].includes(contentType || '');
