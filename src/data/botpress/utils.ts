import { debugBot } from '../../debuggers';
import { sendRequest } from '../utils';

const buildMessage = (responses: any) => {
  if (responses.length === 0) {
    return debugBot('No response');
  }

  const message = responses[responses.length === 1 ? 0 : 1];

  return message;
};

export const sendBotRequest = async (botEndpointUrl: string, message: string): Promise<any> => {
  try {
    const response = await sendRequest({
      method: 'POST',
      url: botEndpointUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        type: 'text',
        text: message,
      },
    });

    return buildMessage(response.responses || []);
  } catch (e) {
    debugBot('Failed to send request Bot Press: ', e.message);
    throw e;
  }
};
