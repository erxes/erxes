/** Whether the composer can take files right now. */
export type TAgentsAttachAvailability = 'ready' | 'full' | 'disabled';

export interface IFileDragState {
  /** dragenter minus dragleave; nested children fire both while crossing. */
  depth: number;
  /** Number of dragged files, when the browser exposes it before drop. */
  count?: number;
  availability: TAgentsAttachAvailability;
}

export type TFileDragAction =
  | { type: 'enter'; count?: number; availability: TAgentsAttachAvailability }
  | { type: 'over'; availability: TAgentsAttachAvailability }
  | { type: 'leave' }
  | { type: 'reset' };

export const FILE_DRAG_IDLE: IFileDragState = {
  depth: 0,
  availability: 'disabled',
};

export const fileDragReducer = (
  state: IFileDragState,
  action: TFileDragAction,
): IFileDragState => {
  switch (action.type) {
    case 'enter':
      return {
        depth: state.depth + 1,
        count: action.count ?? state.count,
        availability: action.availability,
      };
    case 'over':
      // dragover repeats every few ms; keep the same object when unchanged.
      return state.depth === 0 || state.availability === action.availability
        ? state
        : { ...state, availability: action.availability };
    case 'leave':
      return state.depth <= 1 ? FILE_DRAG_IDLE : { ...state, depth: state.depth - 1 };
    case 'reset':
      return state === FILE_DRAG_IDLE ? state : FILE_DRAG_IDLE;
  }
};

export const isFileDragOverlayVisible = (state: IFileDragState): boolean =>
  state.depth > 0 && state.availability !== 'disabled';

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
