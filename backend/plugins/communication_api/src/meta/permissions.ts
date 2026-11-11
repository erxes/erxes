import { IPermissionConfig } from 'erxes-api-shared/core-types';
import { MESSAGING_ADMIN_ACTION } from '@/messaging/admin';

// Core auto-assigns IDs ending in `:viewer`. This group must stay opt-in.
export const permissions: IPermissionConfig = {
  plugin: 'communication',
  modules: [
    {
      name: 'messaging',
      description: 'Private app messaging',
      scopeField: null,
      ownerFields: [],
      scopes: [{ name: 'all', description: 'All conversations' }],
      actions: [
        {
          title: 'View all conversations',
          name: MESSAGING_ADMIN_ACTION,
          description:
            'Read every DIRECT and GROUP conversation, message, participant and attachment in this organization without being a participant. Read-only and audited.',
        },
      ],
    },
  ],
  defaultGroups: [
    {
      id: 'communication:messaging-viewer',
      name: 'Communication Messaging Viewer',
      description:
        'Explicit, read-only and audited access to private app conversations.',
      permissions: [
        {
          plugin: 'communication',
          module: 'messaging',
          actions: [MESSAGING_ADMIN_ACTION],
          scope: 'all',
        },
      ],
    },
  ],
};
