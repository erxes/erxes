import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { Input, Label, Textarea, ToggleGroup, useToast } from 'erxes-ui';
import { type SubmitEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSheet } from '~/components/FormSheet';
import { splitAddresses } from './BroadcastBits';
import { useBroadcastHandlers } from './broadcastQueries';

const ChannelToggle = ({
  value,
  onChange,
}: {
  value: 'email' | 'sms';
  onChange: (channel: 'email' | 'sms') => void;
}) => {
  const { t } = useTranslation('broadcasts');

  return (
    <ToggleGroup
      variant="outline"
      value={[value]}
      onValueChange={([next]) => {
        if (next === 'email' || next === 'sms') onChange(next);
      }}
      className="w-full"
    >
      <ToggleGroup.Item value="email" className="flex-1">
        {t('channel.email', 'Email')}
      </ToggleGroup.Item>
      <ToggleGroup.Item value="sms" className="flex-1">
        {t('channel.sms', 'SMS')}
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};

/** Members stop broadcasts to addresses by hand: pasted, one per line or comma. */
export const AddSuppressions = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const { toast } = useToast();
  const handlers = useBroadcastHandlers();
  const ids = { addresses: useId(), detail: useId() };
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [text, setText] = useState('');
  const [detail, setDetail] = useState('');

  const add = useMutation(
    orpc.suppressions.add.mutationOptions({
      ...handlers,
      onSuccess: async ({ added }) => {
        toast({ title: t('added', '{{count}} addresses suppressed', { count: added }) });
        setText('');
        setDetail('');
        onOpenChange(false);
        await handlers.onSuccess();
      },
    }),
  );

  const addresses = splitAddresses(text);

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!addresses.length) return;

    add.mutate({ channel, addresses: addresses.slice(0, 500), detail: detail.trim() || undefined });
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('add-suppressions', 'Add addresses')}
      description={t('add-suppressions-description', 'No broadcast goes to these addresses.')}
      onSubmit={submit}
      submitLabel={t('add-suppressions-submit', 'Suppress')}
      submitting={add.isPending}
    >
      <ChannelToggle value={channel} onChange={setChannel} />
      <div className="space-y-1.5">
        <Label htmlFor={ids.addresses}>
          {channel === 'email' ? t('emails', 'Emails') : t('phones', 'Phone numbers')}
        </Label>
        <Textarea
          id={ids.addresses}
          rows={8}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={channel === 'email' ? 'a@example.com\nb@example.com' : '+97699112233'}
        />
        <p className="text-xs text-muted-foreground">
          {t('addresses-count', '{{count}} addresses, up to 500 at once', {
            count: addresses.length,
          })}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={ids.detail}>{t('detail', 'Note')}</Label>
        <Input
          id={ids.detail}
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          placeholder={t('detail-placeholder', 'Asked by phone not to get news')}
        />
      </div>
    </FormSheet>
  );
};
