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
