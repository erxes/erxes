import type { Integration as CustomRecord } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useIntegrationsSaved } from './customMutation';
import { SealedKeys } from './SealedKeys';

export const CustomKeys = ({ record }: { record: CustomRecord }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.custom' });

  const set = useMutation(
    orpc.integrations.setSecrets.mutationOptions(
      useIntegrationsSaved(t('key-failed', 'Could not save the key')),
    ),
  );

  return (
    <div className="space-y-6">
      <p className="rounded-lg border p-4 text-sm">
        {t(
          'keys-intro',
          'Keys are sent only to {{hosts}}. Once saved, a key is never shown again, not even to you.',
          { hosts: record.hosts.join(', ') },
        )}
      </p>
      <SealedKeys
        sealedNames={record.sealedNames}
        pending={set.isPending}
        emptyDescription={t('keys-empty-description', 'Add the API key the service gave you.')}
        onSet={(secrets, onDone) => set.mutate({ id: record.id, secrets }, { onSuccess: onDone })}
      />
    </div>
  );
};
