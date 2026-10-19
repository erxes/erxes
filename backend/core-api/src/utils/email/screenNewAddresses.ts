import { IModels } from '~/connectionResolvers';
import { screenAddress } from '~/utils/email/intake';

export const screenNewAddresses = async (
  models: IModels,
  emails?: string[],
) => {
  for (const email of emails || []) {
    try {
      const verdict = await screenAddress(email);

      if (!verdict.ok) {
        await models.EmailAddresses.screen(email, verdict.reason);
      }
    } catch (error) {
      console.error(`Failed to screen an email address: ${error.message}`);
    }
  }
};
