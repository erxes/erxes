import { IconPrinter } from '@tabler/icons-react';
import { Button, Resizable, Sheet } from 'erxes-ui';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { PrintPreview } from 'ui-modules/modules/documents/components/PrintPreview';
import { PrintSettings } from 'ui-modules/modules/documents/components/PrintSettings';
import { PAPER_SIZES } from 'ui-modules/modules/documents/constants';
import { usePrintJob } from 'ui-modules/modules/documents/hooks/usePrintJob';
import {
  PrintFormValues,
  PrintItem,
} from 'ui-modules/modules/documents/types/print';

const DEFAULT_VALUES: PrintFormValues = {
  _id: '',
  brandId: '',
  branchId: '',
  copies: 1,
  departmentId: '',
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

export const PrintSheet = ({
  children,
  trigger,
  ...props
}: React.ComponentProps<typeof Sheet> & {
  children?: ReactNode;
  trigger?: ReactNode | null;
}) => (
  <Sheet {...props}>
    {trigger !== null && (
      <Sheet.Trigger asChild>
        {trigger ?? (
          <Button type="button" variant="secondary" className="text-primary">
            <IconPrinter />
            Print
          </Button>
        )}
      </Sheet.Trigger>
    )}
    <Sheet.View
      className="sm:max-w-none md:w-[calc(100vw-(--spacing(4)))] flex gap-0 flex-col m-0 p-0"
      onClick={(event) => event.stopPropagation()}
    >
      <Sheet.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
        <Sheet.Title>Print</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Description className="sr-only">
        Select a document template and configure its print layout.
      </Sheet.Description>
      {children}
    </Sheet.View>
  </Sheet>
);

export const PrintDocument = ({
  items,
  contentType,
  document,
  open,
  onOpenChange,
  trigger,
}: {
  items: PrintItem[];
  contentType: string;
  document?: {
    _id: string;
    name?: string;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode | null;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const sheetOpen = open ?? internalOpen;
  const [previewReady, setPreviewReady] = useState(false);

  function setSheetOpen(nextOpen: boolean) {
    setInternalOpen(nextOpen);
    if (!nextOpen) setPreviewReady(false);
    onOpenChange?.(nextOpen);
  }

  const form = useForm<PrintFormValues>({
    mode: 'onChange',
    defaultValues: {
      ...DEFAULT_VALUES,
      _id: document?._id || '',
      replacerIds: items.map((item) => item._id),
    },
  });

  const { isRunning, print } = usePrintJob({
    iframeRef,
    getValues: form.getValues,
  });

  useEffect(() => {
    form.setValue(
      'replacerIds',
      items.map((item) => item._id),
    );
  }, [form, items]);

  useEffect(() => {
    if (document?._id) {
      form.setValue('_id', document._id);
    }
  }, [document?._id, form]);

  const handleDiscard = () => {
    form.reset({
      ...DEFAULT_VALUES,
      _id: document?._id || '',
      replacerIds: items.map((item) => item._id),
    });
    setSheetOpen(false);
  };

  return (
    <FormProvider {...form}>
      <PrintSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        trigger={trigger}
      >
        <Resizable.PanelGroup direction="horizontal" className="flex-1 min-h-0">
          <Resizable.Panel
            className="h-full flex flex-col bg-gray-100 overflow-hidden"
            minSize={40}
            defaultSize={80}
          >
            <PrintPreview
              iframeRef={iframeRef}
              onReadyChange={setPreviewReady}
            />
          </Resizable.Panel>
          <Resizable.Handle />
          <Resizable.Panel
            className="h-full flex flex-col"
            minSize={20}
            defaultSize={25}
            maxSize={25}
          >
            <div className="flex flex-col h-full relative">
              <div className="overflow-y-auto styled-scroll mb-16">
                <PrintSettings
                  contentType={contentType}
                  initialDocumentName={document?.name}
                  selectCustomers={
                    contentType === 'core:broadcast' && items.length === 0
                  }
                />
              </div>
              <Sheet.Footer className="absolute bottom-0 right-0 p-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDiscard}
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  onClick={print}
                  disabled={isRunning || !previewReady}
                >
                  {isRunning ? 'Printing' : 'Print'}
                </Button>
              </Sheet.Footer>
            </div>
          </Resizable.Panel>
        </Resizable.PanelGroup>
      </PrintSheet>
    </FormProvider>
  );
};
