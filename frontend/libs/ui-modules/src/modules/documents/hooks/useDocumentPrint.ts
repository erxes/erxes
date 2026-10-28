import { RefObject, useEffect, useRef, useState } from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { PAPER_SIZES } from '../constants';
import { PrintFormValues, PrintItem } from '../types/print';
import { usePrintJob } from './usePrintJob';

const DEFAULT_VALUES: PrintFormValues = {
  _id: '',
  brandId: '',
  copies: 1,
  entityId: '',
  height: PAPER_SIZES.A4.height,
  margin: 15,
  offsetX: 0,
  offsetY: 0,
  orientation: 'portrait',
  replacerIds: [],
  scale: 100,
  size: 'A4',
  width: PAPER_SIZES.A4.width,
};

export type DocumentPrintOptions = {
  items: PrintItem[];
  document?: { _id: string; name?: string };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const useDocumentPrint = ({
  items,
  document,
  open,
  onOpenChange,
}: DocumentPrintOptions): {
  iframeRef: RefObject<HTMLIFrameElement>;
  form: UseFormReturn<PrintFormValues>;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  previewReady: boolean;
  setPreviewReady: (ready: boolean) => void;
  isRunning: boolean;
  print: () => void;
  handleDiscard: () => void;
} => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const sheetOpen = open ?? internalOpen;
  const previousIds = useRef(items.map((item) => item._id));
  const previousDocumentId = useRef(document?._id);
  const form = useForm<PrintFormValues>({
    mode: 'onChange',
    defaultValues: {
      ...DEFAULT_VALUES,
      _id: document?._id || '',
      replacerIds: previousIds.current,
    },
  });
  const { isRunning, print } = usePrintJob({
    iframeRef,
    getValues: form.getValues,
  });

  const setSheetOpen = (nextOpen: boolean): void => {
    setInternalOpen(nextOpen);
    if (!nextOpen) setPreviewReady(false);
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    const nextIds = items.map((item) => item._id);
    if (
      nextIds.length === previousIds.current.length &&
      nextIds.every((id, index) => id === previousIds.current[index])
    )
      return;
    previousIds.current = nextIds;
    form.setValue('replacerIds', nextIds);
  }, [items, form]);

  useEffect(() => {
    if (previousDocumentId.current === document?._id) return;
    previousDocumentId.current = document?._id;
    form.setValue('_id', document?._id || '');
  }, [document?._id, form]);

  useEffect(() => {
    if (!sheetOpen) setPreviewReady(false);
  }, [sheetOpen]);

  const handleDiscard = (): void => {
    form.reset({
      ...DEFAULT_VALUES,
      _id: document?._id || '',
      replacerIds: items.map((item) => item._id),
    });
    setSheetOpen(false);
  };
  return {
    iframeRef,
    form,
    sheetOpen,
    setSheetOpen,
    previewReady,
    setPreviewReady,
    isRunning,
    print,
    handleDiscard,
  };
};
