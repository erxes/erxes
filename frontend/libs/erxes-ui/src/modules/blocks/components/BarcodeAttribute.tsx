import {
  BarcodeSize,
  BARCODE_SIZE_PRESETS,
  BARCODE_DIMENSION_LIMITS,
  useBarcodeAttribute,
} from '../hooks/useBarcodeAttribute';
import { useRef } from 'react';
import { Button } from '../../../components/button';
import { Form } from '../../../components/form';
import { Input } from '../../../components/input';
import { Popover } from '../../../components/popover';
import { Select } from '../../../components/select';
import { useBlockEditorEditable } from '../hooks/useBlockEditorEditable';
import {
  IconArrowsDiagonal,
  IconCheck,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';

type BarcodeAttributeProps = Readonly<{
  editable: boolean;
  height: number;
  onResize: (size: BarcodeSize) => void;
  onRemove: (element: HTMLElement) => void;
  width: number;
}>;

export const BarcodeAttribute = ({
  editable,
  height,
  onResize,
  onRemove,
  width,
}: BarcodeAttributeProps) => {
  const canEdit = useBlockEditorEditable(editable);
  const barcodeRef = useRef<HTMLSpanElement>(null);
  const {
    form,
    size,
    preset,
    settingsOpen,
    applySize,
    handleSettingsOpenChange,
    handlePresetChange,
    handleInputKeyDown,
    handleResizeStart,
    handleResize,
    handleResizeEnd,
    handleResizeCancel,
  } = useBarcodeAttribute({ width, height, onResize });

  return (
    <span
      ref={barcodeRef}
      className="inline-flex flex-col items-start align-middle"
      contentEditable={false}
      title="Barcode preview — prints the selected product’s barcode"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 202 69"
        preserveAspectRatio="none"
        role="img"
        aria-label="Product barcode preview"
        className="block bg-white"
        style={size}
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
      {canEdit && (
        <span className="erxes-block-controls order-first mb-1 flex gap-1 rounded bg-background p-1 text-foreground shadow-sm print:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Resize barcode"
            title="Drag up to increase height; drag right to increase width"
            className="touch-none cursor-nesw-resize"
            onPointerDown={handleResizeStart}
            onPointerMove={handleResize}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeCancel}
          >
            <IconArrowsDiagonal />
          </Button>
          <Popover open={settingsOpen} onOpenChange={handleSettingsOpenChange}>
            <Popover.Trigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Barcode settings"
                title="Barcode settings"
              >
                <IconSettings />
              </Button>
            </Popover.Trigger>
            <Popover.Content
              className="w-64 text-foreground"
              onClick={(event) => event.stopPropagation()}
            >
              <Form {...form}>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Barcode size</p>
                  <Select
                    value={preset ? String(preset.width) : ''}
                    onValueChange={handlePresetChange}
                  >
                    <Select.Trigger aria-label="Barcode size preset">
                      <Select.Value placeholder="Custom size" />
                    </Select.Trigger>
                    <Select.Content>
                      {BARCODE_SIZE_PRESETS.map((size) => (
                        <Select.Item
                          key={size.width}
                          value={String(size.width)}
                        >
                          {size.width} × {size.height} px
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  {(['width', 'height'] as const).map((dimension) => (
                    <Form.Field
                      key={dimension}
                      control={form.control}
                      name={dimension}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>
                            {dimension === 'width'
                              ? 'Width (px)'
                              : 'Height (px)'}
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              onKeyDown={handleInputKeyDown}
                              type="number"
                              step={1}
                              min={BARCODE_DIMENSION_LIMITS[dimension].min}
                              max={BARCODE_DIMENSION_LIMITS[dimension].max}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  ))}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="icon"
                      aria-label="Apply barcode size"
                      title="Apply barcode size"
                      onClick={() => void applySize()}
                    >
                      <IconCheck />
                    </Button>
                  </div>
                </div>
              </Form>
            </Popover.Content>
          </Popover>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Delete barcode"
            title="Delete barcode"
            className="text-destructive"
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
