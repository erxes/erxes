import { VerifiedSenderSendgridForm } from '@/settings/mail-config/components/VerifiedSenderSendgridForm';
import { useSenderCreation } from '@/settings/mail-config/hooks/useSenderCreation';
import {
  IEmailSender,
  useRemoveVerifiedSender,
  useSenderOptions,
} from '@/settings/mail-config/hooks/useVerifiedSenders';
import { IconMailPlus } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Combobox,
  Command,
  Popover,
  Skeleton,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import validator from 'validator';

const SenderBadge = ({ sender }: { sender: IEmailSender }) => (
  <Badge variant={sender.status === 'verified' ? 'default' : 'secondary'}>
    {sender.value}
    {sender.status !== 'verified' && (
      <span className="ml-1 opacity-70">({sender.status})</span>
    )}
  </Badge>
);

/**
 * Sender identities for the organization's configured email provider. Rendered
 * both in mail settings and in broadcast settings, so it reads the provider
 * itself rather than being told which one is active.
 */
export const VerifiedSenders = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { confirm } = useConfirm();
  const {
    supportsSenderVerification,
    singleSenders: senders,
    loading,
  } = useSenderOptions();
  const { removeVerifiedSender } = useRemoveVerifiedSender();
  const {
    needsForm,
    addByEmail,
    sendgridFormOpen,
    setSendgridFormOpen,
    openSendgridForm: startSendgridForm,
  } = useSenderCreation();

  // A plain SMTP relay accepts whatever the server allows, so there is no
  // sender list to show or manage.
  if (!supportsSenderVerification) {
    return null;
  }

  const handleAddSes = (email: string) =>
    addByEmail(email, () => {
      setSearch('');
      setOpen(false);
    });

  const handleRemove = (email: string) => {
    confirm({
      message: `Are you sure you want to remove this sender?`,
    }).then(() => removeVerifiedSender(email));
  };

  const openSendgridForm = () => {
    setOpen(false);
    startSendgridForm();
  };

  /**
   * Kept out of the list and below a separator: adding a sender is a different
   * kind of action from removing one, and the two must not look alike.
   */
  const renderAddAction = () => {
    if (needsForm) {
      return (
        <Button
          variant="ghost"
          className="w-full justify-start font-normal"
          onClick={openSendgridForm}
        >
          <IconMailPlus />
          Verify a new sender
        </Button>
      );
    }

    const isValid = validator.isEmail(search);

    if (!search || senders.some((sender) => sender.value === search)) {
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
        onClick={() => handleAddSes(search)}
      >
        <IconMailPlus />
        Verify "{search}"
      </Button>
    );
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button variant="outline" className="w-full" size="lg">
            <div className="w-full flex gap-2 justify-start items-center overflow-x-auto hide-scroll">
              {loading ? (
                <>
                  <Skeleton className="w-2/3 h-6 bg-primary/10" />
                  <Skeleton className="w-32 h-6 bg-primary/10" />
                </>
              ) : senders.length ? (
                senders.map((sender) => (
                  <SenderBadge key={sender.id} sender={sender} />
                ))
              ) : (
                <span className="text-muted-foreground font-medium">
                  No senders yet
                </span>
              )}
            </div>
          </Button>
        </Popover.Trigger>

        <Combobox.Content className="p-0 min-w-[312px]" align="start">
          <Command>
            <Command.Input
              placeholder={needsForm ? 'Search senders' : 'Search or add email'}
              value={search}
              onValueChange={setSearch}
            />
            <Command.List>
              {loading ? (
                <Command.Empty className="p-1">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="w-2/3 h-7" />
                    <Skeleton className="w-full h-7" />
                    <Skeleton className="w-32 h-7" />
                  </div>
                </Command.Empty>
              ) : (
                <Command.Empty className="py-5 px-3 text-center">
                  No senders found.
                </Command.Empty>
              )}

              {senders.map((sender) => (
                <Command.Item
                  key={sender.id}
                  value={sender.value}
                  onSelect={() => handleRemove(sender.value)}
                >
                  <span className="flex-1">{sender.value}</span>
                  {sender.status !== 'verified' && (
                    <span className="text-muted-foreground text-xs">
                      {sender.status}
                    </span>
                  )}
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
