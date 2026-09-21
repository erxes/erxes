import { Model } from 'mongoose';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { mailCustomerSchema } from '@/integrations/mail/db/definitions/customers';
import { IMailCustomerDocument } from '@/integrations/mail/@types/customer';
import { isDuplicateKeyError } from '@/integrations/mail/utils/mongoErrors';

export interface IMailCustomerModel extends Model<IMailCustomerDocument> {
  findOrCreate(
    subdomain: string,
    email: string,
    inboxIntegrationId: string,
    name?: string,
  ): Promise<string>;
}

const splitName = (name?: string) => {
  const trimmed = (name || '').trim();

  if (!trimmed) {
    return {};
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);

  return { firstName, lastName: rest.join(' ') || undefined };
};

export const loadMailCustomerClass = (models: IModels) => {
  // skipcq: JS-0327
  class Customer {
    public static async findOrCreate(
      subdomain: string,
      email: string,
      inboxIntegrationId: string,
      name?: string,
    ) {
      const mirrored = await models.MailCustomers.findOne({ email });

      if (mirrored) {
        return mirrored.contactsId;
      }

      const { firstName, lastName } = splitName(name);

      const existing = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'customers',
        action: 'findOne',
        input: { query: { customerPrimaryEmail: email } },
        defaultValue: null,
      });

      let contactsId = existing?._id;

      if (!contactsId) {
        const created = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'createCustomer',
          input: {
            doc: {
              integrationId: inboxIntegrationId,
              primaryEmail: email,
              firstName,
              lastName,
            },
          },
          defaultValue: {},
        });

        contactsId = created?._id;
      }

      if (!contactsId) {
        throw new Error(`Failed to resolve a core customer for ${email}`);
      }

      const stored = await Customer.upsertMirror(email, {
        inboxIntegrationId,
        contactsId,
        firstName,
        lastName,
      });

      return stored?.contactsId ?? contactsId;
    }

    private static async upsertMirror(
      email: string,
      doc: {
        inboxIntegrationId: string;
        contactsId: string;
        firstName?: string;
        lastName?: string;
      },
    ) {
      try {
        return await models.MailCustomers.findOneAndUpdate(
          { email },
          { $setOnInsert: { email, ...doc } },
          { upsert: true, new: true },
        );
      } catch (e) {
        if (isDuplicateKeyError(e, 'email')) {
          return models.MailCustomers.findOne({ email });
        }

        throw e;
      }
    }
  }

  mailCustomerSchema.loadClass(Customer);

  return mailCustomerSchema;
};
