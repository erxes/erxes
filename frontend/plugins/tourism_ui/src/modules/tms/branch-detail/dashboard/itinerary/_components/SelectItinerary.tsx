import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, Popover, cn } from 'erxes-ui';

import { IItinerary } from '../types/itinerary';
import { useItineraries } from '../hooks/useItineraries';
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';

interface SelectItineraryProps {
  value?: string;
  onValueChange?: (value: string | null) => void;
  branchId?: string;
  placeholder?: string;
  className?: string;
}

export const SelectItinerary = ({
  value,
  onValueChange,
  branchId,
  placeholder = 'Select itinerary',
  className,
}: SelectItineraryProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const { itineraries, loading } = useItineraries({
    variables: { branchId },
  });

  const filteredItineraries = React.useMemo(() => {
    if (!debouncedSearch) return itineraries || [];
    return (itineraries || []).filter((itinerary: IItinerary) =>
      itinerary.name?.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [itineraries, debouncedSearch]);

  const selectedItinerary = React.useMemo(
    () => itineraries?.find((it: IItinerary) => it._id === value),
    [itineraries, value],
  );

  const handleSelect = (itinerary: IItinerary) => {
    onValueChange?.(itinerary._id);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
        {selectedItinerary ? (
          <div className="flex gap-2 items-center">
            <span>{selectedItinerary.name}</span>
            {selectedItinerary.duration && (
              <span className="text-xs text-muted-foreground">
                ({selectedItinerary.duration} days)
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </Combobox.Trigger>

      <Combobox.Content className="p-0 w-full">
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
            <Combobox.Empty loading={loading} />
            {!loading &&
              filteredItineraries.map((itinerary: IItinerary) => (
                <Command.Item
                  key={itinerary._id}
                  value={itinerary._id}
                  onSelect={() => handleSelect(itinerary)}
                >
                  <div className="flex gap-2 items-center">
                    <span>{itinerary.name}</span>
                    {itinerary.duration && (
                      <span className="text-xs text-muted-foreground">
                        ({itinerary.duration} days)
                      </span>
                    )}
                  </div>
                  {value === itinerary._id && (
                    <IconCheck className="ml-auto" size={16} />
                  )}
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
