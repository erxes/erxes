import { IconPrinter } from '@tabler/icons-react';
import { Button, Resizable, Sheet } from 'erxes-ui';
import { ReactNode } from 'react';
import { FormProvider } from 'react-hook-form';
import { Can } from 'ui-modules/modules/permissions';
import { PrintPreview } from 'ui-modules/modules/documents/components/PrintPreview';
import { PrintSettings } from 'ui-modules/modules/documents/components/PrintSettings';
import {
  DocumentPrintOptions,
  useDocumentPrint,
} from '../hooks/useDocumentPrint';

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
}: DocumentPrintOptions & {
  contentType: string;
  trigger?: ReactNode | null;
}) => {
  const {
    iframeRef,
    form,
    sheetOpen,
    setSheetOpen,
    previewReady,
    setPreviewReady,
    isRunning,
    print,
    handleDiscard,
  } = useDocumentPrint({ items, document, open, onOpenChange });

  return (
    <Can action="documentsRead">
      <FormProvider {...form}>
        <PrintSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          trigger={trigger}
        >
          <Resizable.PanelGroup
            direction="horizontal"
            className="flex-1 min-h-0"
          >
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
    </Can>
  );
};
