import { sendRequest } from "@erxes/api-utils/src";
import { IClientPortalDocument } from "./src/models/definitions/clientPortal";
import * as twilio from 'twilio';

export const authCookieOptions = (secure: boolean) => {
  const oneDay = 1 * 24 * 3600 * 1000; // 1 day

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    maxAge: oneDay,
    secure,
  };

  return cookieOptions;
};

export const USER_LOGIN_TYPES = {
  COMPANY: 'company',
  CUSTOMER: 'customer',
  ALL: ['customer', 'company']
};

export const sendSms = async (phone: string, body: string, clientPortalConfig: IClientPortalDocument) => {
  const SMS_INTEGRATION_TYPE = clientPortalConfig.smsConfiguration;
  
  switch (SMS_INTEGRATION_TYPE) {
    case "Twilio":
      // Twilio Credentials
      const accountSid = clientPortalConfig.twilioAccountSid;
      const authToken = clientPortalConfig.twilioAuthToken;
      const twilioPhoneNumber = clientPortalConfig.twilioFromNumber;

      // require the Twilio module and create a REST client
      const client = twilio(accountSid, authToken);
      client.messages.create(
        {
          to: `+976${phone}`,
          from: twilioPhoneNumber,
          body,
        },
        (err, message) => {
          if (err) {
            // debugError(err.message);
            throw new Error(err.message);
          }

        //   debugExternalApi(`
        //     Success from : twillio
        //     responseBody: ${JSON.stringify(message)}
        // `);
          return "sent";
        }
      );
      break;

    case "MessagePro":
      // MessagePro Credentials
      const apiKey = clientPortalConfig.messageproApiKey;
      const messageproPhoneNumber = clientPortalConfig.messageproPhoneNumber;

      if(!apiKey) {
        return ''
      }

      if(!messageproPhoneNumber) {
        return ''
      }

      try {
        await sendRequest({
          // url: `${MESSAGE_PRO_API_URL}/send`,
          method: "GET",
          params: {
            key: apiKey,
            from: messageproPhoneNumber,
            to: phone,
            text: body,
          },
        });

        return "sent";
      } catch (e) {
        // debugError(e.message);
        throw new Error(e.message);
      }

    default:
      break;
  }
};
