
export interface RecursiveGroupNode<T = any> {
  items?: T[];
  [groupKey: string]:
  | string
  | T[]
  | RecursiveGroupNode<T>
  | Record<string, RecursiveGroupNode<T>>
  | undefined;
}

export type IJournalReport<T = any> = Record<string, RecursiveGroupNode<T>>;

export type IJournalReportRecord = any;

