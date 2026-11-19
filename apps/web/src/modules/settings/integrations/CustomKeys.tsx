import type { Integration as CustomRecord } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconKey } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Button, Empty, Input, Label, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntegrationsSaved } from './customMutation';
import { FormSection } from './FormSection';

const NAME = /^[A-Za-z][A-Za-z0-9_]{0,59}$/;

const KeyForm = ({
  record,
  name,
  onName,
}: {
  record: CustomRecord;
  name: string;
  onName: (name: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { toast } = useToast();
  const nameId = useId();
  const valueId = useId();
  const [value, setValue] = useState('');
  const replacing = record.sealedNames.includes(name);

  const save = useMutation(
    orpc.integrations.setSecrets.mutationOptions(
      useIntegrationsSaved(t('key-failed', 'Could not save the key'), () => {
        setValue('');
        onName('');
        toast({ title: t('key-saved', 'Key saved. It is not shown again.') });
      }),
    ),
  );

  const nameValid = NAME.test(name);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (nameValid && value) save.mutate({ id: record.id, secrets: { [name]: value } });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={nameId}>{t('key-name', 'Name')}</Label>
          <Input
            id={nameId}
            value={name}
            placeholder="api_key"
            onChange={(event) => onName(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={valueId}>{t('key-value', 'Value')}</Label>
          <Input
            id={valueId}
            type="password"
            autoComplete="new-password"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
      </div>
      {name && !nameValid ? (
        <p className="text-xs text-destructive-text">
          {t('key-name-invalid', 'Letters, digits and _, starting with a letter.')}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t('key-use', 'Programs use it as {{token}}.', {
            token: `{{secret.${name || 'name'}}}`,
          })}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={!nameValid || !value || save.isPending}>
          {save.isPending ? (
            <Spinner size="sm" />
          ) : replacing ? (
            t('key-replace', 'Replace key')
          ) : (
            t('key-add', 'Add key')
          )}
        </Button>
      </div>
    </form>
  );
};

const KeyRow = ({
  record,
  name,
  onReplace,
}: {
  record: CustomRecord;
  name: string;
  onReplace: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const remove = useMutation(
    orpc.integrations.setSecrets.mutationOptions(
      useIntegrationsSaved(t('key-failed', 'Could not save the key'), () =>
        toast({ title: t('key-removed', 'Key removed') }),
      ),
    ),
  );

  return (
    <li className="flex items-center gap-3 p-3">
      <IconKey className="size-4 shrink-0 text-muted-foreground" />
      <code className="min-w-0 flex-1 truncate font-mono text-sm">{name}</code>
      <Button variant="ghost" size="sm" onClick={onReplace}>
        {t('key-replace-short', 'Replace')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={remove.isPending}
        onClick={() =>
          void confirm({
            message: t('key-remove-confirm', 'Remove the key {{name}}?', { name }),
            options: {
              description: t('key-remove-description', 'Programs that use it will fail.'),
            },
          }).then(() => remove.mutate({ id: record.id, secrets: { [name]: null } }))
        }
      >
        {remove.isPending ? <Spinner size="sm" /> : t('key-remove', 'Remove')}
      </Button>
    </li>
  );
};

export const CustomKeys = ({ record }: { record: CustomRecord }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const [name, setName] = useState('');

  return (
    <div className="space-y-6">
      <p className="rounded-lg border p-4 text-sm">
        {t(
          'keys-intro',
          'Keys are sent only to {{hosts}}. Once saved, a key is never shown again, not even to you.',
          { hosts: record.hosts.join(', ') },
        )}
      </p>
      <FormSection
        title={t('keys-saved', 'Saved keys')}
        description={t('keys-saved-description', 'Replace one to change its value.')}
      >
        {record.sealedNames.length ? (
          <ul className="divide-y rounded-lg border">
            {record.sealedNames.map((sealed) => (
              <KeyRow
                key={sealed}
                record={record}
                name={sealed}
                onReplace={() => setName(sealed)}
              />
            ))}
          </ul>
        ) : (
          <Empty variant="outline">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconKey />
              </Empty.Media>
              <Empty.Title>{t('keys-empty', 'No keys yet')}</Empty.Title>
              <Empty.Description>
                {t('keys-empty-description', 'Add the API key the service gave you.')}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        )}
      </FormSection>
      <FormSection
        title={t('keys-add', 'Add or replace a key')}
        description={t('keys-add-description', 'A key with a name that exists replaces it.')}
      >
        <KeyForm record={record} name={name} onName={setName} />
      </FormSection>
    </div>
  );
};
