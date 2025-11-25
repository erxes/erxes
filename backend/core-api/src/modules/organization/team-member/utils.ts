import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sendEmail } from '~/utils/email';

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
