import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Form,
  Input,
  Label,
  Popover,
  Select,
} from 'erxes-ui/components';
import { IconArrowsDiagonal, IconSettings } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const MIN_WIDTH = 1;
const MIN_HEIGHT = 1;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 300;

type BarcodeSize = Readonly<{ width: number; height: number }>;

const BARCODE_SIZE_PRESETS: (BarcodeSize & { label: string })[] = [
  { label: 'Small', width: 200, height: 60 },
  { label: 'Normal (recommended)', width: 300, height: 100 },
  { label: 'Large', width: 400, height: 120 },
  { label: 'High-resolution/printing', width: 600, height: 200 },
];

const barcodeSizeSchema = z.object({
  width: z.coerce.number().finite().min(MIN_WIDTH).max(MAX_WIDTH),
  height: z.coerce.number().finite().min(MIN_HEIGHT).max(MAX_HEIGHT),
});

const BarcodeSizeControls = ({
  width,
  height,
  onResize,
  onApply,
}: Omit<BarcodeAttributeProps, 'editable'> & { onApply: () => void }) => {
  const presetId = useId();
  const form = useForm<z.infer<typeof barcodeSizeSchema>>({
    defaultValues: { width, height },
  });
  const { reset } = form;
  const applySize = form.handleSubmit((values) => {
    onResize(barcodeSizeSchema.parse(values));
    onApply();
  });
  const preset = BARCODE_SIZE_PRESETS.find(
    (size) => size.width === width && size.height === height,
  );

  useEffect(() => {
    reset({ width, height });
  }, [width, height, reset]);

  return (
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
        <span className="text-sm font-semibold">Barcode size</span>
        <div className="space-y-1">
          <Label htmlFor={presetId}>Preset (px)</Label>
          <Select
            value={preset ? `${preset.width}:${preset.height}` : ''}
            onValueChange={(value) => {
              const selected = BARCODE_SIZE_PRESETS.find(
                (size) => `${size.width}:${size.height}` === value,
              );
              if (selected) {
                const size = { width: selected.width, height: selected.height };
                reset(size);
                onResize(size);
              }
            }}
          >
            <Select.Trigger id={presetId}>
              <Select.Value placeholder="Custom size" />
            </Select.Trigger>
            <Select.Content>
              {BARCODE_SIZE_PRESETS.map((size) => (
                <Select.Item
                  key={`${size.width}:${size.height}`}
                  value={`${size.width}:${size.height}`}
                >
                  {size.label} — {size.width} × {size.height} px
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(['width', 'height'] as const).map((dimension) => (
            <Form.Field
              key={dimension}
              control={form.control}
              name={dimension}
              rules={{
                validate: (value) => {
                  const result =
                    barcodeSizeSchema.shape[dimension].safeParse(value);
                  return result.success || result.error.issues[0].message;
                },
              }}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {dimension === 'width' ? 'Width (px)' : 'Height (px)'}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      type="number"
                      min={dimension === 'width' ? MIN_WIDTH : MIN_HEIGHT}
                      max={dimension === 'width' ? MAX_WIDTH : MAX_HEIGHT}
                      step="any"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          ))}
        </div>
        <Button
          type="button"
          className="w-full"
          onClick={() => void applySize()}
        >
          Apply size
        </Button>
      </div>
    </Form>
  );
};

type BarcodeAttributeProps = Readonly<{
  editable: boolean;
  height: number;
  onResize: (size: BarcodeSize) => void;
  width: number;
}>;

export const BarcodeAttribute = ({
  editable,
  height,
  onResize,
  width,
}: BarcodeAttributeProps) => {
  const [size, setSize] = useState<BarcodeSize>({ width, height });
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      className="inline-flex flex-col align-middle"
      contentEditable={false}
      title="Barcode preview — prints the selected product’s barcode"
    >
      {editable && (
        <span className="barcode-controls mb-1 flex items-center gap-2 print:hidden">
          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <Popover.Trigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Barcode size settings"
                title="Set barcode size"
                className="size-7 shrink-0 border border-border bg-background p-0 text-foreground"
                onMouseDown={(event) => event.preventDefault()}
              >
                <IconSettings className="size-3" />
              </Button>
            </Popover.Trigger>
            <Popover.Content align="start" contentEditable={false}>
              <BarcodeSizeControls
                width={width}
                height={height}
                onResize={onResize}
                onApply={() => setSettingsOpen(false)}
              />
            </Popover.Content>
          </Popover>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Resize barcode"
            title="Drag up to increase height; drag right to increase width"
            className="size-7 shrink-0 touch-none cursor-nesw-resize border border-border bg-background p-0 text-foreground"
            onPointerDown={handleResizeStart}
            onPointerMove={handleResize}
            onPointerUp={handleResizeEnd}
            onPointerCancel={() => {
              dragStart.current = null;
              setSize({ width, height });
            }}
          >
            <IconArrowsDiagonal className="size-3" />
          </Button>
        </span>
      )}
      <span className="inline-block" style={size}>
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
      </span>
    </span>
  );
};
