import { db } from '@erxes/core-db';
import { getOrganization, toOrganizationDto } from '~/modules/organizations/organizations.service';
import { authed } from '~/orpc';

export const organizationsRouter = {
  current: authed.organizations.current.handler(async ({ context }) =>
    toOrganizationDto(await getOrganization(db(), context.actor.orgId)),
  ),
};
