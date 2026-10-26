import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type DragEventHandler,
  type Ref,
} from 'react';
import { useDropzone } from 'react-dropzone';

import {
  dragFileCount,
  isExternalFileDrag,
  type TAgentsAttachAvailability,
} from '../utils/fileDrag';

export interface IUseAgentFileDropOptions {
  availability: () => TAgentsAttachAvailability;
  onFiles: (files: File[]) => void;
}

export interface IUseAgentFileDropResult {
  visible: boolean;
  full: boolean;
  /** Number of dragged files, when the browser exposes it before drop. */
  count?: number;
  rootProps: {
    ref: Ref<HTMLDivElement>;
    onDragEnter: DragEventHandler<HTMLDivElement>;
    onDragOver: DragEventHandler<HTMLDivElement>;
    onDragLeave: DragEventHandler<HTMLDivElement>;
    onDrop: DragEventHandler<HTMLDivElement>;
  };
}

/**
 * Panel-wide drop target on `react-dropzone`, which tracks nested drag
 * targets, cancels file drags and reads the dropped files. Admission (types,
 * counts, sizes, toasts) stays in the composer. Kept here, because the
 * library cannot do it:
 * - drags that start inside the page (links, images) are ignored;
 * - only file drags reach the library, so text still drops into inputs;
 * - a disabled or full composer keeps cancelling drags with `dropEffect:
 *   none` (the library's `disabled` would let the browser open the file).
 */
export const useAgentFileDrop = ({
  availability,
  onFiles,
}: IUseAgentFileDropOptions): IUseAgentFileDropResult => {
  const internalDragRef = useRef(false);
  const [current, setCurrent] =
    useState<TAgentsAttachAvailability>('disabled');
  const [count, setCount] = useState<number>();

  useEffect(() => {
    const start = () => {
      internalDragRef.current = true;
    };
    const end = () => {
      internalDragRef.current = false;
    };
    // `drop` is observed while bubbling, after the panel's own handler.
    window.addEventListener('dragstart', start, true);
    window.addEventListener('dragend', end, true);
    window.addEventListener('drop', end);
    return () => {
      window.removeEventListener('dragstart', start, true);
      window.removeEventListener('dragend', end, true);
      window.removeEventListener('drop', end);
    };
  }, []);

  const { getRootProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    // A document-wide drop blocker would also swallow text drops elsewhere.
    preventDropOnDocument: false,
    onDragEnter: (event) => {
      setCount(dragFileCount(event.dataTransfer));
      setCurrent(availability());
    },
    onDragOver: (event) => {
      const next = availability();
      setCurrent(next);
      event.dataTransfer.dropEffect = next === 'ready' ? 'copy' : 'none';
    },
    onDrop: (files) => {
      if (files.length && availability() !== 'disabled') onFiles(files);
    },
  });

  const { onDragEnter, onDragOver, onDragLeave, onDrop, ...root } =
    getRootProps();
  // react-dropzone types its root ref loosely; it is a ref to our div.
  const ref: Ref<HTMLDivElement> = root.ref;
  const filesOnly =
    (handler?: DragEventHandler<HTMLElement>) =>
    (event: DragEvent<HTMLDivElement>) => {
      if (isExternalFileDrag(event.dataTransfer, internalDragRef.current)) {
        handler?.(event);
      }
    };

  return {
    visible: isDragActive && current !== 'disabled',
    full: current === 'full',
    count,
    rootProps: {
      ref,
      onDragEnter: filesOnly(onDragEnter),
      onDragOver: filesOnly(onDragOver),
      onDragLeave: filesOnly(onDragLeave),
      onDrop: filesOnly(onDrop),
    },
  };
};
