import { IconLabel } from '@tabler/icons-react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  RecordTableCellContent,
  RecordTableCellTrigger,
  RecordTablePopover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';
import { DocumentsInline } from 'ui-modules/modules/documents/components/DocumentsInline';
import { useDebounce } from 'use-debounce';
import {
  SelectDocumentContext,
  useSelectDocumentContext,
} from '../contexts/SelectDocumentContext';
import { useDocuments } from '../hooks/useDocuments';

export const SelectDocumentProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  documents,
  contentType,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange: (value: string[] | string, meta: any) => void;
  documents?: any[];
  contentType?: string;
}) => {
  const [_documents, setDocuments] = useState<any[]>(documents || []);
  const isSingleMode = mode === 'single';

  const onSelect = (document: any) => {
    if (!document) return;
    if (isSingleMode) {
      setDocuments([document]);
      return onValueChange?.(document._id, document);
    }

    const arrayValue = Array.isArray(value) ? value : [];

    const isDocumentSelected = arrayValue.includes(document._id);
    const newSelectedDocumentIds = isDocumentSelected
      ? arrayValue.filter((id) => id !== document._id)
      : [...arrayValue, document._id];

    setDocuments((prev) =>
      [...prev, document].filter((b) => newSelectedDocumentIds.includes(b._id)),
    );
    onValueChange?.(newSelectedDocumentIds, document);
  };

  return (
    <SelectDocumentContext.Provider
      value={{
        documents: _documents,
        documentIds: !value ? [] : Array.isArray(value) ? value : [value],
        contentType,
        onSelect,
        setDocuments,
        loading: false,
        error: null,
      }}
    >
      {children}
    </SelectDocumentContext.Provider>
  );
};

const SelectDocumentValue = ({ placeholder }: { placeholder?: string }) => {
  const { documentIds, documents, setDocuments } = useSelectDocumentContext();

  return (
    <DocumentsInline
      documentIds={documentIds}
      documents={documents}
      updateDocuments={setDocuments}
      placeholder={placeholder}
    />
  );
};

const SelectDocumentCommandItem = ({ document }: { document: any }) => {
  const { onSelect, documentIds } = useSelectDocumentContext();

  return (
    <Command.Item
      value={document._id}
      onSelect={() => {
        onSelect(document);
      }}
    >
      <DocumentsInline documents={[document]} placeholder="Unnamed user" />
      <Combobox.Check checked={documentIds.includes(document._id)} />
    </Command.Item>
  );
};

const SelectDocumentContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { documents: selectedDocuments, contentType } =
    useSelectDocumentContext();

  const {
    documents = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useDocuments({
    variables: {
      searchValue: debouncedSearch,
      contentType,
    },
  });

  return (
    <Command shouldFilter={false} id="document-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search document..."
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {selectedDocuments.length > 0 && (
          <>
            {selectedDocuments?.map((document) => (
              <SelectDocumentCommandItem
                key={document._id}
                document={document}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {documents
          .filter(
            (document) =>
              !selectedDocuments.some((d) => d._id === document._id),
          )
          .map((document) => (
            <SelectDocumentCommandItem key={document._id} document={document} />
          ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          totalCount={totalCount}
          currentLength={documents.length}
        />
      </Command.List>
    </Command>
  );
};

export const SelectDocumentFilterItem = () => {
  return (
    <Filter.Item value="document">
      <IconLabel />
      Document
    </Filter.Item>
  );
};

export const SelectDocumentFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
  contentType,
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  contentType: string;
}) => {
  const [document, setDocument] = useQueryState<string[] | string>(
    queryKey || 'document',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'document'}>
      <SelectDocumentProvider
        mode={mode}
        value={document || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setDocument(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
        contentType={contentType}
      >
        <SelectDocumentContent />
      </SelectDocumentProvider>
    </Filter.View>
  );
};

export const SelectDocumentFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
  contentType,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  contentType: string;
}) => {
  const [document, setDocument] = useQueryState<string[] | string>(
    queryKey || 'document',
  );
  const [open, setOpen] = useState(false);

  if (!document) {
    return null;
  }

  return (
    <Filter.BarItem>
      <Filter.BarName>
        <IconLabel />
        {!iconOnly && 'Document'}
      </Filter.BarName>
      <SelectDocumentProvider
        mode={mode}
        value={document || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setDocument(value as string[] | string);
          } else {
            setDocument(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
        contentType={contentType}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'document'}>
              <SelectDocumentValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectDocumentContent />
          </Combobox.Content>
        </Popover>
      </SelectDocumentProvider>
      <Filter.BarClose filterKey={queryKey || 'document'} />
    </Filter.BarItem>
  );
};

export const SelectDocumentInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectDocumentProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectDocumentProvider
      onValueChange={(value, meta) => {
        onValueChange?.(value, meta);
        setOpen(false);
      }}
      {...props}
    >
      <RecordTablePopover open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableCellTrigger>
          <SelectDocumentValue placeholder={''} />
        </RecordTableCellTrigger>
        <RecordTableCellContent>
          <SelectDocumentContent />
        </RecordTableCellContent>
      </RecordTablePopover>
    </SelectDocumentProvider>
  );
};

export const SelectDocumentFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectDocumentProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectDocumentProvider
      onValueChange={(value, meta) => {
        onValueChange?.(value, meta);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectDocumentValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectDocumentContent />
        </Combobox.Content>
      </Popover>
    </SelectDocumentProvider>
  );
};

SelectDocumentFormItem.displayName = 'SelectDocumentFormItem';

const SelectDocumentRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectDocumentProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(
  (
    {
      onValueChange,
      className,
      mode,
      value,
      placeholder,
      contentType,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectDocumentProvider
        onValueChange={(value, meta) => {
          onValueChange?.(value, meta);
          setOpen(false);
        }}
        mode={mode}
        value={value}
        contentType={contentType}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger
            ref={ref}
            className={cn('w-full inline-flex', className)}
            variant="outline"
            {...props}
          >
            <SelectDocumentValue placeholder={placeholder} />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectDocumentContent />
          </Combobox.Content>
        </Popover>
      </SelectDocumentProvider>
    );
  },
);

SelectDocumentRoot.displayName = 'SelectDocumentRoot';

export const SelectDocument = Object.assign(SelectDocumentRoot, {
  Provider: SelectDocumentProvider,
  Value: SelectDocumentValue,
  Content: SelectDocumentContent,
  FilterItem: SelectDocumentFilterItem,
  FilterView: SelectDocumentFilterView,
  FilterBar: SelectDocumentFilterBar,
  InlineCell: SelectDocumentInlineCell,
  FormItem: SelectDocumentFormItem,
});
