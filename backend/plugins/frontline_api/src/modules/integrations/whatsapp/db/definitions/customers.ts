import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

/**
 * Plugin-local shadow of a core contact, keyed by the WhatsApp user id.
 *
 * Meta identifies a person by `wa_id` — their phone number in E.164 without the
 * leading `+`. It is stored verbatim here so inbound webhooks can be matched
 * cheaply, while `primaryPhone` holds the normalised form that core de-duplicates
 * on (see `normalizePhone`), so the same person reaching us by WhatsApp and by
 * phone call resolves to one contact.
 */
export const customerSchema = new Schema({
  _id: mongooseStringRandomId,
  waId: { type: String, unique: true, label: 'WhatsApp user id (wa_id)' },
  erxesApiId: { type: String, label: 'Customer id at contacts-api' },
  primaryPhone: { type: String, label: 'Normalised E.164 phone number' },
  firstName: String,
  lastName: String,
  integrationId: { type: String, label: 'Inbox integration id' },
});
