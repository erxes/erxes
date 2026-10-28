import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sendEmail } from '~/utils/email';
import {
  getActiveMemberIds,
  getDescendantIds,
} from '@/organization/structure/utils';

export const getStructureMemberIds = async (
  models: IModels,
  entityIds: string[],
) => {
  const entities = await models.StructureEntities.find(
    { _id: { $in: entityIds } },
    { order: 1 },
  ).lean();

  return getActiveMemberIds(
    models,
    await getDescendantIds(
      models,
      entities.map((entity) => entity.order),
    ),
  );
};

/**
 * Create default or ses transporter
 */

export const sendInvitationEmail = async (
  models: IModels,
  subdomain: string,
  {
    email,
    token,
    userId,
  }: {
    email: string;
    token: string;
    userId: string;
  },
): Promise<void> => {
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  const confirmationUrl = `${DOMAIN}/confirmation?token=${token}`;

  await sendEmail(
    subdomain,
    {
      toEmails: [email],
      title: 'Team member invitation',
      template: {
        name: 'userInvitation',
        data: {
          content: confirmationUrl,
          domain: DOMAIN,
        },
      },
      userId,
    },
    models,
  );
};
