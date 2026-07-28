import { useLazyQuery, useQuery } from '@apollo/client';
import { IconPrinter } from '@tabler/icons-react';
import { Combobox, Command, DropdownMenu, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrintDocument } from 'ui-modules';
import {
  DOCUMENTS_QUERY,
  PROCESS_DOCUMENT,
} from 'ui-modules/modules/documents/graphql/queries';

import { IDeal } from '@/deals/types/deals';

const DEAL_DOCUMENT_CONTENT_TYPE = 'sales:deal';
const DOCUMENTS_LIMIT = 100;

type DealDocument = {
  _id: string;
  name: string;
};

type DocumentsQueryData = {
  documents?: {
    list?: DealDocument[];
  };
};

type DocumentsQueryVariables = {
  contentType: string;
  limit: number;
};

type ProcessDocumentData = {
  documentsProcess?: string;
};

type ProcessDocumentVariables = {
  _id: string;
  replacerIds: string[];
};

type DealPrintDocumentProps = {
  deals: Pick<IDeal, '_id'>[];
  disabled?: boolean;
  variant?: 'button' | 'submenu';
};

type DealPrintDocumentSubmenuProps = Omit<DealPrintDocumentProps, 'variant'>;

const printHtml = (printWindow: Window, html: string, title: string) => {
  const printUrl = URL.createObjectURL(
    new Blob([html], { type: 'text/html;charset=utf-8' }),
  );

  printWindow.addEventListener(
    'load',
    () => {
      URL.revokeObjectURL(printUrl);
      printWindow.document.title = title;
      printWindow.focus();
      printWindow.print();
    },
    { once: true },
  );

  printWindow.location.replace(printUrl);
};

const DealPrintDocumentSubmenu = ({
  deals,
  disabled = false,
}: DealPrintDocumentSubmenuProps) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);

  const { data, loading, error } = useQuery<
    DocumentsQueryData,
    DocumentsQueryVariables
  >(DOCUMENTS_QUERY, {
    variables: {
      contentType: DEAL_DOCUMENT_CONTENT_TYPE,
      limit: DOCUMENTS_LIMIT,
    },
    skip: !open,
    fetchPolicy: 'network-only',
  });

  const [processDocument, { loading: processing }] = useLazyQuery<
    ProcessDocumentData,
    ProcessDocumentVariables
  >(PROCESS_DOCUMENT, {
    fetchPolicy: 'no-cache',
  });

  const documents = data?.documents?.list ?? [];

  const handlePrint = async (document: DealDocument) => {
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

    try {
      const { data: processData } = await processDocument({
        variables: {
          _id: document._id,
          replacerIds: deals.map((deal) => deal._id),
        },
      });

      const html = processData?.documentsProcess;

      if (!html) {
        throw new Error(t('print-document-failed'));
      }

      printHtml(printWindow, html, document.name);
    } catch (printError) {
      printWindow.close();
      toast({
        title: t('error'),
        description:
          printError instanceof Error
            ? printError.message
            : t('print-document-failed'),
        variant: 'destructive',
      });
    }
  };

  const menuContent = (
    <Command>
      <Command.Input placeholder={t('search-document')} focusOnMount />
      <Command.List>
        <Combobox.Empty loading={loading} error={error} />
        {documents.map((document) => (
          <Command.Item
            key={document._id}
            value={document.name}
            disabled={processing}
            onSelect={() => {
              setOpen(false);
              void handlePrint(document);
            }}
          >
            <span className="min-w-0 flex-1 truncate">{document.name}</span>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );

  return (
    <DropdownMenu.Sub open={open} onOpenChange={setOpen}>
      <DropdownMenu.SubTrigger disabled={disabled || processing}>
        <IconPrinter />
        {t('print-document')}
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className="w-72 overflow-hidden p-0">
          {menuContent}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
};

export const DealPrintDocument = ({
  deals,
  disabled = false,
  variant = 'button',
}: DealPrintDocumentProps) => {
  if (variant === 'submenu') {
    return <DealPrintDocumentSubmenu deals={deals} disabled={disabled} />;
  }

  return (
    <fieldset className="contents" disabled={disabled}>
      <PrintDocument items={deals} contentType={DEAL_DOCUMENT_CONTENT_TYPE} />
    </fieldset>
  );
};
