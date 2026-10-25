/** Whether the composer can take files right now. */
export type TAgentsAttachAvailability = 'ready' | 'full' | 'disabled';

/**
 * Only files dragged in from outside the page qualify. Links, images and text
 * dragged inside the app start a `dragstart` here first (`internalDrag`).
 */
export const isExternalFileDrag = (
  dataTransfer: Pick<DataTransfer, 'types'> | null | undefined,
  internalDrag: boolean,
): boolean =>
  !internalDrag &&
  Boolean(dataTransfer) &&
  Array.from(dataTransfer?.types ?? []).includes('Files');

/** Chromium and Firefox list the dragged items before drop; Safari may not. */
export const dragFileCount = (
  dataTransfer: Pick<DataTransfer, 'items'> | null | undefined,
): number | undefined => {
  const items = dataTransfer?.items;
  if (!items) return undefined;
  const count = Array.from(items).filter((item) => item.kind === 'file').length;
  return count > 0 ? count : undefined;
};
