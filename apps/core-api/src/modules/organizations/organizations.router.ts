import { db } from '@erxes/core-db';
import {
  getOrganization,
  toOrganizationDto,
  updateOrganization,
} from '~/modules/organizations/organizations.service';
import { anyone, authed, audited } from '~/orpc';

export const organizationsRouter = {
  current: anyone.organizations.current.handler(async ({ context }) =>
    toOrganizationDto(await getOrganization(db(), context.caller.orgId)),
  ),
  update: authed.organizations.update.handler(async ({ input, context }) => {
    const { organization } = await audited(
      context.actor,
      (tx) => updateOrganization(tx, context.actor.orgId, input),
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
