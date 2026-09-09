import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from 'erxes-ui/components';

const MIN_WIDTH = 80;
const MIN_HEIGHT = 30;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 300;

type BarcodeSize = Readonly<{ width: number; height: number }>;

type BarcodeAttributeProps = Readonly<{
  editable: boolean;
  height: number;
  onResize: (size: BarcodeSize) => void;
  width: number;
}>;

/** Renders and resizes the product barcode placeholder. */
export const BarcodeAttribute = ({
  editable,
  height,
  onResize,
  width,
}: BarcodeAttributeProps) => {
  const [size, setSize] = useState<BarcodeSize>({ width, height });
  const dragStart = useRef<
    (BarcodeSize & { clientX: number; clientY: number }) | null
  >(null);

  useEffect(() => {
    if (!dragStart.current) {
      setSize({ width, height });
    }
  }, [height, width]);

  /** Calculates bounded dimensions from the active top-right resize drag. */
  const getResizedDimensions = (event: ReactPointerEvent) => {
    const start = dragStart.current;

    if (!start) {
      return size;
    }

    return {
      width: Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, start.width + event.clientX - start.clientX),
      ),
      height: Math.min(
        MAX_HEIGHT,
        Math.max(MIN_HEIGHT, start.height + start.clientY - event.clientY),
      ),
    };
  };

  /** Starts resizing and captures subsequent pointer movement. */
  const handleResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      ...size,
      clientX: event.clientX,
      clientY: event.clientY,
    };
  };

  /** Updates the barcode preview while the resize handle is moving. */
  const handleResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragStart.current) {
      setSize(getResizedDimensions(event));
    }
  };

  /** Persists the final dimensions in the inline attribute props. */
  const handleResizeEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) {
      return;
    }

    const resizedDimensions = getResizedDimensions(event);
    dragStart.current = null;
    setSize(resizedDimensions);
    onResize(resizedDimensions);
  };

  return (
    <span
      className="relative inline-block align-middle"
      contentEditable={false}
      title="Barcode preview — prints the selected product’s barcode"
      style={size}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 202 69"
        preserveAspectRatio="none"
        role="img"
        aria-label="Product barcode preview"
        className="block bg-white"
      >
        <path
          stroke="#000"
          strokeWidth="4"
          d="M2 69L2 0M28 69L28 0M58 69L58 0M84 69L84 0M90 69L90 0M112 69L112 0M128 69L128 0M138 69L138 0M168 69L168 0M178 69L178 0M200 69L200 0"
        />
        <path
          stroke="#000"
          strokeWidth="2"
          d="M7 69L7 0M23 69L23 0M45 69L45 0M53 69L53 0M79 69L79 0M101 69L101 0M105 69L105 0M133 69L133 0M163 69L163 0M195 69L195 0"
        />
        <path
          stroke="#000"
          strokeWidth="6"
          d="M15 69L15 0M37 69L37 0M69 69L69 0M147 69L147 0M157 69L157 0M189 69L189 0"
        />
        <path stroke="#000" strokeWidth="8" d="M120 69L120 0" />
      </svg>
      {editable && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Resize barcode"
          className="absolute -right-1 -top-1 size-3 cursor-nesw-resize rounded-full border border-primary bg-background p-0"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResize}
          onPointerUp={handleResizeEnd}
          onPointerCancel={() => {
            dragStart.current = null;
            setSize({ width, height });
          }}
        />
      )}
    </span>
  );
};
