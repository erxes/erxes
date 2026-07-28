import { useLazyQuery } from '@apollo/client';
import {
  Button,
  Empty,
  Form,
  Input,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  Spinner,
  toast,
} from 'erxes-ui';
import {
  IconBriefcase,
  IconLabelFilled,
  IconPrinter,
} from '@tabler/icons-react';
import {
  PROCESS_DOCUMENT,
  SelectBranches,
  SelectBrand,
  SelectDepartments,
  SelectDocument,
} from 'ui-modules';
import {
  PAPER_SIZES,
  PAPER_TYPES,
} from 'ui-modules/modules/documents/constants';

import type { CellContext, ColumnDef } from '@tanstack/table-core';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import type { IDeal } from '@/deals/types/deals';
import { useForm } from 'react-hook-form';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DEAL_DOCUMENT_CONTENT_TYPE = 'sales:deal';
const DEALS_LIMIT = 100;
const DEFAULT_PAPER_SIZE = PAPER_SIZES.A4;
const PRINT_DOCUMENT_LOAD_TIMEOUT = 15_000;

type Props = {
  open: boolean;
  onClose: () => void;
  stageId: string;
};

type PrintFormValues = {
  copies: number;
  width: number;
  brandId: string;
  branchId: string;
  departmentId: string;
  documentId: string;
};

type ProcessDocumentData = {
  documentsProcess?: string;
};

type ProcessDocumentVariables = {
  _id: string;
  replacerIds: string[];
  config: {
    copies: number;
    width: number;
    height: number;
    type: string;
    brandId: string;
    branchId: string;
    departmentId: string;
  };
};

const getPageHeight = (width: number) =>
  width * (DEFAULT_PAPER_SIZE.height / DEFAULT_PAPER_SIZE.width);

const buildPrintReadyHtml = (html: string, width: number) => {
  const pageWidth = width > 0 ? width : DEFAULT_PAPER_SIZE.width;
  const pageHeight = getPageHeight(pageWidth);
  const documentNode = new DOMParser().parseFromString(html, 'text/html');

  if (!documentNode.body.querySelector('.label-item')) {
    const page = documentNode.createElement('section');
    page.className = 'label-item';

    while (documentNode.body.firstChild) {
      page.appendChild(documentNode.body.firstChild);
    }

    documentNode.body.appendChild(page);
  }

  const style = documentNode.createElement('style');
  style.textContent = `
    @page {
      size: ${pageWidth}mm ${pageHeight}mm;
      margin: 0;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      color: #18181b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      padding: 24px;
      background: #f4f4f5;
    }

    .label-item {
      width: ${pageWidth}mm !important;
      min-height: ${pageHeight}mm !important;
      margin: 0 auto 24px !important;
      padding: 12mm 14mm !important;
      overflow: visible !important;
      background: #ffffff;
      box-shadow: 0 8px 30px rgba(24, 24, 27, 0.12);
      break-after: page;
      page-break-after: always;
    }

    .label-item:last-child {
      margin-bottom: 0 !important;
      break-after: auto;
      page-break-after: auto;
    }

    .label-item > :first-child {
      margin-top: 0 !important;
    }

    .label-item h1 {
      margin: 0 0 12px !important;
      font-size: 20px !important;
      line-height: 1.3 !important;
    }

    .label-item h2 {
      margin: 14px 0 10px !important;
      font-size: 17px !important;
      line-height: 1.35 !important;
    }

    .label-item h3 {
      margin: 12px 0 8px !important;
      font-size: 15px !important;
      line-height: 1.4 !important;
    }

    .label-item p {
      margin: 0 0 10px !important;
      font-size: 13px !important;
      line-height: 1.45 !important;
    }

    .label-item table {
      width: 100% !important;
      margin: 12px 0 !important;
      table-layout: auto !important;
      border-collapse: collapse !important;
      font-size: 12px;
      line-height: 1.4;
    }

    .label-item thead {
      display: table-header-group;
    }

    .label-item tfoot {
      display: table-footer-group;
    }

    .label-item th,
    .label-item td {
      padding: 6px 8px !important;
      vertical-align: middle;
      word-break: break-word;
    }

    .label-item th {
      color: #27272a;
      font-weight: 600;
      text-align: left;
      border-bottom: 1px dashed #a1a1aa;
    }

    .label-item tbody td {
      border-bottom: 1px dashed #e4e4e7;
    }

    .label-item tbody tr:last-child td {
      border-bottom: 0;
    }

    .label-item tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    @media print {
      html,
      body {
        padding: 0;
        background: #ffffff;
      }

      .label-item {
        margin: 0 !important;
        box-shadow: none;
      }
    }
  `;
  documentNode.head.appendChild(style);

  return `<!DOCTYPE html>${documentNode.documentElement.outerHTML}`;
};

const showPrintLoading = (
  printWindow: Window,
  title: string,
  loadingLabel: string,
) => {
  const loadingDocument = printWindow.document;
  const style = loadingDocument.createElement('style');
  style.textContent = `
    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      background: #f4f4f5;
      color: #71717a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }

    .print-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
    }

    .print-loading-spinner {
      width: 28px;
      height: 28px;
      border: 3px solid #e4e4e7;
      border-top-color: #5b4ce6;
      border-radius: 9999px;
      animation: print-loading-spin 0.8s linear infinite;
    }

    @keyframes print-loading-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  const container = loadingDocument.createElement('main');
  container.className = 'print-loading';
  container.setAttribute('aria-live', 'polite');

  const spinner = loadingDocument.createElement('span');
  spinner.className = 'print-loading-spinner';
  spinner.setAttribute('aria-hidden', 'true');

  const label = loadingDocument.createElement('span');
  label.textContent = loadingLabel;

  container.append(spinner, label);
  loadingDocument.title = title;
  loadingDocument.head.replaceChildren(style);
  loadingDocument.body.replaceChildren(container);
};

const waitForPrintContent = async (printWindow: Window) => {
  const pendingImages = Array.from(printWindow.document.images).map(
    (image) =>
      new Promise<void>((resolve) => {
        if (image.complete) {
          resolve();
          return;
        }

        const finish = () => {
          image.removeEventListener('load', finish);
          image.removeEventListener('error', finish);
          resolve();
        };

        image.addEventListener('load', finish);
        image.addEventListener('error', finish);

        if (image.complete) {
          finish();
        }
      }),
  );

  await Promise.all([
    printWindow.document.fonts?.ready ?? Promise.resolve(),
    ...pendingImages,
  ]);

  await new Promise<void>((resolve) => {
    printWindow.requestAnimationFrame(() => {
      printWindow.requestAnimationFrame(() => resolve());
    });
  });
};

const waitForPrintDocument = (
  printWindow: Window,
  printUrl: string,
  errorMessage: string,
) =>
  new Promise<void>((resolve, reject) => {
    const startedAt = Date.now();

    const checkDocument = () => {
      if (printWindow.closed) {
        reject(new Error(errorMessage));
        return;
      }

      if (
        printWindow.document.URL === printUrl &&
        printWindow.document.readyState === 'complete'
      ) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= PRINT_DOCUMENT_LOAD_TIMEOUT) {
        reject(new Error(errorMessage));
        return;
      }

      window.setTimeout(checkDocument, 50);
    };

    checkDocument();
  });

const printHtml = async (
  printWindow: Window,
  html: string,
  title: string,
  width: number,
  errorMessage: string,
) => {
  const printReadyHtml = buildPrintReadyHtml(html, width);
  const printUrl = URL.createObjectURL(
    new Blob([printReadyHtml], { type: 'text/html;charset=utf-8' }),
  );

  try {
    printWindow.location.replace(printUrl);
    await waitForPrintDocument(printWindow, printUrl, errorMessage);
    URL.revokeObjectURL(printUrl);
    printWindow.document.title = title;
    await waitForPrintContent(printWindow);

    if (printWindow.closed) {
      return;
    }

    printWindow.addEventListener('afterprint', () => printWindow.close(), {
      once: true,
    });
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    URL.revokeObjectURL(printUrl);
    throw error;
  }
};

const PrintDealSelectionSync = ({
  onSelectionChange,
}: {
  onSelectionChange: (dealIds: string[]) => void;
}) => {
  const { table } = RecordTable.useRecordTable();
  const rowSelection = table.getState().rowSelection;

  useEffect(() => {
    onSelectionChange(
      table
        .getSelectedRowModel()
        .rows.map((row) => (row.original as IDeal)._id),
    );
  }, [onSelectionChange, rowSelection, table]);

  return null;
};

const PrintDealNumberHeader = () => {
  const { t } = useTranslation('sales');

  return <RecordTable.InlineHead label={t('number')} icon={IconLabelFilled} />;
};

const PrintDealNumberCell = ({ row }: CellContext<IDeal, unknown>) => (
  <RecordTableInlineCell className="text-muted-foreground">
    {row.original.number || ''}
  </RecordTableInlineCell>
);

const PrintDealNameHeader = () => {
  const { t } = useTranslation('sales');

  return <RecordTable.InlineHead label={t('name')} icon={IconLabelFilled} />;
};

const PrintDealNameCell = ({ row }: CellContext<IDeal, unknown>) => {
  const { t } = useTranslation('sales');

  return (
    <RecordTableInlineCell className="font-medium">
      {row.original.name || t('untitled-deal')}
    </RecordTableInlineCell>
  );
};

const PRINT_DEAL_COLUMNS: ColumnDef<IDeal>[] = [
  RecordTable.checkboxColumn as ColumnDef<IDeal>,
  {
    id: 'number',
    accessorKey: 'number',
    header: PrintDealNumberHeader,
    cell: PrintDealNumberCell,
    size: 140,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: PrintDealNameHeader,
    cell: PrintDealNameCell,
    size: 360,
  },
];

const PrintDealsRecordTable = ({
  deals,
  loading,
  onSelectionChange,
}: {
  deals: IDeal[];
  loading: boolean;
  onSelectionChange: (dealIds: string[]) => void;
}) => {
  const { t } = useTranslation('sales');
  let tableContent: ReactNode;

  if (loading) {
    tableContent = (
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowSkeleton rows={5} />
        </RecordTable.Body>
      </RecordTable>
    );
  } else if (deals.length === 0) {
    tableContent = (
      <Empty className="min-h-40 border-0 bg-transparent">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconBriefcase />
          </Empty.Media>
          <Empty.Title>{t('no-deals-in-stage')}</Empty.Title>
        </Empty.Header>
      </Empty>
    );
  } else {
    tableContent = (
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    );
  }

  return (
    <RecordTable.Provider
      columns={PRINT_DEAL_COLUMNS}
      data={deals}
      className="max-h-[calc(100dvh-28rem)] min-h-40 overflow-auto"
      stickyColumns={['checkbox', 'number']}
      tableId="sales_print_deals_record_table"
    >
      <PrintDealSelectionSync onSelectionChange={onSelectionChange} />
      {tableContent}
    </RecordTable.Provider>
  );
};

export const PrintDialog = ({ open, onClose, stageId }: Props) => {
  const { deals = [], loading } = useDeals({
    variables: {
      stageId,
      limit: DEALS_LIMIT,
    },
    skip: !open,
    fetchPolicy: 'network-only',
  });

  const form = useForm<PrintFormValues>({
    defaultValues: {
      copies: 1,
      width: DEFAULT_PAPER_SIZE.width,
      brandId: '',
      branchId: '',
      departmentId: '',
      documentId: '',
    },
  });

  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [processDocument, { loading: processing }] = useLazyQuery<
    ProcessDocumentData,
    ProcessDocumentVariables
  >(PROCESS_DOCUMENT, {
    fetchPolicy: 'no-cache',
  });
  const { t } = useTranslation('sales');

  const print = async () => {
    const { copies, width, brandId, branchId, departmentId, documentId } =
      form.getValues();

    if (!documentId) {
      toast({
        title: t('error'),
        description: t('please-select-document'),
        variant: 'destructive',
      });
      return;
    }

    if (!selectedDealIds.length) {
      toast({
        title: t('error'),
        description: t('please-select-at-least-one-deal'),
        variant: 'destructive',
      });
      return;
    }

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      toast({
        title: t('error'),
        description: t('print-popup-blocked'),
        variant: 'destructive',
      });
      return;
    }

    printWindow.opener = null;
    showPrintLoading(printWindow, t('print-document'), t('loading'));

    try {
      const pageWidth = width || DEFAULT_PAPER_SIZE.width;

      const { data } = await processDocument({
        variables: {
          _id: documentId,
          replacerIds: selectedDealIds,
          config: {
            copies: copies || 1,
            width: pageWidth,
            height: getPageHeight(pageWidth),
            type: PAPER_TYPES.SHEET,
            brandId,
            branchId,
            departmentId,
          },
        },
      });

      const html = data?.documentsProcess;

      if (!html) {
        throw new Error(t('print-document-failed'));
      }

      await printHtml(
        printWindow,
        html,
        t('print-document'),
        pageWidth,
        t('print-document-failed'),
      );
    } catch (error: unknown) {
      printWindow.close();
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('an-error-occurred'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Sheet.View className="inset-y-0 right-0 h-dvh rounded-none border-l p-0 sm:max-w-2xl">
        <Form {...form}>
          <form
            className="flex h-full min-h-0 flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              void print();
            }}
          >
            <Sheet.Header>
              <Sheet.Title className="flex items-center gap-2">
                <IconPrinter className="size-4" />
                {t('print-document')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="min-h-0 flex-1 overflow-y-auto rounded-none border-b-0">
              <div className="border-b px-5 py-5">
                <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                  <Form.Field
                    control={form.control}
                    name="copies"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('copies')}</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(event) =>
                              field.onChange(
                                Number.parseInt(event.target.value) || 1,
                              )
                            }
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('width')}</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(event) =>
                              field.onChange(
                                Number.parseInt(event.target.value) ||
                                  DEFAULT_PAPER_SIZE.width,
                              )
                            }
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('brand')}</Form.Label>
                        <SelectBrand
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={t('choose-brands')}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="branchId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('branches')}</Form.Label>
                        <SelectBranches.FormItem
                          onValueChange={field.onChange}
                          value={field.value}
                          mode="single"
                          className="focus-visible:relative focus-visible:z-10"
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('department')}</Form.Label>
                        <SelectDepartments.FormItem
                          mode="single"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="focus-visible:relative focus-visible:z-10"
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="documentId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('select-document')}</Form.Label>
                        <SelectDocument.FormItem
                          contentType={DEAL_DOCUMENT_CONTENT_TYPE}
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(
                              Array.isArray(value) ? value[0] || '' : value,
                            )
                          }
                          placeholder={t('select-document')}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{t('deals')}</h3>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {selectedDealIds.length}/{deals.length}
                  </span>
                </div>
                <PrintDealsRecordTable
                  deals={deals}
                  loading={loading}
                  onSelectionChange={setSelectedDealIds}
                />
              </div>
            </Sheet.Content>

            <Sheet.Footer className="shrink-0 border-t bg-background">
              <Sheet.Close asChild>
                <Button type="button" variant="ghost">
                  {t('cancel')}
                </Button>
              </Sheet.Close>
              <Button type="submit" disabled={loading || processing}>
                {processing ? <Spinner /> : <IconPrinter />}
                {t('print')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
