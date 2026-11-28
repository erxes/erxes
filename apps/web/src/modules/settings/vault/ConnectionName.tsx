import type { VaultConnection } from '@erxes/core-contract';
import { Input, Label } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Integration } from '../integrations/catalog';
import { useIntegrationText } from '../integrations/IntegrationStatusBadge';
import { useConnections } from './useVault';

const freeName = (brand: string, taken: string[]) => {
  let name = brand;

  for (let count = 2; taken.includes(name.toLowerCase()); count++) name = `${brand} ${count}`;

  return name;
};

/**
 * A connection's name: the integration's own while it is free, then "Stripe 2" and on.
 * `taken` when another connection of the integration already has it.
 */
export const useConnectionName = (integration: Integration, connection?: VaultConnection) => {
  const brand = useIntegrationText()(integration).name;
  const data = useConnections().data?.data ?? [];
  const [typed, setName] = useState<string | null>(null);

  const others = data
    .filter(({ key, id }) => key === integration.key && id !== connection?.id)
    .map(({ name }) => name.toLowerCase());

  const name = typed ?? connection?.name ?? freeName(brand, others);
  const taken = others.includes(name.trim().toLowerCase());

  return { name, setName, taken, ready: name.trim() !== '' && !taken };
};

export const ConnectionNameInput = ({
  id,
  integration,
  name,
  taken,
  onChange,
}: {
  id: string;
  integration: Integration;
  name: string;
  taken: boolean;
  onChange: (name: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const brand = useIntegrationText()(integration).name;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t('name', 'Name')}</Label>
      <Input
        id={id}
        value={name}
        aria-invalid={taken}
        aria-describedby={taken ? `${id}-taken` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {taken && (
        <p id={`${id}-taken`} className="text-xs text-destructive-text">
          {t('name-taken', 'Another {{name}} connection has this name', { name: brand })}
        </p>
      )}
    </div>
  );
};
