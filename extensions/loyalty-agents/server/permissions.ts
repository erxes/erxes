import { definePermissions } from 'erxes-sdk/server';

export const permissions = definePermissions({
  agents: {
    view: 'View agents',
    manage: 'Create, edit and delete agents',
  },
});

declare module 'erxes-sdk/server' {
  interface Register {
    permissions: typeof permissions;
  }
}
