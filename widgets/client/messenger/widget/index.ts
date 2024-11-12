// css
import './index.css';

import {
  generateIntegrationUrl,
  getStorage,
  listenForCommonRequests,
  setErxesProperty,
} from '../../widgetUtils';

declare const window: any;

/*
 * Messenger message's embeddable script
 */

// check is mobile
const isMobile =
  navigator.userAgent.match(/iPhone/i) ||
  navigator.userAgent.match(/iPad/i) ||
  navigator.userAgent.match(/Android/i);

let viewportMeta: any;
let newViewportMeta: any;
let hideDelayTimer: any;
let logo: any;
let backgroundImage: any;
let baseUrl = '';

const DELAY = 1500;
const ERXES_WIDGET_CONTAINER_ID = 'erxes-messenger-container';
const MESSENGER_IFRAME_ID = 'erxes-messenger-iframe';
const CLOSE_ICON_STRING =
  '<svg xmlns="http://www.w3.org/2000/svg"width="22"height="24"viewBox="0 0 24 24"fill="none"stroke="white"stroke-width="2"stroke-linecap="round"stroke-linejoin="round"><line x1="18"y1="6"x2="6"y2="18"/><line x1="6"y1="6"x2="18"y2="18"/></svg>';

if (isMobile) {
  viewportMeta = document.querySelector('meta[name="viewport"]');
}

function renewViewPort() {
  if (viewportMeta) {
    document.getElementsByTagName('head')[0].removeChild(viewportMeta);
  }

  newViewportMeta = document.createElement('meta');
  newViewportMeta.name = 'viewport';
  newViewportMeta.content =
    'initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width';
  document.getElementsByTagName('head')[0].appendChild(newViewportMeta);
}

function revertViewPort() {
  if (newViewportMeta) {
    document.getElementsByTagName('head')[0].removeChild(newViewportMeta);
  }

  if (viewportMeta) {
    document.getElementsByTagName('head')[0].appendChild(viewportMeta);
  }
}

function clearTimer() {
  if (hideDelayTimer) {
    clearTimeout(hideDelayTimer);
  }
}

// widget container
const erxesWidgetContainer = document.createElement('div');
erxesWidgetContainer.id = ERXES_WIDGET_CONTAINER_ID;

// messenger iframe container
const messengerIframeContainer = document.createElement('div');
messengerIframeContainer.className = 'erxes-messenger-frame';

// create messenger iframe
const messengerIframe = document.createElement('iframe');
messengerIframe.id = MESSENGER_IFRAME_ID;
messengerIframe.src = generateIntegrationUrl('messenger');
messengerIframe.style.display = 'none';
messengerIframe.allow =
  'camera *; microphone *; clipboard-read; clipboard-write';

// launcher container
const launcherContainer = document.createElement('div');
launcherContainer.className = 'erxes-launcher-container';

// create launcher iframe
const launcherIframe = document.createElement('iframe');
launcherIframe.id = 'erxes-launcher';
launcherIframe.className = 'erxes-launcher';

// Add the messenger iframe to the it's container
messengerIframeContainer.appendChild(messengerIframe);
// Add the launcher iframe to it's container
launcherContainer.appendChild(launcherIframe);
// Add both the messenger container and the launcher container to the erxes widget container
erxesWidgetContainer.append(messengerIframeContainer, launcherContainer);
// Finally, append the erxes container to the document body
document.body.appendChild(erxesWidgetContainer);

let launcherIframeDocument: Document | null | undefined;

const handleMessengerIframeLoad = async () => {
  if (!messengerIframe || !messengerIframe.contentWindow) {
    console.error('Messenger: Iframe or content window is not available');
    return;
  }
  const contentWindow = messengerIframe.contentWindow;
  messengerIframe.style.display = 'block';
  setupShowMessengerProperty(contentWindow);
  sendMessageToIframe(contentWindow);
  launcherIframe.style.opacity = '1';
};

const setupShowMessengerProperty = (contentWindow: Window) => {
  setErxesProperty('showMessenger', () => {
    contentWindow.postMessage(
      {
        fromPublisher: true,
        action: 'showMessenger',
      },
      '*'
    );
  });
};

const sendMessageToIframe = (contentWindow: Window) => {
  const setting = window.erxesSettings.messenger;
  contentWindow.postMessage(
    {
      fromPublisher: true,
      setting,
      storage: getStorage(),
    },
    '*'
  );
};

const handleLauncherIframeLoad = async () => {
  launcherIframeDocument =
    launcherIframe.contentDocument || launcherIframe?.contentWindow?.document;

  if (launcherIframeDocument) {
    // Actual content of the launcher iframe
    const launcherBtn = launcherIframeDocument.createElement('div');
    launcherBtn.setAttribute('role', 'button');
    launcherBtn.setAttribute('class', 'erxes-launcher');
    launcherBtn.setAttribute('tabindex', '0');

    // Add the launcher button to the document
    launcherIframeDocument.body.appendChild(launcherBtn);

    // Attach event listeners to the launcher element
    launcherBtn.addEventListener('click', handleLauncherEvent);
    launcherBtn.addEventListener('keyup', handleLauncherEvent);
  }
};

messengerIframe.addEventListener('load', handleMessengerIframeLoad);
launcherIframe.addEventListener('load', handleLauncherIframeLoad);

const handleLauncherEvent = (event: Event) => {
  // Check if the event is a KeyboardEvent and the key is 'Enter'
  if (
    (event.type === 'keyup' && (event as KeyboardEvent).key === 'Enter') ||
    event.type === 'click'
  ) {
    postMessageToContentWindow();
  }
};

// Function to post message to content window
const postMessageToContentWindow = () => {
  if (!messengerIframe || !messengerIframe.contentWindow) {
    return;
  }

  const contentWindow = messengerIframe.contentWindow;
  contentWindow.postMessage(
    {
      fromPublisher: true,
      action: 'toggleMessenger',
    },
    '*'
  );
};

// Listener for messages from the iframe
window.addEventListener('message', async (event: MessageEvent) => {
  const { data } = event;

  if (data.fromErxes && data.message === 'connected' && data.apiUrl) {
    baseUrl = data.apiUrl;
  }

  if (data.fromErxes && data.connectionInfo) {
    const { connectionInfo } = data || {};
    const { widgetsMessengerConnect } = connectionInfo || {};
    const { uiOptions } = widgetsMessengerConnect || {};

    try {
      await handleLauncherIframeLoad()
    } catch (error) {
      console.error(error);
    }

    if (!uiOptions) {
      return console.error('Messenger: uiOptions is not defined');
    }

    if (!launcherIframeDocument) {
      return console.error('Messenger: launcherIframeDocument is not defined');
    }

    const launcherBtn = launcherIframeDocument.querySelector(
      '.erxes-launcher'
    ) as HTMLElement;

    if (!launcherBtn) {
      return console.error('Messenger: launcher element is not defined');
    }

    const { color, logo: uiOptionsLogo } = uiOptions;

    logo = uiOptionsLogo;
    backgroundImage = logo
      ? `url(${baseUrl}/read-file?key=${logo}&width=20)`
      : 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujeum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)';

    launcherBtn.style.cssText = `
      width: 56px;
      height: 56px;
      font-smoothing: antialiased;
      animation: pop 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 20px;
      position: fixed;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
      line-height: 56px;
      pointer-events: auto;
      text-align: center;
      transition: box-shadow 0.3s ease-in-out, background-image 0.3s ease-in;
      z-index: 2147483646;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      background-color: ${color};
      color: ${color || '#673fbd'};
      background-image: ${backgroundImage};
      background-size: ${logo ? '' : 'contain'};
      background-position: center;
    `;
  }
});

// listener for widget toggle
window.addEventListener('message', async (event: MessageEvent) => {
  const { data } = event;
  const { isVisible, message, isSmallContainer } = data || {};

  listenForCommonRequests(event, messengerIframe);

  if (data.fromErxes && data.source === 'fromMessenger') {
    const launcher = launcherIframeDocument?.querySelector(
      '.erxes-launcher'
    ) as HTMLElement;

    if (isMobile) {
      document.body.classList.toggle('widget-mobile', isVisible);
    }

    if (message === 'messenger') {
      if (isMobile && isVisible) {
        renewViewPort();
      } else {
        revertViewPort();
      }
      clearTimer();

      if (isVisible) {
        messengerIframeContainer.classList.add('erxes-messenger-shown');
        messengerIframeContainer.classList.remove('erxes-messenger-hidden');
        launcher.style.backgroundImage = 'none';
        launcher.innerHTML = CLOSE_ICON_STRING;
      } else {
        messengerIframeContainer.classList.remove('erxes-messenger-shown');
        messengerIframeContainer.classList.add('erxes-messenger-hidden');
        launcher.style.backgroundImage = backgroundImage;
        launcher.style.backgroundSize = `${logo ? '' : '56px'};`;
        launcher.innerHTML = ``;
      }
    }

    erxesWidgetContainer.classList.toggle('small', isSmallContainer);
    // document.body.classList.toggle('messenger-widget-shown', isVisible);
  }
});
