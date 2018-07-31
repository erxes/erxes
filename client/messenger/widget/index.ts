declare const ROOT_URL: string;
declare const window: any;

/*
 * Messenger message's embeddable script
 */

// css
import './index.css';

import { getBrowserInfo } from '../../utils';

// check is mobile
const isMobile =
  navigator.userAgent.match(/iPhone/i) ||
  navigator.userAgent.match(/iPad/i) ||
  navigator.userAgent.match(/Android/i);

let viewportContent = '';
let generatedContent = '';

if (isMobile) {
  const viewportMeta = document.querySelector('meta[name="viewport"]');

  if (!viewportMeta) {
    // add meta
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content =
      'initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width';
    document.getElementsByTagName('head')[0].appendChild(meta);

    viewportContent = meta.content;
  } else {
    viewportContent = viewportMeta.getAttribute('content') || '';
    disableZoom();
  }
}

function disableZoom() {
  const viewportMeta = document.querySelector('meta[name="viewport"]');

  if (!viewportMeta) {
    return;
  }

  if (generatedContent) {
    viewportMeta.setAttribute('content', generatedContent);
  } else {
    const meta = `initial-scale=1, user-scalable=0, maximum-scale=1, ${viewportContent}`;
    viewportMeta.setAttribute('content', uniqueString(meta));
    generatedContent = viewportMeta.getAttribute('content') || '';
  }
}

function revertViewPort() {
  const viewportMeta = document.querySelector('meta[name="viewport"]');

  if (viewportMeta) {
    viewportMeta.setAttribute('content', viewportContent);
  }
}

function uniqueString(str: string) {
  const replaced = str.replace(/[ ]/g, '').split(',');

  const result = [];

  for (let i = 0; i < replaced.length; i++) {
    if (result.indexOf(str[i]) === -1) { result.push(str[i]); }
  }

  return result.join(', ');
}

const iframeId = 'erxes-messenger-iframe';
const container = 'erxes-messenger-container';

// container
const erxesContainer = document.createElement('div');
erxesContainer.id = container;
erxesContainer.className = 'erxes-messenger-hidden';

// add iframe
const iframe = document.createElement('iframe');

iframe.id = iframeId;
iframe.src = `${ROOT_URL}/messenger`;
iframe.style.display = 'none';

erxesContainer.appendChild(iframe);
document.body.appendChild(erxesContainer);

// after iframe load send connection info
iframe.onload = async () => {
  iframe.style.display = 'block';

  if (!iframe.contentWindow) {
    return;
  }

  iframe.contentWindow.postMessage(
    {
      fromPublisher: true,
      setting: {
        ...window.erxesSettings.messenger
      },
    },
    '*'
  );
};

// listen for widget toggle
window.addEventListener('message', async (event: MessageEvent) => {
  const data = event.data;
  const { isVisible, message, isSmallContainer } = data;

  if (data.fromErxes && data.source === 'fromMessenger') {
    if (isMobile && isVisible) {
      disableZoom();
    } else {
      revertViewPort();
    }

    if (message === 'messenger') {
      erxesContainer.className = `erxes-messenger-${
        isVisible ? 'shown' : 'hidden'
      }`;
      erxesContainer.classList.toggle('small', isSmallContainer);
      document.body.classList.toggle('messenger-widget-shown', isVisible);
    }

    if (message === 'notifier') {
      erxesContainer.className += ` erxes-notifier-${
        isVisible ? 'shown' : 'hidden'
      }`;
    }

    if (message === 'notifierFull') {
      erxesContainer.className += ` erxes-notifier-${
        isVisible ? 'shown' : 'hidden'
      } fullMessage`;
    }

    if (message === 'requestingBrowserInfo' && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          fromPublisher: true,
          source: 'fromMessenger',
          message: 'sendingBrowserInfo',
          browserInfo: await getBrowserInfo(),
        },
        '*'
      );
    }
  }
});
