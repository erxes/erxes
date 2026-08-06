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
  ...props
}: React.ComponentProps<typeof Sheet> & { children?: ReactNode }) => (
  <Sheet {...props}>
    <Sheet.Trigger asChild>
      <Button variant="secondary" className="text-primary">
        <IconPrinter />
        Print
      </Button>
    </Sheet.Trigger>
    <Sheet.View className="sm:max-w-none md:w-[calc(100vw-(--spacing(4)))] flex gap-0 flex-col m-0 p-0">
      <Sheet.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
        <Sheet.Title>Print</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      {children}
    </Sheet.View>
  </Sheet>
);

export const PrintDocument = ({
  items,
  contentType,
}: {
  items: PrintItem[];
  contentType: string;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [open, setOpen] = useState(false);

  const form = useForm<PrintFormValues>({
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
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

  const handleDiscard = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <FormProvider {...form}>
      <PrintSheet open={open} onOpenChange={setOpen}>
        <Resizable.PanelGroup direction="horizontal">
          <Resizable.Panel
            className="h-full flex flex-col bg-gray-100 overflow-hidden"
            minSize={40}
            defaultSize={80}
          >
            <PrintPreview iframeRef={iframeRef} />
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
                <PrintSettings contentType={contentType} />
              </div>
              <Sheet.Footer className="absolute bottom-0 right-0 p-5">
                <Button variant="secondary" onClick={handleDiscard}>
                  Discard
                </Button>
                <Button onClick={print} disabled={isRunning}>
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
