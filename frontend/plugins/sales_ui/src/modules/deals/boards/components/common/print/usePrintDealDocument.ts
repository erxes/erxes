import { useLazyQuery } from '@apollo/client';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';
import { PROCESS_DOCUMENT } from 'ui-modules';

import {
  DEFAULT_PAPER_SIZE,
  PRINT_PAPER_TYPE,
} from '@/deals/boards/components/common/print/constants';
import {
  getPageHeight,
  printHtml,
  showPrintLoading,
} from '@/deals/boards/components/common/print/printUtils';
import type {
  PrintFormValues,
  ProcessDocumentData,
  ProcessDocumentVariables,
} from '@/deals/boards/components/common/print/types';

type UsePrintDealDocumentOptions = {
  form: UseFormReturn<PrintFormValues>;
  selectedDealIds: string[];
};

export const usePrintDealDocument = ({
  form,
  selectedDealIds,
}: UsePrintDealDocumentOptions) => {
  const { t } = useTranslation('sales');
  const [processDocument, { loading: processing }] = useLazyQuery<
    ProcessDocumentData,
    ProcessDocumentVariables
  >(PROCESS_DOCUMENT, {
    fetchPolicy: 'no-cache',
  });

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
            type: PRINT_PAPER_TYPE,
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

  return {
    print,
    processing,
  };
};
