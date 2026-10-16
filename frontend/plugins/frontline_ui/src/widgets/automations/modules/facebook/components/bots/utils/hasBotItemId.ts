export const hasBotItemId = <T extends { _id: string | null }>(
  item: T | null,
): item is T & { _id: string } => !!item?._id;
