import { useTranslation } from 'react-i18next';
import { IconPrinter } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
import { useDocumentPrintDialog } from '../hooks/useDocumentPrintDialog';
import {
  PrintDocument,
  SelectCompany,
  SelectCustomer,
  SelectMember,
  SelectProduct,
} from 'ui-modules';

import { IDocument } from '../types';

const DOCUMENT_REPLACER_LABELS: Record<string, string> = {
  'core:contact.customer': 'customer',
  'core:customer': 'customer',
  'core:contacts.customers': 'customer',
  'core:contact.company': 'company',
  'core:company': 'company',
  'core:contacts.companies': 'company',
  'core:product': 'product',
  'core:user': 'team-member',
  'core:broadcast': 'customer',
};

type ReplacerValue = string | string[] | null;

function getReplacerId(value: ReplacerValue) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function DocumentReplacerSelect({
  contentType,
  value,
  onValueChange,
}: {
  contentType: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  function handleValueChange(nextValue: ReplacerValue) {
    onValueChange(getReplacerId(nextValue));
  }

  switch (contentType) {
    case 'core:contact.customer':
    case 'core:customer':
    case 'core:contacts.customers':
    case 'core:broadcast':
      return (
        <SelectCustomer
          mode="single"
          value={value}
          onValueChange={handleValueChange}
        />
      );
    case 'core:contact.company':
    case 'core:company':
    case 'core:contacts.companies':
      return (
        <SelectCompany
          mode="single"
          value={value}
          onValueChange={handleValueChange}
        />
      );
    case 'core:product':
      return (
        <SelectProduct
          mode="single"
          value={value}
          onValueChange={handleValueChange}
        />
      );
    case 'core:user':
      return (
        <SelectMember
          mode="single"
          value={value}
          onValueChange={handleValueChange}
        />
      );
    default:
      return null;
  }
}

export function hasDocumentReplacerSelect(contentType: string) {
  return contentType in DOCUMENT_REPLACER_LABELS;
}

type DocumentPrintDialogContentProps = {
  documentItem: IDocument;
  onCancel: () => void;
  onContinue: () => void;
  replacerId: string;
  replacerLabel: string;
  setReplacerId: (replacerId: string) => void;
};

function DocumentPrintDialogContent({
  documentItem,
  onCancel,
  onContinue,
  replacerId,
  replacerLabel,
  setReplacerId,
}: DocumentPrintDialogContentProps) {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  return (
    <Dialog.Content
      className="max-w-md"
      onClick={(event) => event.stopPropagation()}
    >
      <Dialog.Header>
        <Dialog.Title>{t('print-document')}</Dialog.Title>
        <Dialog.Description>
          {t('select-replacer-description', {
            label: replacerLabel.toLowerCase(),
          })}
        </Dialog.Description>
      </Dialog.Header>

      <div className="grid gap-2">
        <span className="text-sm font-medium">{replacerLabel}</span>
        <DocumentReplacerSelect
          contentType={documentItem.contentType}
          value={replacerId}
          onValueChange={setReplacerId}
        />
      </div>

      <Dialog.Footer>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="button" disabled={!replacerId} onClick={onContinue}>
          <IconPrinter />
          {t('print')}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  );
}

export function DocumentPrintDialog({
  documentItem,
  open,
  onOpenChange,
}: {
  documentItem: IDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    replacerId,
    setReplacerId,
    printReplacerId,
    printOpen,
    setPrintOpen,
    handleOpenChange,
    handleContinue,
  } = useDocumentPrintDialog(onOpenChange);
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const replacerLabel = t(
    DOCUMENT_REPLACER_LABELS[documentItem.contentType] || 'record',
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DocumentPrintDialogContent
          documentItem={documentItem}
          onCancel={() => handleOpenChange(false)}
          onContinue={handleContinue}
          replacerId={replacerId}
          replacerLabel={replacerLabel}
          setReplacerId={setReplacerId}
        />
      </Dialog>
      {printReplacerId && (
        <PrintDocument
          items={[{ _id: printReplacerId }]}
          contentType={documentItem.contentType}
          document={{
            _id: documentItem._id,
            name: documentItem.name,
          }}
          open={printOpen}
          onOpenChange={setPrintOpen}
          trigger={null}
        />
      )}
    </>
  );
}
