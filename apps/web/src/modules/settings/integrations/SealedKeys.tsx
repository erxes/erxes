import { IntegrationDataKey } from '@erxes/core-contract/integrationValues';
import { IconKey } from '@tabler/icons-react';
import { Button, Empty, Input, Label, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormSection } from './FormSection';

type SetSecrets = (secrets: Record<string, string | null>, onDone: () => void) => void;

interface KeysTarget {
  sealedNames: string[];
  pending: boolean;
  onSet: SetSecrets;
}

const KeyForm = ({
  target,
  name,
  onName,
}: {
  target: KeysTarget;
  name: string;
  onName: (name: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { toast } = useToast();
  const nameId = useId();
  const valueId = useId();
  const [value, setValue] = useState('');
  const replacing = target.sealedNames.includes(name);
  const nameValid = IntegrationDataKey.safeParse(name).success;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();

        if (nameValid && value) {
          target.onSet({ [name]: value }, () => {
            setValue('');
            onName('');
            toast({ title: t('key-saved', 'Key saved. It is not shown again.') });
          });
        }
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
        <Button type="submit" disabled={!nameValid || !value || target.pending}>
          {target.pending ? (
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
  target,
  name,
  onReplace,
}: {
  target: KeysTarget;
  name: string;
  onReplace: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const { confirm } = useConfirm();
  const { toast } = useToast();

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
        disabled={target.pending}
        onClick={() =>
          void confirm({
            message: t('key-remove-confirm', 'Remove the key {{name}}?', { name }),
            options: {
              description: t('key-remove-description', 'Programs that use it will fail.'),
            },
          }).then(() =>
            target.onSet({ [name]: null }, () => toast({ title: t('key-removed', 'Key removed') })),
          )
        }
      >
        {t('key-remove', 'Remove')}
      </Button>
    </li>
  );
};

export const SealedKeys = ({
  emptyDescription,
  ...target
}: KeysTarget & { emptyDescription: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });
  const [name, setName] = useState('');

  return (
    <>
      <FormSection
        title={t('keys-saved', 'Saved keys')}
        description={t('keys-saved-description', 'Replace one to change its value.')}
      >
        {target.sealedNames.length ? (
          <ul className="divide-y rounded-lg border">
            {target.sealedNames.map((sealed) => (
              <KeyRow
                key={sealed}
                target={target}
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
              <Empty.Description>{emptyDescription}</Empty.Description>
            </Empty.Header>
          </Empty>
        )}
      </FormSection>
      <FormSection
        title={t('keys-add', 'Add or replace a key')}
        description={t('keys-add-description', 'A key with a name that exists replaces it.')}
      >
        <KeyForm target={target} name={name} onName={setName} />
      </FormSection>
    </>
  );
};
