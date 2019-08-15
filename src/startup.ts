import { debugIntegrations } from './debuggers';
import { trackGmail } from './gmail/watch';

export const init = () => {
  try {
    trackGmail();
  } catch (e) {
    debugIntegrations(e.message());
  }
};
