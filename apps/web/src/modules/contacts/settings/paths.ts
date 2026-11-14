/**
 * Contacts › Settings: what shapes customers, companies and leads — their
 * properties, tags, lead stages — and the history of imports and exports.
 * (They lived under the organisation's Settings; those addresses redirect here.)
 */
export const CONTACT_SETTINGS_PATH = '/contacts/settings';

export const CONTACT_SETTINGS = {
  properties: `${CONTACT_SETTINGS_PATH}/properties`,
  tags: `${CONTACT_SETTINGS_PATH}/tags`,
  leadStages: `${CONTACT_SETTINGS_PATH}/lead-stages`,
  importExport: `${CONTACT_SETTINGS_PATH}/import-export`,
} as const;

/** The organisation Settings addresses that moved here (they redirect). */
const MOVED_FROM_SETTINGS = [
  '/settings/tags',
  '/settings/properties',
  '/settings/lead-stages',
  '/settings/import-export',
];

/**
 * Whether a remembered address is one of those: the settings gear must not
 * reopen it (it would land in Contacts › Settings, not the organisation's).
 */
export const isMovedSettingsPath = (path: string) =>
  MOVED_FROM_SETTINGS.some(
    (moved) => path === moved || path.startsWith(`${moved}/`) || path.startsWith(`${moved}?`),
  );
