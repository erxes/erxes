import { Button, Dialog, Input, useFilterContext, useFilterQueryState } from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import { useRemoveQueryStateByKey } from 'erxes-ui/hooks';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface NumberRangeDialogViewProps {
  readonly minKey: string;
  readonly maxKey: string;
  readonly label: string;
}

const toInputString = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return String(v);
  }
  return '';
};

export function NumberRangeDialogView({ minKey, maxKey, label }: Readonly<NumberRangeDialogViewProps>) {
  const { setDialogView, setOpenDialog, sessionKey } = useFilterContext();
  const [minQuery, setMinQuery] = useFilterQueryState<string>(minKey, sessionKey ?? '');
  const [maxQuery, setMaxQuery] = useFilterQueryState<string>(maxKey, sessionKey ?? '');
  const [minVal, setMinVal] = useState<string>('');
  const [maxVal, setMaxVal] = useState<string>('');

  useEffect(() => {
    setMinVal(toInputString(minQuery));
    setMaxVal(toInputString(maxQuery));
  }, [minQuery, maxQuery]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextMin = toInputString(minVal);
    const nextMax = toInputString(maxVal);
    setMinQuery(nextMin === '' ? null : nextMin);
    setMaxQuery(nextMax === '' ? null : nextMax);
    setDialogView('root');
    setOpenDialog(false);
  };

  return (
    <Dialog.Content>
      <form onSubmit={onSubmit}>
        <Dialog.Header>
          <Dialog.Title className="font-medium text-lg">Filter by {label}</Dialog.Title>
        </Dialog.Header>
        <div className="flex gap-3 my-4">
          <Input
            type="number"
            placeholder="Min"
            value={minVal}
            onChange={(e) => setMinVal(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxVal}
            onChange={(e) => setMaxVal(e.target.value)}
          />
        </div>
        <Dialog.Footer className="sm:space-x-3">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg">Cancel</Button>
          </Dialog.Close>
          <Button size="lg" type="submit">Apply</Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  );
}

interface NumberRangeBarItemProps {
  readonly minKey: string;
  readonly maxKey: string;
  readonly label: string;
  readonly icon: ReactNode;
}

export function NumberRangeBarItem({ minKey, maxKey, label, icon }: Readonly<NumberRangeBarItemProps>) {
  const [minQuery] = useFilterQueryState<string>(minKey);
  const [maxQuery] = useFilterQueryState<string>(maxKey);
  const { setDialogView, setOpenDialog } = useFilterContext();
  const removeQuery = useRemoveQueryStateByKey();

  const hasMin = minQuery !== null && minQuery !== undefined && minQuery !== '';
  const hasMax = maxQuery !== null && maxQuery !== undefined && maxQuery !== '';
  if (!hasMin && !hasMax) return null;

  let displayValue: string;
  if (hasMin && hasMax) {
    displayValue = `${minQuery} – ${maxQuery}`;
  } else if (hasMin) {
    displayValue = `≥ ${minQuery}`;
  } else {
    displayValue = `≤ ${maxQuery}`;
  }

  const handleClose = () => {
    removeQuery(minKey);
    removeQuery(maxKey);
  };

  return (
    <div className="rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium">
      <div className="bg-background rounded-l [&>svg]:size-4 flex items-center px-2 gap-2 w-fit">
        {icon}
        {label}
      </div>
      <Button
        variant="ghost"
        className="rounded-none bg-background focus-visible:z-10 max-w-72"
        onClick={() => {
          setDialogView(minKey);
          setOpenDialog(true);
        }}
      >
        {displayValue}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-l-none bg-background"
        onClick={handleClose}
      >
        <IconX className="size-4" />
      </Button>
    </div>
  );
}
