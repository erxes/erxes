import { useTranslation } from 'react-i18next';
import { AddSenderDialog } from '@/settings/mail-config/components/AddSenderDialog';
import { useSenderCreation } from '@/settings/mail-config/hooks/useSenderCreation';
import {
  IEmailSender,
  useSenderOptions,
} from '@/settings/mail-config/hooks/useVerifiedSenders';
import { IconMailCheck, IconMailPlus, IconRefresh } from '@tabler/icons-react';
import { Button, Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';

export const SelectVerifiedSender = ({
  value,
  onChange,
  placeholder = 'Select a sender',
}: {
  value?: string;
  onChange: (value: string, sender?: IEmailSender) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('settings', { keyPrefix: 'mail-config' });
  const [search, setSearch] = useState('');

  const { singleSenders, loading, refetch } = useSenderOptions();
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
          <Button variant="outline" className="h-8 w-full justify-start">
            <IconMailCheck />
            {value || placeholder}
          </Button>
        </Popover.Trigger>

        <Combobox.Content className="w-full min-w-80">
          <Command>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={t('search-senders-ellipsis')}
            />
            <Command.List className="max-h-[300px] overflow-y-auto">
              <Combobox.Empty loading={loading} />

              {!loading && confirmed.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {t('no-confirmed-senders')}
                </div>
              )}

              {confirmed.map((sender) => (
                <Command.Item
                  key={sender.id}
                  value={sender.value}
                  onSelect={() => {
                    onChange(sender.value, sender);
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
                <div className="p-1 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    onClick={handleAdd}
                  >
                    <IconMailPlus />
                    {t('add-sender-address')}
                  </Button>
                  <Button variant="ghost" onClick={refetch}>
                    <IconRefresh />
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
