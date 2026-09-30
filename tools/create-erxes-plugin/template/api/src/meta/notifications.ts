/**
 * Serialized into the plugin's Redis config as meta.notifications — the core
 * notification dispatcher matches on `types` and renders `emailContent` /
 * `defaultText` templates.
 */
export const notifications = {
  'changeme': {
    name: 'changeme',
    types: [
      {
        type: 'changemoduleItemCreated',
        emailContent: 'A changemodule item was created.',
        defaultText: 'created a changemodule item',
      },
    ],
  },
};
