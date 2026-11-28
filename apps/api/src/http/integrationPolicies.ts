import { MEMBER, needs } from './policyRules';

/**
 * Integrations in the access map (`./policies`): every member reaches them, and the services
 * decide per integration (its permission for the organisation's, none for a member's own).
 */
export const INTEGRATION_ACCESS = {
  'integrations.list': MEMBER,
  'integrations.connections': MEMBER,
  'integrations.subscriptions': MEMBER,
  'integrations.records': MEMBER,
  'integrations.connect': MEMBER,
  'integrations.update': MEMBER,
  'integrations.remove': MEMBER,
  'integrations.report': { plugin: 'installed' },
  // Plugins the owner approved (`uses:<key>`, checked in connectionUse.ts) use the connections.
  'integrations.usable': { plugin: 'installed' },
  'integrations.credentials': { plugin: 'installed' },
  'integrations.authorize': MEMBER,
  'integrations.setOAuthApp': MEMBER,
  'integrations.removeOAuthApp': MEMBER,
  // The organisation's GitHub, through the server's GitHub App or its own.
  'githubApp.app': MEMBER,
  'githubApp.setApp': needs('integrations.manage'),
  'githubApp.removeApp': needs('integrations.manage'),
  'githubApp.signIn': needs('integrations.manage'),
  'githubApp.connect': needs('integrations.manage'),
} as const;
