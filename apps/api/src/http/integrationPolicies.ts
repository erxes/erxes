import { needs } from './policyRules';

export const INTEGRATION_ACCOUNT_ACCESS = {
  // A plugin's integration also needs the permission its manifest names (definitions.ts).
  'integrationAccounts.definitions': needs('integrations.manage'),
  'integrationAccounts.list': needs('integrations.manage'),
  'integrationAccounts.choices': needs('automations.view'),
  'integrationAccounts.start': needs('integrations.manage'),
  'integrationAccounts.connect': needs('integrations.manage'),
  'integrationAccounts.create': needs('integrations.manage'),
  'integrationAccounts.setSecrets': needs('integrations.manage'),
  'integrationAccounts.pick': needs('integrations.manage'),
  'integrationAccounts.confirmPick': needs('integrations.manage'),
  'integrationAccounts.cancelPick': needs('integrations.manage'),
  'integrationAccounts.rename': needs('integrations.manage'),
  'integrationAccounts.check': needs('integrations.manage'),
  'integrationAccounts.usage': needs('integrations.manage'),
  'integrationAccounts.remove': needs('integrations.manage'),
  'integrationAccounts.setup': needs('integrations.manage'),
  'integrationAccounts.saveSetup': needs('integrations.manage'),
  'integrationAccounts.removeSetup': needs('integrations.manage'),
  // A plugin reaches the accounts of its own integrations only (accounts.service).
  'pluginAccounts.offer': { plugin: 'installed' },
  'pluginAccounts.list': { plugin: 'installed' },
  'pluginAccounts.open': { plugin: 'installed' },
  'pluginAccounts.update': { plugin: 'installed' },
  'pluginAccounts.report': { plugin: 'installed' },
  'pluginAccounts.setup': { plugin: 'installed' },
  'pluginAccounts.import': { plugin: 'installed' },
  'pluginSecrets.seal': { plugin: 'installed' },
  'pluginSecrets.open': { plugin: 'installed' },
} as const;
