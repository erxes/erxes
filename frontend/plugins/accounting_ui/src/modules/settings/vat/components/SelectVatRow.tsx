import React, { useEffect, useState } from 'react';
import { Combobox, Command, Popover, TextOverflowTooltip } from 'erxes-ui';
import { useVatRows } from '../hooks/useVatRows';
import { useVatValue } from '../hooks/useVatValue';
import { IVatRow } from '../types/VatRow';

export const SelectVat = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentProps<typeof Combobox.Trigger> & {
    value?: string;
    onValueChange: (value: string) => void;
    onCallback?: (row: IVatRow) => void;
  }
>(({ value, onValueChange, onCallback, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedVat, setSelectedVat] = useState<IVatRow | undefined>(undefined);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        <SelectVatValue vatRowId={value} vatRow={selectedVat} onCallback={onCallback} />
      </Combobox.Trigger>
      <Combobox.Content>
        <SelectVatList
          selectedVat={selectedVat}
          setSelectedVat={(vat) => {
            setSelectedVat(vat);
            onValueChange(vat._id);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
});

export const SelectVatList = ({
  selectedVat,
  setSelectedVat,
}: {
  selectedVat: IVatRow | undefined;
  setSelectedVat: (vatRow: IVatRow) => void;
}) => {
  const [searchValue, setSearchValue] = useState('');
  const { vatRows, totalCount, loading, error, handleFetchMore } = useVatRows({
    variables: {
      searchValue,
    },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        placeholder="Search vat"
        value={searchValue}
        onValueChange={(value) => setSearchValue(value)}
      />
      <Command.List>
        <Combobox.Empty loading={loading} error={error} />
        {vatRows?.map((vat) => (
          <Command.Item
            key={vat._id}
            value={vat._id}
            onSelect={() => setSelectedVat(vat)}
          >
            <TextOverflowTooltip value={vat.name} />
            <Combobox.Check checked={selectedVat?._id === vat._id} />
          </Command.Item>
        ))}
        <Combobox.FetchMore
          totalCount={totalCount || 0}
          currentLength={vatRows?.length || 0}
          fetchMore={handleFetchMore}
        />
      </Command.List>
    </Command>
  );
};

export const SelectVatValue = ({
  vatRowId,
  vatRow,
  onCallback,
}: {
  vatRowId?: string;
  vatRow?: IVatRow;
  onCallback?: (row: IVatRow) => void;
}) => {
  const { vatRowDetail, loading } = useVatValue({
    variables: {
      id: vatRowId,
    },
    skip: !vatRowId || !!vatRow,
  });

  const lastVatRow = vatRow?._id ? vatRow : vatRowDetail;

  useEffect(() => {
    if (onCallback && lastVatRow) {
      onCallback(lastVatRow)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastVatRow, loading])

  if (!lastVatRow?._id) {
    return (
      <Combobox.Value
        placeholder="Select Vat"
        loading={loading}
      />
    );
  }

  return (
    <div className="inline-flex gap-2">
      <span className="text-muted-foreground">{lastVatRow?.number}</span>
      <Combobox.Value value={lastVatRow?.name} />
    </div>
  );
};
