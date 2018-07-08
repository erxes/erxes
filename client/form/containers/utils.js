import { requestBrowserInfo } from '../../utils';
import { connection } from '../connection';

/*
 * Send message to iframe's parent
 */
export const postMessage = (options) => {
  // notify parent window launcher state
  window.parent.postMessage({
    fromErxes: true,
    source: 'fromForms',
    setting: connection.setting,
    ...options
  }, '*');
};

export const saveBrowserInfo = () => {
  requestBrowserInfo({
    source:'fromForms',
    postData: {
      setting: connection.setting,
    },
    callback: (browserInfo) => {
      connection.browserInfo = browserInfo;
    }
  });
}
