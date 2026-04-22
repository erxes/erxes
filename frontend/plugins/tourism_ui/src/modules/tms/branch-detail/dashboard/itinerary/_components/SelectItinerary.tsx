import { useQuery } from '@apollo/client';
import { Combobox, Command, Form, Popover, cn } from 'erxes-ui';
import React, { useCallback, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { SelectItineraryContext } from '../contexts/SelectItineraryContext';
import { GET_ITINERARY_DETAIL } from '../graphql/queries';
import { useItinerariesForSelect } from '../hooks/useItinerariesForSelect';
import { useSelectItineraryContext } from '../hooks/useSelectItineraryContext';
import { IItinerary } from '../types/itinerary';

// ─── Provider ────────────────────────────────────────────────────────────────

interface SelectItineraryProviderProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string | null) => void;
  branchId?: string;
  language?: string;
}

const SelectItineraryProvider = ({
  children,
  value,
  onValueChange,
  branchId,
  language,
}: SelectItineraryProviderProps) => {
  const [selectedItinerary, setSelectedItinerary] = useState<IItinerary | null>(
    null,
  );

  const { data } = useQuery(GET_ITINERARY_DETAIL, {
    variables: { id: value, language },
    skip: !value,
    fetchPolicy: 'cache-first',
  });

  const resolvedItinerary: IItinerary | null =
    selectedItinerary || data?.bmsItineraryDetail || null;

  const onSelect = useCallback(
    (itinerary: IItinerary) => {
      setSelectedItinerary(itinerary);
      onValueChange?.(itinerary._id);
    },
    [onValueChange],
  );

  return (
    <SelectItineraryContext.Provider
      value={{
        itineraryId: value,
        onSelect,
        selectedItinerary: resolvedItinerary,
        branchId,
        language,
      }}
    >
      {children}
    </SelectItineraryContext.Provider>
  );
};

// ─── Item label ──────────────────────────────────────────────────────────────

const ItineraryItemLabel = ({ itinerary }: { itinerary: IItinerary }) => (
  <div className="flex items-center flex-1 min-w-0 gap-2">
    <span className="truncate">{itinerary.name}</span>
    {itinerary.duration && (
      <span className="text-xs text-muted-foreground shrink-0">
        ({itinerary.duration} days)
      </span>
    )}
  </div>
);

// ─── Command item ─────────────────────────────────────────────────────────────

const SelectItineraryCommandItem = ({
  itinerary,
}: {
  itinerary: IItinerary;
}) => {
  const { onSelect, itineraryId } = useSelectItineraryContext();
  return (
    <Command.Item value={itinerary._id} onSelect={() => onSelect(itinerary)}>
      <ItineraryItemLabel itinerary={itinerary} />
      <Combobox.Check checked={itineraryId === itinerary._id} />
    </Command.Item>
  );
};

// ─── Content ─────────────────────────────────────────────────────────────────

const SelectItineraryContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const { itineraryId, selectedItinerary, branchId, language } =
    useSelectItineraryContext();

  const { itineraries, isInitialLoading, totalCount, handleFetchMore } =
    useItinerariesForSelect({
      branchId,
      language,
      search: debouncedSearch || undefined,
    });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
        placeholder="Search itineraries..."
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        {!isInitialLoading && selectedItinerary && (
          <>
            <SelectItineraryCommandItem itinerary={selectedItinerary} />
            <Command.Separator className="my-1" />
          </>
        )}
        <Combobox.Empty loading={isInitialLoading} />
        {!isInitialLoading &&
          itineraries
            .filter((it) => it._id !== itineraryId)
            .map((itinerary) => (
              <SelectItineraryCommandItem
                key={itinerary._id}
                itinerary={itinerary}
              />
            ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={itineraries.length}
          totalCount={totalCount}
        />
      </Command.List>
    </Command>
  );
};

// ─── Value display ────────────────────────────────────────────────────────────

const SelectItineraryValue = ({ placeholder }: { placeholder?: string }) => {
  const { selectedItinerary } = useSelectItineraryContext();

  if (!selectedItinerary) {
    return (
      <span className="text-muted-foreground">
        {placeholder || 'Select itinerary'}
      </span>
    );
  }

  return (
    <div className="flex items-center w-full min-w-0 gap-2">
      <span className="truncate">{selectedItinerary.name}</span>
      {selectedItinerary.duration && (
        <span className="text-xs text-muted-foreground shrink-0">
          ({selectedItinerary.duration} days)
        </span>
      )}
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────

const SelectItineraryRoot = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<SelectItineraryProviderProps, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectItineraryProvider
      onValueChange={(value) => {
        setOpen(false);
        onValueChange?.(value);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
          <SelectItinerary.Value placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectItinerary.Content />
        </Combobox.Content>
      </Popover>
    </SelectItineraryProvider>
  );
};

// ─── FormItem ─────────────────────────────────────────────────────────────────

const SelectItineraryFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<SelectItineraryProviderProps, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectItineraryProvider
      onValueChange={(value) => {
        setOpen(false);
        onValueChange?.(value);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectItinerary.Value placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectItinerary.Content />
        </Combobox.Content>
      </Popover>
    </SelectItineraryProvider>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const SelectItinerary = Object.assign(SelectItineraryRoot, {
  Provider: SelectItineraryProvider,
  Content: SelectItineraryContent,
  Item: SelectItineraryCommandItem,
  Value: SelectItineraryValue,
  FormItem: SelectItineraryFormItem,
});
