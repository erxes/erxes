import { VerifiedSenderSendgridForm } from '@/settings/mail-config/components/VerifiedSenderSendgridForm';
import { useSenderCreation } from '@/settings/mail-config/hooks/useSenderCreation';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { IconMailCheck, IconMailPlus } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import validator from 'validator';

/**
 * Picks one of the provider's verified sender addresses, and lets a new one be
 * verified without leaving the form. Senders still waiting on their
 * confirmation link are left out — the provider rejects mail from them, so
 * offering them here would only produce failed sends.
 */
export const SelectVerifiedSender = ({
  value,
  onChange,
  placeholder = 'Select a verified sender',
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { singleSenders, loading } = useSenderOptions();
  const {
    needsForm,
    addByEmail,
    sendgridFormOpen,
    setSendgridFormOpen,
    openSendgridForm,
  } = useSenderCreation();

  const verified = singleSenders.filter(
    (sender) => sender.status === 'verified',
  );

  const startSendgridForm = () => {
    setOpen(false);
    openSendgridForm();
  };

  /**
   * Kept out of the list and below a separator: adding a sender is a different
   * kind of action from picking one, and it should stay reachable without
   * scrolling past every existing sender.
   */
  const renderAddAction = () => {
    if (needsForm) {
      return (
        <Button
          variant="ghost"
          className="w-full justify-start font-normal"
          onClick={startSendgridForm}
        >
          <IconMailPlus />
          Verify a new sender
        </Button>
      );
    }

    const isValid = validator.isEmail(search);

    if (!search || verified.some((sender) => sender.value === search)) {
      return (
        <p className="px-2 py-1.5 text-sm text-muted-foreground">
          Type an email above to verify a new sender.
        </p>
      );
    }

    return (
      <Button
        variant="ghost"
        className="w-full justify-start font-normal"
        disabled={!isValid}
        onClick={() => addByEmail(search, () => setSearch(''))}
      >
        <IconMailPlus />
        Verify "{search}"
      </Button>
    );
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
              placeholder={
                needsForm ? 'Search senders...' : 'Search or add email...'
              }
            />
            <Command.List className="max-h-[300px] overflow-y-auto">
              <Combobox.Empty loading={loading} />

              {!loading && verified.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No verified senders yet.
                </div>
              )}

              {verified.map((sender) => (
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
                <div className="p-1">{renderAddAction()}</div>
              </>
            )}
          </Command>
        </Combobox.Content>
      </Popover>

      {needsForm && (
        <VerifiedSenderSendgridForm
          open={sendgridFormOpen}
          onOpenChange={setSendgridFormOpen}
        />
      )}
    </>
  );
};
