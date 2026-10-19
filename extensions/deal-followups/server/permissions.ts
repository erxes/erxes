import { definePermissions } from 'erxes-sdk/server';

export const permissions = definePermissions({
  followUps: {
    view: 'View deal follow-ups',
    manage: 'Set and clear deal follow-ups',
  },
});

declare module 'erxes-sdk/server' {
  interface Register {
    permissions: typeof permissions;
  }
}
