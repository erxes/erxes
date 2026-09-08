export type SegmentOwnedSource = {
  find: (
    query: Record<string, unknown>,
    projection: Record<string, 1>,
  ) => Promise<Record<string, unknown>[]>;

  aggregate?: (
    pipeline: Record<string, unknown>[],
  ) => Promise<Record<string, unknown>[]>;

  baseQuery?: Record<string, unknown>;
};

export type SegmentSourceResolver = (
  contentType: string,
) => SegmentOwnedSource | null;
