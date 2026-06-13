import { Button, Dialog, Input, Label, RecordTable } from 'erxes-ui';

import { IconArrowsSplit } from '@tabler/icons-react';
import { useSplitDeal } from '../hooks/useSplitDeal';
import { useState } from 'react';

/**
 * Command-bar action: split the selected product lines out of this deal into a
 * brand new deal. The selected products are moved (removed from this deal) into
 * the new one.
 */
export const ProductsSplit = ({
  productIds,
  refetch,
  dealId,
}: {
  productIds: string[];
  refetch: () => void;
  dealId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const { table } = RecordTable.useRecordTable();

  const { splitDeal, loading } = useSplitDeal({
    onCompleted: () => {
      refetch();
      table.resetRowSelection();
    },
  });

  /** Fire the split mutation and reset the dialog on success. */
  const handleSplit = () => {
    splitDeal({
      variables: {
        dealId,
        splits: [{ name: name.trim() || undefined, productIds }],
      },
    }).then(() => {
      setOpen(false);
      setName('');
    });
  };

  const count = productIds.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="secondary">
          <IconArrowsSplit />
          Split
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.Header>
          <Dialog.Title>Split into a new deal</Dialog.Title>
          <Dialog.Description>
            Move the {count} selected product{count === 1 ? '' : 's'} into a new
            deal. They will be removed from this deal.
          </Dialog.Description>
        </Dialog.Header>

        <div className="space-y-1">
          <Label htmlFor="split-name">New deal name</Label>
          <Input
            id="split-name"
            placeholder="Optional — defaults to “… (split)”"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSplit()}
          />
        </div>

        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button onClick={handleSplit} disabled={loading || count === 0}>
            Split
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
