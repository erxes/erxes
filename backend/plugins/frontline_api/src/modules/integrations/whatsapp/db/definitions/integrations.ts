import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

/**
 * A connected WhatsApp Business phone number (Meta Cloud API).
 *
 * `phoneNumberId` is the Cloud API's identifier for the business number and is
 * what every Graph call is addressed to — it is NOT the dialable number, which
 * is `displayPhoneNumber` and is stored only so operators can recognise the
 * integration in the UI.
 */
export const integrationSchema = new Schema({
  _id: mongooseStringRandomId,
  kind: String,
  erxesApiId: String,

  // Cloud API identifiers.
  phoneNumberId: {
    type: String,
    label: 'WhatsApp phone number id',
    index: true,
  },
  whatsappBusinessAccountId: {
    type: String,
    label: 'WhatsApp business account (WABA) id',
    optional: true,
  },
  displayPhoneNumber: {
    type: String,
    label: 'Display phone number',
    optional: true,
  },

  // Credentials. The access token should be a System User token — the tokens
  // offered by the app dashboard quick-start expire after 24 hours.
  accessToken: String,
  appSecret: {
    type: String,
    label: 'App secret used to verify X-Hub-Signature-256',
    optional: true,
  },
  verifyToken: {
    type: String,
    label: 'Token echoed back during webhook verification',
    optional: true,
  },

  // Numbers arrive from Meta without a `+` and in E.164 already, but agents
  // may dial national-format numbers. Used to normalise both to one form so
  // the same person is not created twice.
  defaultCountryCode: {
    type: String,
    label: 'Default country code, digits only (e.g. 91)',
    optional: true,
  },

  healthStatus: String,
  error: String,
});
