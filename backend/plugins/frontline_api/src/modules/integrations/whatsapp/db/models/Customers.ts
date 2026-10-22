import { FilterQuery, Model, mongo } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IWhatsappContact,
  IWhatsappCustomer,
  IWhatsappCustomerDocument,
} from '@/integrations/whatsapp/@types/customers';
import { whatsappCustomerSchema } from '@/integrations/whatsapp/db/definitions/customers';

export interface IWhatsappCustomerModel
  extends Model<IWhatsappCustomerDocument> {
  findContact(
    integrationId: string,
    contact: IWhatsappContact,
  ): Promise<IWhatsappCustomerDocument | null>;
  upsertContact(
    integrationId: string,
    contact: IWhatsappContact,
  ): Promise<IWhatsappCustomerDocument>;
}

const isDuplicateKeyError = (error: unknown) =>
  error instanceof mongo.MongoServerError && error.code === 11000;

const contactSelector = (
  integrationId: string,
  { waId, userId }: IWhatsappContact,
): FilterQuery<IWhatsappCustomerDocument> => {
  const identities: FilterQuery<IWhatsappCustomerDocument>[] = [];

  if (waId) identities.push({ waId });
  if (userId) identities.push({ userId });

  if (!identities.length) {
    throw new Error('WhatsApp contact has neither a phone id nor a user id');
  }

  return { integrationId, $or: identities };
};

/** Only the identities and name WhatsApp actually sent. */
const contactFields = ({
  waId,
  userId,
  name,
}: IWhatsappContact): Partial<IWhatsappCustomer> => ({
  ...(waId ? { waId } : {}),
  ...(userId ? { userId } : {}),
  ...(name ? { name } : {}),
});

/** Binds contact identity resolution to the tenant collection. */
export const loadWhatsappCustomerClass = (models: IModels) => {
  /** Fills identities WhatsApp revealed later (a username user may arrive without wa_id first). */
  const updateContact = async (
    existing: IWhatsappCustomerDocument,
    fields: Partial<IWhatsappCustomer>,
  ): Promise<IWhatsappCustomerDocument> => {
    const changed = Object.entries(fields).some(
      ([key, value]) => existing.get(key) !== value,
    );

    if (!changed) return existing;

    try {
      await models.WhatsappCustomers.updateOne(
        { _id: existing._id },
        { $set: fields },
      );
    } catch (error) {
      // Another contact already owns the identity; keep the existing one.
      if (!isDuplicateKeyError(error)) throw error;
    }

    return (
      (await models.WhatsappCustomers.findOne({ _id: existing._id })) ||
      existing
    );
  };

  const createContact = async (
    integrationId: string,
    contact: IWhatsappContact,
    fields: Partial<IWhatsappCustomer>,
  ): Promise<IWhatsappCustomerDocument> => {
    try {
      return await models.WhatsappCustomers.create({
        integrationId,
        ...fields,
      });
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;

      // A concurrent webhook created the same contact first.
      const winner = await models.WhatsappCustomers.findContact(
        integrationId,
        contact,
      );

      if (!winner) throw error;

      return winner;
    }
  };

  class WhatsappCustomer {
    /** Finds a contact by phone id or business-scoped user id. */
    public static findContact(
      integrationId: string,
      contact: IWhatsappContact,
    ): Promise<IWhatsappCustomerDocument | null> {
      return models.WhatsappCustomers.findOne(
        contactSelector(integrationId, contact),
      ).exec();
    }

    /** Returns the contact, creating it on first sight and filling identities it gained since. */
    public static async upsertContact(
      integrationId: string,
      contact: IWhatsappContact,
    ): Promise<IWhatsappCustomerDocument> {
      const existing = await models.WhatsappCustomers.findContact(
        integrationId,
        contact,
      );
      const fields = contactFields(contact);

      return existing
        ? updateContact(existing, fields)
        : createContact(integrationId, contact, fields);
    }
  }

  whatsappCustomerSchema.loadClass(WhatsappCustomer);

  return whatsappCustomerSchema;
};
