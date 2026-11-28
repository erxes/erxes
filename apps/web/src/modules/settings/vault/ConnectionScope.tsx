import type { IntegrationScope } from '@erxes/core-contract';
import { IconBuilding, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Segmented } from '~/components/Segmented';
import { useCan } from '~/modules/auth/session';
import type { Integration } from '../integrations/catalog';

/** The scopes the member may connect: their own always, the organisation's when their role manages it. */
export const useConnectionScope = (integration: Integration) => {
  const can = useCan();

  const open = integration.scopes.filter(
    (scope) => scope === 'personal' || can(integration.permission),
  );

  const [scope, setScope] = useState<IntegrationScope>(open[0] ?? 'org');

  return { open, scope, setScope };
};

export const ConnectionScopePicker = ({
  open,
  scope,
  onChange,
}: {
  open: IntegrationScope[];
  scope: IntegrationScope;
  onChange: (scope: IntegrationScope) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });

  if (open.length < 2) return null;

  return (
    <Segmented
      label={t('scope', 'Who uses it')}
      value={scope}
      onChange={onChange}
      options={[
        { value: 'org', label: t('scope-org', 'Organisation'), icon: IconBuilding },
        { value: 'personal', label: t('scope-personal', 'Only me'), icon: IconUser },
      ]}
    />
  );
};
