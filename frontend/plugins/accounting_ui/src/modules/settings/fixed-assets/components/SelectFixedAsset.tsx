import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  cn,
  Combobox,
  Command,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useFixedAssets } from '../hooks/useFixedAssets';
import { IFixedAsset } from '../types/FixedAsset';

type TSelectedFixedAsset = Pick<IFixedAsset, '_id' | 'code' | 'name'>;

interface ISelectFixedAssetContext {
  fixedAssetIds: string[];
  fixedAssets: TSelectedFixedAsset[];
  onSelect: (fixedAsset?: IFixedAsset) => void;
  setFixedAssets: (fixedAssets: TSelectedFixedAsset[]) => void;
  defaultFilter?: Record<string, string | boolean | string[]>;
  placeholder?: string;
}

const SelectFixedAssetContext =
  React.createContext<ISelectFixedAssetContext | null>(null);

const useSelectFixedAssetContext = () => {
  const context = React.useContext(SelectFixedAssetContext);

  if (!context) {
    throw new Error(
      'useSelectFixedAssetContext must be used within SelectFixedAssetProvider',
    );
  }

  return context;
};

interface SelectFixedAssetProviderProps {
  children: React.ReactNode;
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  mode?: 'single' | 'multiple';
  defaultFilter?: Record<string, string | boolean | string[]>;
  onCallback?: (fixedAsset: IFixedAsset) => void;
  placeholder?: string;
  fixedAssets?: TSelectedFixedAsset[];
}

const SelectFixedAssetProvider = ({
  children,
  value,
  onValueChange,
  mode = 'single',
  defaultFilter,
  onCallback,
  placeholder,
  fixedAssets: initialFixedAssets,
}: SelectFixedAssetProviderProps) => {
  const [fixedAssets, setFixedAssets] = useState<TSelectedFixedAsset[]>(
    initialFixedAssets || [],
  );
  const fixedAssetIds = Array.isArray(value) ? value : (value && [value]) || [];

  useEffect(() => {
    if (initialFixedAssets?.length) {
      setFixedAssets(initialFixedAssets);
    }
  }, [initialFixedAssets]);

  const onSelect = useCallback(
    (fixedAsset?: IFixedAsset) => {
      if (!fixedAsset) {
        return;
      }

      onCallback?.(fixedAsset);

      if (mode === 'single') {
        setFixedAssets([fixedAsset]);
        onValueChange?.(fixedAsset._id);
        return;
      }

      const arrayValue = Array.isArray(value) ? value : [];
      const isSelected = arrayValue.includes(fixedAsset._id);
      const nextIds = isSelected
        ? arrayValue.filter((id) => id !== fixedAsset._id)
        : [...arrayValue, fixedAsset._id];

      setFixedAssets((prevFixedAssets) => {
        const fixedAssetMap = new Map(
          prevFixedAssets.map((item) => [item._id, item]),
        );
        fixedAssetMap.set(fixedAsset._id, fixedAsset);

        return nextIds
          .map((id) => fixedAssetMap.get(id))
          .filter((item): item is TSelectedFixedAsset => item !== undefined);
      });

      onValueChange?.(nextIds);
    },
    [mode, onCallback, onValueChange, value],
  );

  const contextValue = useMemo(
    () => ({
      fixedAssetIds,
      fixedAssets,
      onSelect,
      setFixedAssets,
      defaultFilter,
      placeholder,
    }),
    [defaultFilter, fixedAssetIds, fixedAssets, onSelect, placeholder],
  );

  return (
    <SelectFixedAssetContext.Provider value={contextValue}>
      {children}
      <SelectedFixedAssetEffect />
    </SelectFixedAssetContext.Provider>
  );
};

const SelectedFixedAssetEffect = () => {
  const { fixedAssetIds, fixedAssets, setFixedAssets } =
    useSelectFixedAssetContext();
  const missingIds = fixedAssetIds.filter(
    (id) => !fixedAssets.some((fixedAsset) => fixedAsset._id === id),
  );
  const { fixedAssets: missingFixedAssets } = useFixedAssets({
    variables: { ids: missingIds },
    skip: missingIds.length === 0,
  });

  useEffect(() => {
    if (!missingFixedAssets?.length) {
      return;
    }

    const fixedAssetMap = new Map(fixedAssets.map((item) => [item._id, item]));

    for (const fixedAsset of missingFixedAssets) {
      fixedAssetMap.set(fixedAsset._id, fixedAsset);
    }

    setFixedAssets(Array.from(fixedAssetMap.values()));
  }, [fixedAssets, missingFixedAssets, setFixedAssets]);

  return null;
};

const SelectFixedAssetContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { fixedAssetIds, fixedAssets, defaultFilter } =
    useSelectFixedAssetContext();
  const {
    fixedAssets: fixedAssetsData,
    loading,
    error,
  } = useFixedAssets({
    variables: {
      ...defaultFilter,
      searchValue: debouncedSearch,
    },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        {fixedAssets.length > 0 && (
          <>
            {fixedAssets.map((fixedAsset) => (
              <SelectFixedAssetCommandItem
                key={fixedAsset._id}
                fixedAsset={fixedAsset}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        <Combobox.Empty loading={loading} error={error} />
        {!loading &&
          fixedAssetsData
            ?.filter((fixedAsset) => !fixedAssetIds.includes(fixedAsset._id))
            .map((fixedAsset) => (
              <SelectFixedAssetCommandItem
                key={fixedAsset._id}
                fixedAsset={fixedAsset}
              />
            ))}
      </Command.List>
    </Command>
  );
};

const SelectFixedAssetCommandItem = ({
  fixedAsset,
}: {
  fixedAsset: IFixedAsset;
}) => {
  const { fixedAssetIds, onSelect } = useSelectFixedAssetContext();

  return (
    <Command.Item value={fixedAsset._id} onSelect={() => onSelect(fixedAsset)}>
      <SelectFixedAssetLabel fixedAsset={fixedAsset} />
      <Combobox.Check checked={fixedAssetIds.includes(fixedAsset._id)} />
    </Command.Item>
  );
};

const SelectFixedAssetLabel = ({
  fixedAsset,
}: {
  fixedAsset: TSelectedFixedAsset;
}) => (
  <span className="truncate">
    {fixedAsset.code} - {fixedAsset.name}
  </span>
);

const SelectFixedAssetValue = ({ placeholder }: { placeholder?: string }) => {
  const { fixedAssets, placeholder: providerPlaceholder } =
    useSelectFixedAssetContext();

  if (!fixedAssets.length) {
    return (
      <span className="truncate text-muted-foreground">
        {placeholder || providerPlaceholder || 'Хөрөнгө сонгох'}
      </span>
    );
  }

  const fixedAsset = fixedAssets[0];

  return <SelectFixedAssetLabel fixedAsset={fixedAsset} />;
};

const SelectFixedAssetInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectFixedAssetProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectFixedAssetProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectFixedAssetValue />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectFixedAssetContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectFixedAssetProvider>
  );
};

const SelectFixedAssetRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectFixedAssetProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
      scope?: string;
    }
>(
  (
    {
      onValueChange,
      className,
      mode,
      value,
      placeholder,
      scope,
      defaultFilter,
      onCallback,
      fixedAssets,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    return (
      <SelectFixedAssetProvider
        mode={mode}
        value={value}
        onValueChange={(nextValue) => {
          if (mode === 'single') {
            setOpen(false);
          }
          onValueChange?.(nextValue);
        }}
        defaultFilter={defaultFilter}
        onCallback={onCallback}
        placeholder={placeholder}
        fixedAssets={fixedAssets}
      >
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Combobox.Trigger
            className={cn('w-full inline-flex', className)}
            variant="outline"
            ref={ref}
            {...props}
          >
            <SelectFixedAssetValue placeholder={placeholder} />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectFixedAssetContent />
          </Combobox.Content>
        </PopoverScoped>
      </SelectFixedAssetProvider>
    );
  },
);

const SelectFixedAssetFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectFixedAssetProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectFixedAssetProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      placeholder={placeholder}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectFixedAssetValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectFixedAssetContent />
        </Combobox.Content>
      </Popover>
    </SelectFixedAssetProvider>
  );
};

export const SelectFixedAsset = Object.assign(SelectFixedAssetRoot, {
  Provider: SelectFixedAssetProvider,
  Content: SelectFixedAssetContent,
  Item: SelectFixedAssetCommandItem,
  InlineCell: SelectFixedAssetInlineCell,
  Value: SelectFixedAssetValue,
  FormItem: SelectFixedAssetFormItem,
});
