import { IconPrinter } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import {
  PrintDocument,
  SelectCompany,
  SelectCustomer,
  SelectMember,
  SelectProduct,
} from 'ui-modules';

import { IDocument } from '../types';

const DOCUMENT_REPLACER_LABELS: Record<string, string> = {
  'core:contact.customer': 'Customer',
  'core:contact.company': 'Company',
  'core:product': 'Product',
  'core:user': 'Team member',
  'core:broadcast': 'Customer',
};

type ReplacerValue = string | string[] | null;

const getReplacerId = (value: ReplacerValue) =>
  Array.isArray(value) ? value[0] || '' : value || '';

const DocumentReplacerSelect = ({
  contentType,
  value,
  onValueChange,
}: {
  contentType: string;
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const handleValueChange = (nextValue: ReplacerValue) =>
    onValueChange(getReplacerId(nextValue));

  switch (contentType) {
    case 'core:contact.customer':
    case 'core:broadcast':
      return (
        <SelectCustomer
          mode="single"
          value={value}
          onValueChange={handleValueChange}
        />
      );
    case 'core:contact.company':
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
};

export const hasDocumentReplacerSelect = (contentType: string) =>
  contentType in DOCUMENT_REPLACER_LABELS;

export const DocumentPrintDialog = ({
  documentItem,
  open,
  onOpenChange,
}: {
  documentItem: IDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [replacerId, setReplacerId] = useState('');
  const [printReplacerId, setPrintReplacerId] = useState('');
  const [printOpen, setPrintOpen] = useState(false);

  const replacerLabel =
    DOCUMENT_REPLACER_LABELS[documentItem.contentType] || 'Record';

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setReplacerId('');
    }
  };

  const handleContinue = () => {
    if (!replacerId) {
      return;
    }

    setPrintReplacerId(replacerId);
    setReplacerId('');
    onOpenChange(false);
    setPrintOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Dialog.Content
          className="max-w-md"
          onClick={(event) => event.stopPropagation()}
        >
          <Dialog.Header>
            <Dialog.Title>Print document</Dialog.Title>
            <Dialog.Description>
              Select a {replacerLabel.toLowerCase()} to fill this document with
              its attributes.
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!replacerId}
              onClick={handleContinue}
            >
              <IconPrinter />
              Print
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
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
};
