import { IModels } from '~/connectionResolvers';
import { screenAddress } from '~/utils/email/intake';

export const screenNewAddresses = async (
  models: IModels,
  emails?: string[],
) => {
  for (const email of emails || []) {
    try {
      const { ok, reason } = await screenAddress(email);

      if (!ok && reason) {
        await models.EmailAddresses.suppress(email, 'screened');
      }
    } catch (error) {
      console.error(`Failed to screen ${email}: ${error.message}`);
    }
  }
};
