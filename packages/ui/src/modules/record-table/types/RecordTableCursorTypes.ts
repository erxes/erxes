export interface IRecordTableCursorPageInfo {
  endCursor?: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
}

export enum EnumCursorDirection {
  FORWARD = 'forward',
  BACKWARD = 'backward',
}
