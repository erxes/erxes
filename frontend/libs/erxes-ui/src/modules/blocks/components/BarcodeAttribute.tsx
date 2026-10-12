import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Form, Input, Popover, Select } from 'erxes-ui/components';
import { Resolver, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  IconArrowsDiagonal,
  IconCheck,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';

const MIN_WIDTH = 80;
const MIN_HEIGHT = 30;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 300;

const barcodeSizeSchema = z.object({
  width: z.coerce.number().finite().int().min(MIN_WIDTH).max(MAX_WIDTH),
  height: z.coerce.number().finite().int().min(MIN_HEIGHT).max(MAX_HEIGHT),
});

const resolveBarcodeSize: Resolver<BarcodeSize> = (values) => {
  const result = barcodeSizeSchema.safeParse(values);
  if (result.success)
    return {
      values: {
        width: Number(result.data.width),
        height: Number(result.data.height),
      },
      errors: {},
    };
  const errors: {
    width?: { type: string; message: string };
    height?: { type: string; message: string };
  } = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === 'width' || field === 'height')
      errors[field] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors };
};

type BarcodeSize = Readonly<{ width: number; height: number }>;

const BARCODE_SIZE_PRESETS: BarcodeSize[] = [
  { width: 113, height: 78 },
  { width: 141, height: 98 },
  { width: 169, height: 118 },
  { width: 211, height: 147 },
  { width: 282, height: 196 },
];

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
  const barcodeRef = useRef<HTMLSpanElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const form = useForm<BarcodeSize>({
    resolver: resolveBarcodeSize,
    defaultValues: { width, height },
  });
  const dimensions = form.watch();
  const preset = BARCODE_SIZE_PRESETS.find(
    (size) =>
      size.width === Number(dimensions.width) &&
      size.height === Number(dimensions.height),
  );
  const applySize = form.handleSubmit((dimensions) => {
    setSize(dimensions);
    onResize(dimensions);
    setSettingsOpen(false);
  });
  const [size, setSize] = useState<BarcodeSize>({ width, height });
  const dragStart = useRef<
    (BarcodeSize & { clientX: number; clientY: number }) | null
  >(null);

  useEffect(() => {
    if (!dragStart.current) {
      setSize({ width, height });
    }
  }, [height, width]);

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

  const handleResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragStart.current) {
      setSize(getResizedDimensions(event));
    }
  };

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
      {editable && (
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
            onPointerCancel={() => {
              dragStart.current = null;
              setSize({ width, height });
            }}
          >
            <IconArrowsDiagonal />
          </Button>
          <Popover
            open={settingsOpen}
            onOpenChange={(open) => {
              if (open) form.reset({ width: size.width, height: size.height });
              setSettingsOpen(open);
            }}
          >
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
                <div
                  className="space-y-3"
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' &&
                      event.target instanceof HTMLInputElement
                    ) {
                      event.preventDefault();
                      event.stopPropagation();
                      void applySize();
                    }
                  }}
                >
                  <p className="text-sm font-medium">Barcode size</p>
                  <Select
                    value={preset ? String(preset.width) : ''}
                    onValueChange={(value) => {
                      const selected = BARCODE_SIZE_PRESETS.find(
                        (size) => String(size.width) === value,
                      );
                      if (selected) form.reset(selected);
                    }}
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
                              type="number"
                              step={1}
                              min={
                                dimension === 'width' ? MIN_WIDTH : MIN_HEIGHT
                              }
                              max={
                                dimension === 'width' ? MAX_WIDTH : MAX_HEIGHT
                              }
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
