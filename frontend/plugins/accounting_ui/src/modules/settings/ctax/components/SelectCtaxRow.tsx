import React, { useEffect, useState } from 'react';
import { Combobox, Command, Popover, TextOverflowTooltip } from 'erxes-ui';
import { useCtaxRows } from '../hooks/useCtaxRows';
import { useCtaxValue } from '../hooks/useCtaxValue';
import { ICtaxRow } from '../types/CtaxRow';

export const SelectCtax = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentProps<typeof Combobox.Trigger> & {
    value?: string;
    onValueChange: (value: string) => void;
    onCallback?: (row: ICtaxRow) => void;
  }
>(({ value, onValueChange, onCallback, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedCtax, setSelectedCtax] = useState<ICtaxRow | undefined>(undefined);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        <SelectCtaxValue ctaxRowId={value} ctaxRow={selectedCtax} onCallback={onCallback} />
      </Combobox.Trigger>
      <Combobox.Content>
        <SelectCtaxList
          selectedCtax={selectedCtax}
          setSelectedCtax={(ctax) => {
            setSelectedCtax(ctax);
            onValueChange(ctax._id);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
});

export const SelectCtaxList = ({
  selectedCtax,
  setSelectedCtax,
}: {
  selectedCtax: ICtaxRow | undefined;
  setSelectedCtax: (ctaxRow: ICtaxRow) => void;
}) => {
  const [searchValue, setSearchValue] = useState('');
  const { ctaxRows, totalCount, loading, error, handleFetchMore } = useCtaxRows({
    variables: {
      searchValue,
    },
  });

  return (
    <Command shouldFilter={false}>
      <Command.Input
        placeholder="Search ctax"
        value={searchValue}
        onValueChange={(value) => setSearchValue(value)}
      />
      <Command.List>
        <Combobox.Empty loading={loading} error={error} />
        {ctaxRows?.map((ctax) => (
          <Command.Item
            key={ctax._id}
            value={ctax._id}
            onSelect={() => setSelectedCtax(ctax)}
          >
            <TextOverflowTooltip value={ctax.name} />
            <Combobox.Check checked={selectedCtax?._id === ctax._id} />
          </Command.Item>
        ))}
        <Combobox.FetchMore
          totalCount={totalCount || 0}
          currentLength={ctaxRows?.length || 0}
          fetchMore={handleFetchMore}
        />
      </Command.List>
    </Command>
  );
};

export const SelectCtaxValue = ({
  ctaxRowId,
  ctaxRow,
  onCallback,
}: {
  ctaxRowId?: string;
  ctaxRow?: ICtaxRow;
  onCallback?: (row: ICtaxRow) => void;
}) => {
  const { ctaxRowDetail, loading } = useCtaxValue({
    variables: {
      id: ctaxRowId,
    },
    skip: !ctaxRowId || !!ctaxRow,
  });

  const lastCtaxRow = ctaxRow?._id ? ctaxRow : ctaxRowDetail;

  useEffect(() => {
    if (onCallback && lastCtaxRow) {
      onCallback(lastCtaxRow)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCtaxRow, loading])

  if (!lastCtaxRow?._id) {
    return (
      <Combobox.Value
        placeholder="Select Ctax"
        loading={loading}
      />
    );
  }

  return (
    <div className="inline-flex gap-2">
      <span className="text-muted-foreground">{lastCtaxRow?.number}</span>
      <Combobox.Value value={lastCtaxRow?.name} />
    </div>
  );
};
