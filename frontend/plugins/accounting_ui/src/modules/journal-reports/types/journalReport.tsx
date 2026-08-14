export type IJournalReportRecord = Record<string, unknown>;

export interface RecursiveGroupNode<T = IJournalReportRecord> {
  items?: T[];
  [groupKey: string]:
    | string
    | T[]
    | RecursiveGroupNode<T>
    | Record<string, RecursiveGroupNode<T>>
    | undefined;
}

export type IJournalReport<T = IJournalReportRecord> = Record<
  string,
  RecursiveGroupNode<T>
>;
