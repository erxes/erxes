import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type DragEvent,
} from 'react';

import {
  FILE_DRAG_IDLE,
  dragFileCount,
  fileDragReducer,
  isExternalFileDrag,
  type IFileDragState,
  type TAgentsAttachAvailability,
} from '../utils/fileDrag';

export interface IUseAgentFileDropOptions {
  availability: () => TAgentsAttachAvailability;
  onFiles: (files: File[]) => void;
}

export interface IUseAgentFileDropResult {
  state: IFileDragState;
  handlers: {
    onDragEnter: (event: DragEvent<HTMLElement>) => void;
    onDragOver: (event: DragEvent<HTMLElement>) => void;
    onDragLeave: (event: DragEvent<HTMLElement>) => void;
    onDrop: (event: DragEvent<HTMLElement>) => void;
  };
}

/**
 * Drop-target state for external file drags. A depth counter keeps nested
 * children from flickering the overlay; window-level drop/dragend reset it
 * when a drag is cancelled or released elsewhere.
 */
export const useAgentFileDrop = ({
  availability,
  onFiles,
}: IUseAgentFileDropOptions): IUseAgentFileDropResult => {
  const [state, dispatch] = useReducer(fileDragReducer, FILE_DRAG_IDLE);
  const internalDragRef = useRef(false);
  const optionsRef = useRef({ availability, onFiles });
  optionsRef.current = { availability, onFiles };

  useEffect(() => {
    const markInternal = () => {
      internalDragRef.current = true;
    };
    const reset = () => {
      internalDragRef.current = false;
      dispatch({ type: 'reset' });
    };
    // `drop` is observed while bubbling, after the panel's own handler, so
    // an internal drag is still recognised when it lands on the panel.
    window.addEventListener('dragstart', markInternal, true);
    window.addEventListener('dragend', reset, true);
    window.addEventListener('drop', reset);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('dragstart', markInternal, true);
      window.removeEventListener('dragend', reset, true);
      window.removeEventListener('drop', reset);
      window.removeEventListener('blur', reset);
    };
  }, []);

  const onDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isExternalFileDrag(event.dataTransfer, internalDragRef.current))
      return;
    event.preventDefault();
    dispatch({
      type: 'enter',
      count: dragFileCount(event.dataTransfer),
      availability: optionsRef.current.availability(),
    });
  }, []);

  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isExternalFileDrag(event.dataTransfer, internalDragRef.current))
      return;
    // Always cancel so a dropped file never navigates the tab away.
    event.preventDefault();
    const current = optionsRef.current.availability();
    event.dataTransfer.dropEffect = current === 'ready' ? 'copy' : 'none';
    dispatch({ type: 'over', availability: current });
  }, []);

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isExternalFileDrag(event.dataTransfer, internalDragRef.current))
      return;
    dispatch({ type: 'leave' });
  }, []);

  const onDrop = useCallback((event: DragEvent<HTMLElement>) => {
    if (!isExternalFileDrag(event.dataTransfer, internalDragRef.current))
      return;
    event.preventDefault();
    dispatch({ type: 'reset' });
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length && optionsRef.current.availability() !== 'disabled') {
      optionsRef.current.onFiles(files);
    }
  }, []);

  return { state, handlers: { onDragEnter, onDragOver, onDragLeave, onDrop } };
};
