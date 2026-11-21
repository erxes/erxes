import {
  type ActionField,
  customIntegrationRef,
  INTEGRATION_ACCOUNT_INPUT,
} from '@erxes/core-contract';
import type { StoredPluginManifest } from '@erxes/core-db';

type ManifestAction = NonNullable<StoredPluginManifest['actions']>[number];

const kindLabelOf = (manifest: StoredPluginManifest | null, action: ManifestAction) => {
  const [, key = ''] = (action.integration ?? '').split('.');
  const integration = manifest?.integrations?.find((item) => item.key === key);
  const kinds = integration?.accounts ?? [];

  return (
    kinds.find((item) => item.kind === action.accountKind)?.label ??
    (kinds.length === 1 ? kinds[0]?.label : undefined) ??
    'Account'
  );
};

export const accountInput = (
  manifest: StoredPluginManifest | null,
  action: ManifestAction,
): ActionField[] =>
  action.integration
    ? [
        {
          key: INTEGRATION_ACCOUNT_INPUT,
          label: kindLabelOf(manifest, action),
          type: 'integration_account',
          required: true,
          integration: action.integration,
          accountKind: action.accountKind,
        },
      ]
    : [];

export const customAccountInput = (integrationKey: string): ActionField => ({
  key: INTEGRATION_ACCOUNT_INPUT,
  label: 'Account',
  type: 'integration_account',
  required: false,
  integration: customIntegrationRef(integrationKey),
  description: "Empty uses the integration's own keys",
});
