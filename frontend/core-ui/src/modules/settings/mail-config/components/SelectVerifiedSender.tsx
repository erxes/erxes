import { AddSenderDialog } from '@/settings/mail-config/components/AddSenderDialog';
import { useSenderCreation } from '@/settings/mail-config/hooks/useSenderCreation';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { IconMailCheck, IconMailPlus } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';

/**
 * Picks one of the confirmed sender addresses, and lets a new one be added
 * without leaving the form. Addresses still waiting on their confirmation link
 * are left out — they are not usable yet, so offering them here would only
 * produce failed sends.
 */
export const SelectVerifiedSender = ({
  value,
  onChange,
  placeholder = 'Select a sender',
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { singleSenders, loading } = useSenderOptions();
  const { formOpen, setFormOpen, openForm } = useSenderCreation();

  const confirmed = singleSenders.filter(
    (sender) => sender.status === 'verified',
  );

  const handleAdd = () => {
    setOpen(false);
    openForm();
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="w-full" asChild>
          <Button variant="outline" className="w-full justify-start">
            <IconMailCheck />
            {value || placeholder}
          </Button>
        </Popover.Trigger>

        <Combobox.Content className="w-full min-w-80">
          <Command>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search senders..."
            />
            <Command.List className="max-h-[300px] overflow-y-auto">
              <Combobox.Empty loading={loading} />

              {!loading && confirmed.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No confirmed senders yet.
                </div>
              )}

              {confirmed.map((sender) => (
                <Command.Item
                  key={sender.id}
                  value={sender.value}
                  onSelect={() => {
                    onChange(sender.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{sender.value}</span>
                    {sender.name && (
                      <span className="text-sm text-muted-foreground">
                        {sender.name}
                      </span>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.List>

            {!loading && (
              <>
                <Command.Separator />
                {/* Kept below a separator: adding a sender is a different kind
                    of action from picking one, and it should stay reachable
                    without scrolling past every existing sender. */}
                <div className="p-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    onClick={handleAdd}
                  >
                    <IconMailPlus />
                    Add a sender address
                  </Button>
                </div>
              </>
            )}
          </Command>
        </Combobox.Content>
      </Popover>

      <AddSenderDialog open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
};
