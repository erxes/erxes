import { IconPrinter } from '@tabler/icons-react';
import { Button, Combobox, Command, Dialog, Popover, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useGlobalSearch } from '@/search/hooks/useGlobalSearch';
import {
  PrintDocument,
  SelectCompany,
  SelectCustomer,
  SelectMember,
  SelectProduct,
} from 'ui-modules';

import { IDocument } from '../types';
import { DocumentSalesSelect } from './DocumentSalesSelect';

const DOCUMENT_REPLACER_LABELS: Record<string, string> = {
  'core:contact.customer': 'Customer',
  'core:contact.company': 'Company',
  'core:product': 'Product',
  'core:user': 'Team member',
  'core:broadcast': 'Customer',
  'operation:task': 'Task',
  'sales:deal': 'Deal',
};

type ReplacerValue = string | string[] | null;

function getReplacerId(value: ReplacerValue) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

/** Select a task through the plugin's existing search provider and pagination. */
function DocumentTaskSelect({
  value,
  onValueChange,
}: Readonly<{
  value: string;
  onValueChange: (value: string) => void;
}>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [label, setLabel] = useState('');
  const [query] = useDebounce(search.trim(), 300);
  const { groups, loading, hasFailure, refetch, loadMore } = useGlobalSearch(
    query.length >= 2 ? `Tasks ${query}` : '',
    'newest',
  );
  const tasks = groups.find((group) => group.key === 'operation-tasks');
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {value ? label || value : 'Select a task'}
        </Button>
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search tasks..."
          />
          <Command.List>
            {loading && <Spinner />}
            {hasFailure && (
              <div role="alert" className="p-2 text-sm text-destructive">
                Could not load tasks.{' '}
                <Button
                  variant="link"
                  onClick={async () => {
                    try {
                      await refetch();
                    } catch {
                      return;
                    }
                  }}
                >
                  Retry
                </Button>
              </div>
            )}
            {!loading && !hasFailure && (
              <Command.Empty>
                {query.length < 2
                  ? 'Type at least two characters to find a task.'
                  : 'No tasks found.'}
              </Command.Empty>
            )}
            {tasks?.items.map((task) => (
              <Command.Item
                key={task.id}
                value={task.id}
                onSelect={() => {
                  setLabel(task.title);
                  onValueChange(task.id);
                  setOpen(false);
                }}
              >
                {task.title}
              </Command.Item>
            ))}
            {tasks?.pageInfo.hasNextPage && (
              <Button
                variant="ghost"
                disabled={tasks.loadingMore}
                onClick={() => loadMore(tasks.key)}
              >
                Load more
              </Button>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
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
    case 'sales:deal':
      return (
        <DocumentSalesSelect value={value} onValueChange={onValueChange} />
      );
    case 'operation:task':
      return <DocumentTaskSelect value={value} onValueChange={onValueChange} />;
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
}

export function hasDocumentReplacerSelect(contentType: string) {
  return contentType in DOCUMENT_REPLACER_LABELS;
}

type DocumentPrintDialogContentProps = {
  documentItem: Pick<IDocument, 'contentType'>;
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
  return (
    <Dialog.Content
      className="max-w-md"
      onClick={(event) => event.stopPropagation()}
    >
      <Dialog.Header>
        <Dialog.Title>Print document</Dialog.Title>
        <Dialog.Description>
          Select a {replacerLabel.toLowerCase()} to fill this document with its
          attributes.
        </Dialog.Description>
      </Dialog.Header>

      <div className="grid gap-2">
        {documentItem.contentType !== 'sales:deal' && (
          <span className="text-sm font-medium">{replacerLabel}</span>
        )}
        <DocumentReplacerSelect
          contentType={documentItem.contentType}
          value={replacerId}
          onValueChange={setReplacerId}
        />
      </div>

      <Dialog.Footer>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" disabled={!replacerId} onClick={onContinue}>
          <IconPrinter />
          Print
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
  documentItem: Pick<IDocument, 'contentType' | 'name'> & { _id?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [replacerId, setReplacerId] = useState('');
  const [printReplacerId, setPrintReplacerId] = useState('');
  const [printOpen, setPrintOpen] = useState(false);

  const replacerLabel =
    DOCUMENT_REPLACER_LABELS[documentItem.contentType] || 'Record';

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setReplacerId('');
    }
  }

  function handleContinue() {
    if (!replacerId) {
      return;
    }

    setPrintReplacerId(replacerId);
    setReplacerId('');
    onOpenChange(false);
    setPrintOpen(true);
  }

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
          document={
            documentItem._id
              ? { _id: documentItem._id, name: documentItem.name }
              : undefined
          }
          open={printOpen}
          onOpenChange={setPrintOpen}
          trigger={null}
        />
      )}
    </>
  );
}
