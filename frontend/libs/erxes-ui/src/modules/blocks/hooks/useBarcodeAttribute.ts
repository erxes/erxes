import {
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MIN_WIDTH = 80;
const MIN_HEIGHT = 30;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 300;

const barcodeSizeSchema = z.object({
  width: z.coerce.number().finite().int().min(MIN_WIDTH).max(MAX_WIDTH),
  height: z.coerce.number().finite().int().min(MIN_HEIGHT).max(MAX_HEIGHT),
});

export type BarcodeSize = Readonly<{ width: number; height: number }>;

export const BARCODE_SIZE_PRESETS: BarcodeSize[] = [
  { width: 113, height: 78 },
  { width: 141, height: 98 },
  { width: 169, height: 118 },
  { width: 211, height: 147 },
  { width: 282, height: 196 },
];

export const BARCODE_DIMENSION_LIMITS = {
  width: { min: MIN_WIDTH, max: MAX_WIDTH },
  height: { min: MIN_HEIGHT, max: MAX_HEIGHT },
} as const;

export const useBarcodeAttribute = ({
  width,
  height,
  onResize,
}: {
  width: number;
  height: number;
  onResize: (size: BarcodeSize) => void;
}): {
  form: UseFormReturn<BarcodeSize>;
  size: BarcodeSize;
  preset: BarcodeSize | undefined;
  settingsOpen: boolean;
  applySize: () => Promise<void>;
  handleSettingsOpenChange: (open: boolean) => void;
  handlePresetChange: (value: string) => void;
  handleInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleResizeStart: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handleResize: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handleResizeEnd: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  handleResizeCancel: () => void;
} => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const form = useForm<BarcodeSize>({
    resolver: zodResolver(
      barcodeSizeSchema as unknown as Parameters<typeof zodResolver>[0],
    ),
    defaultValues: { width, height },
  });
  const dimensions = form.watch();
  const preset = BARCODE_SIZE_PRESETS.find(
    (size) =>
      size.width === Number(dimensions.width) &&
      size.height === Number(dimensions.height),
  );
  const applySize = form.handleSubmit((dimensions) => {
    onResize(dimensions);
    setSettingsOpen(false);
  });
  const [dragSize, setDragSize] = useState<BarcodeSize | null>(null);
  const size = dragSize ?? { width, height };
  const dragStart = useRef<
    (BarcodeSize & { clientX: number; clientY: number }) | null
  >(null);

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
      setDragSize(getResizedDimensions(event));
    }
  };

  const handleResizeEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) {
      return;
    }

    const resizedDimensions = getResizedDimensions(event);
    dragStart.current = null;
    onResize(resizedDimensions);
    setDragSize(null);
  };

  const handleSettingsOpenChange = (open: boolean): void => {
    if (open) form.reset({ width: size.width, height: size.height });
    setSettingsOpen(open);
  };
  const handlePresetChange = (value: string): void => {
    const selected = BARCODE_SIZE_PRESETS.find(
      (preset) => String(preset.width) === value,
    );
    if (selected) form.reset(selected);
  };
  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    void applySize();
  };
  const handleResizeCancel = (): void => {
    dragStart.current = null;
    setDragSize(null);
  };
  return {
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
  };
};
