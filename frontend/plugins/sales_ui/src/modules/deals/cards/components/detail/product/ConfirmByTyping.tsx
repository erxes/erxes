import { Button, Dialog, Input, Label } from 'erxes-ui';
import { ReactNode, useState } from 'react';

/**
 * Wraps a trigger in a dialog that only lets the action through once the user
 * types a confirmation keyword (e.g. "merge" / "split"). Used to gate the
 * irreversible merge & split actions.
 */
export const ConfirmByTyping = ({
  keyword,
  title,
  description,
  confirmLabel,
  loading,
  onConfirm,
  children,
}: {
  keyword: string;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const matches = value.trim().toLowerCase() === keyword.toLowerCase();

  const confirm = () => {
    if (!matches || loading) return;
    onConfirm();
    setOpen(false);
    setValue('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setValue('');
      }}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
        </Dialog.Header>

        <div className="space-y-1">
          <Label htmlFor="confirm-by-typing">
            Type <span className="font-semibold lowercase">{keyword}</span> to
            confirm
          </Label>
          <Input
            id="confirm-by-typing"
            value={value}
            placeholder={keyword}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirm()}
          />
        </div>

        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button disabled={!matches || loading} onClick={confirm}>
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
