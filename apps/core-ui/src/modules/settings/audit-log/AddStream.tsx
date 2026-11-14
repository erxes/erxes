import { type AuditStream, AuditStreamFormat } from '@erxes/core-contract';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Label, Select, Spinner, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';

type Format = AuditStream['format'];

/** What each log service needs, so the form can suggest the address and header. */
export const STREAM_PRESETS: Record<Format, { label: string; url: string; header: string }> = {
  erxes: { label: 'HTTPS (JSON, signed)', url: 'https://', header: 'Authorization' },
  datadog: {
    label: 'Datadog',
    url: 'https://http-intake.logs.datadoghq.com/api/v2/logs',
    header: 'DD-API-KEY',
  },
  splunk: {
    label: 'Splunk HEC',
    url: 'https://splunk.example.com:8088/services/collector/event',
    header: 'Authorization',
  },
};

const STARTS = ['now', 'beginning'] as const;

const useCreateStream = (onAdded: (secret: string) => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation(
    orpc.audit.createStream.mutationOptions({
      onSuccess: ({ secret }) => {
        void client.invalidateQueries({ queryKey: orpc.audit.streams.key() });
        onAdded(secret);
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('add-failed', 'Could not add the stream'),
          description: messageOf(error),
        }),
    }),
  );
};

const ServiceSelect = ({
  value,
  onChange,
}: {
  value: Format;
  onChange: (format: Format) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const format = AuditStreamFormat.options.find((option) => option === next);

        if (format) onChange(format);
      }}
    >
      <Select.Trigger aria-label={t('service', 'Service')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {AuditStreamFormat.options.map((key) => (
          <Select.Item key={key} value={key}>
            {STREAM_PRESETS[key].label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

const StartSelect = ({
  value,
  onChange,
}: {
  value: (typeof STARTS)[number];
  onChange: (start: (typeof STARTS)[number]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const start = STARTS.find((option) => option === next);

        if (start) onChange(start);
      }}
    >
      <Select.Trigger aria-label={t('from', 'Send')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="now">{t('from-now', 'New entries from now on')}</Select.Item>
        <Select.Item value="beginning">
          {t('from-beginning', 'Everything still kept, then new entries')}
        </Select.Item>
      </Select.Content>
    </Select>
  );
};

interface AuthHeader {
  name: string;
  value: string;
}

/** The auth header's name and its secret value. */
const HeaderFields = ({
  format,
  header,
  onChange,
}: {
  format: Format;
  header: AuthHeader;
  onChange: (header: AuthHeader) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });
  const id = useId();

  const valuePlaceholder =
    format === 'splunk'
      ? 'Splunk <token>'
      : format === 'datadog'
        ? 'API key'
        : t('optional', 'optional');

  return (
    <div className="grid grid-cols-leading gap-3">
      <div className="w-40 space-y-1.5">
        <Label htmlFor={`${id}-header`}>{t('header', 'Auth header')}</Label>
        <Input
          id={`${id}-header`}
          value={header.name}
          onChange={(event) => onChange({ ...header, name: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-value`}>{t('header-value', 'Value (stored encrypted)')}</Label>
        <Input
          id={`${id}-value`}
          type="password"
          value={header.value}
          placeholder={valuePlaceholder}
          onChange={(event) => onChange({ ...header, value: event.target.value })}
        />
      </div>
    </div>
  );
};

export const AddStream = ({ onAdded }: { onAdded: (secret: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log.streams' });
  const id = useId();
  const [format, setFormat] = useState<Format>('erxes');
  const [name, setName] = useState('');
  const [url, setUrl] = useState(STREAM_PRESETS.erxes.url);
  const [header, setHeader] = useState({ name: STREAM_PRESETS.erxes.header, value: '' });
  const [from, setFrom] = useState<(typeof STARTS)[number]>('now');

  const create = useCreateStream((secret) => {
    onAdded(secret);
    setName('');
    setHeader({ ...header, value: '' });
  });

  const choose = (next: Format) => {
    setFormat(next);
    setUrl(STREAM_PRESETS[next].url);
    setHeader({ name: STREAM_PRESETS[next].header, value: '' });
  };

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t('service', 'Service')}</Label>
          <ServiceSelect value={format} onChange={choose} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-name`}>{t('name', 'Name')}</Label>
          <Input
            id={`${id}-name`}
            value={name}
            placeholder={STREAM_PRESETS[format].label}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-url`}>{t('url', 'Address')}</Label>
        <Input id={`${id}-url`} value={url} onChange={(event) => setUrl(event.target.value)} />
      </div>
      <HeaderFields format={format} header={header} onChange={setHeader} />
      <div className="space-y-1.5">
        <Label>{t('from', 'Send')}</Label>
        <StartSelect value={from} onChange={setFrom} />
      </div>
      <Button
        className="w-full"
        disabled={create.isPending || !/^https?:\/\/.+/.test(url)}
        onClick={() =>
          create.mutate({
            name: name || STREAM_PRESETS[format].label,
            url,
            format,
            from,
            ...(header.value ? { authHeader: header } : {}),
          })
        }
      >
        {create.isPending ? <Spinner size="sm" /> : t('add', 'Start streaming')}
      </Button>
    </div>
  );
};
