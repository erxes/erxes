import { IconArrowsDiagonal, IconTrash } from '@tabler/icons-react';
import { useRef } from 'react';
import { Button } from '../../../components/button';
import type { BarcodeSize } from '../hooks/useBarcodeResize';
import { useBarcodeResize } from '../hooks/useBarcodeResize';
import { useBlockEditorEditable } from '../hooks/useBlockEditorEditable';
import { BarcodeSizeSettings } from './BarcodeSizeSettings';

type BarcodeAttributeProps = Readonly<{
  editable: boolean;
  height: number;
  onResize: (size: BarcodeSize) => void;
  onRemove: (element: HTMLElement) => void;
  width: number;
}>;

const BarcodePreview = ({ size }: { size: BarcodeSize }) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 202 69"
    preserveAspectRatio="none"
    className="block bg-white"
    style={size}
  >
    <title>Product barcode preview</title>
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
);

export const BarcodeAttribute = ({
  editable,
  height,
  onResize,
  onRemove,
  width,
}: BarcodeAttributeProps) => {
  const canEdit = useBlockEditorEditable(editable);
  const barcodeRef = useRef<HTMLSpanElement>(null);
  const { size, resizeHandlers } = useBarcodeResize({ width, height, onResize });

  return (
    <span
      ref={barcodeRef}
      className="inline-flex flex-col items-start align-middle"
      contentEditable={false}
      title="Barcode preview — prints the selected product’s barcode"
    >
      <BarcodePreview size={size} />
      {canEdit && (
        <span className="erxes-block-controls order-first mb-1 flex gap-1 rounded bg-background p-1 text-foreground shadow-sm print:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Resize barcode"
            title="Drag up to increase height; drag right to increase width"
            className="touch-none cursor-nesw-resize"
            {...resizeHandlers}
          >
            <IconArrowsDiagonal />
          </Button>
          <BarcodeSizeSettings size={size} onResize={onResize} />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Delete barcode"
            title="Delete barcode"
            tone="destructive"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              if (barcodeRef.current) onRemove(barcodeRef.current);
            }}
          >
            <IconTrash />
          </Button>
        </span>
      )}
    </span>
  );
};
