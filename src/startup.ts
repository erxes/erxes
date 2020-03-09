import { debugGmail, debugIntegrations } from './debuggers';
import { trackGmail } from './gmail/watch';

export const init = async () => {
  try {
    trackGmail()
      .then(() => {
        debugGmail('Successfully called trackGmail');
      })
      .catch(e => {
        throw e;
      });
  } catch (e) {
    debugIntegrations(e.message);
    throw e;
  }
};
