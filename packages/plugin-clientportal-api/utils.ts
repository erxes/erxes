import { sendRequest } from "@erxes/api-utils/src";

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

export const sendSms = async (phone: string, body: string) => {
  const SMS_INTEGRATION_TYPE = process.env.SMS_INTEGRATION_TYPE;

  switch (SMS_INTEGRATION_TYPE) {
    // case "twilio":
    //   // Twilio Credentials
    //   const accountSid = process.env.TWILIO_ACCOUNT_SID;
    //   const authToken = process.env.TWILIO_AUTH_TOKEN;
    //   const twilioPhoneNumber = process.env.TWILIO_FROM_NUMBER;

    //   // require the Twilio module and create a REST client
    //   const client = twilio(accountSid, authToken);
    //   client.messages.create(
    //     {
    //       to: `+976${phone}`,
    //       from: twilioPhoneNumber,
    //       body,
    //     },
    //     (err, message) => {
    //       if (err) {
    //         debugError(err.message);
    //         throw new Error(err.message);
    //       }

    //       debugExternalApi(`
    //         Success from : twillio
    //         responseBody: ${JSON.stringify(message)}
    //     `);
    //       return "sent";
    //     }
    //   );
    //   break;

    case "messagepro":
      // MessagePro Credentials
      // const apiKey = process.env.MESSAGEPRO_API_KEY;
      const apiKey = 'test';
      // const messageproPhoneNumber = process.env.MESSAGEPRO_PHONE_NUMBER;
      const messageproPhoneNumber = '99184523';

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
