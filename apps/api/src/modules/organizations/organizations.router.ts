import { db } from '@erxes/core-db';
import { getOrganization, updateOrganization } from '~/modules/organizations/organizations.service';
import { scoped, audited } from '~/orpc';

export const organizationsRouter = {
  current: scoped.organizations.current.handler(() => getOrganization(db())),
  update: scoped.organizations.update.handler(async ({ input }) => {
    const { organization } = await audited(
      (tx) => updateOrganization(tx, input),
      (result) => ({
        action: 'organization.updated',
        targetType: 'organization',
        targetId: result.organization.id,
        targetLabel: result.organization.name,
        changes: result.changes,
      }),
    );

    return organization;
  }),
};
