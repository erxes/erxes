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

const delay = 1500;

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

function delaydToggleClass(str: string, isVisible: boolean) {
  hideDelayTimer = setTimeout(() => {
    erxesContainer.classList.toggle(str, isVisible);
  }, delay);
}

function delaydSetClass(str: string) {
  hideDelayTimer = setTimeout(() => {
    erxesContainer.className = str;
  }, delay);
}

function clearTimer() {
  if (hideDelayTimer) {
    clearTimeout(hideDelayTimer);
  }
}

const iframeId = 'erxes-messenger-iframe';
const container = 'erxes-messenger-container';

// container
const erxesContainer = document.createElement('div');
erxesContainer.id = container;

// add iframe
const iframeContainer = document.createElement('div');
iframeContainer.className = 'erxes-messenger-frame';
const iframe: any = document.createElement('iframe');

iframe.id = iframeId;
iframe.src = generateIntegrationUrl('messenger');
iframe.style.display = 'none';
iframe.allow = 'camera *;microphone *';

const launcherContainer = document.createElement('div');
launcherContainer.className = 'erxes-launcher-container';

const launcherIframe = document.createElement('iframe')
launcherIframe.id = 'erxes-launcher';
launcherIframe.style.cssText = `
position:absolute;
right:12px; 
bottom:12px;
border:none;
z-index: 2147483649;
overflow:hidden;
height: 76px;
width: 76px;
`;
launcherIframe.style.cssText += 'opacity: 0; transition: opacity 0.3s;';

iframeContainer.appendChild(iframe);
launcherContainer.appendChild(launcherIframe);
erxesContainer.append(iframeContainer, launcherContainer);
document.body.appendChild(erxesContainer);

let logo: any;
let backgroundImage: any;

// Listen for messages from the iframe
window.addEventListener('message', async (event: MessageEvent) => {
  const { data } = event;
  if (data.fromErxes && data.connectionInfo) {
    const { connectionInfo } = data;
    const { widgetsMessengerConnect } = connectionInfo;

    const { uiOptions } = widgetsMessengerConnect;
    if (uiOptions) {
      // Ensure the iframe content is accessible
      const iframeDocument =
        launcherIframe.contentDocument ||
        launcherIframe.contentWindow?.document;

      if (iframeDocument) {
        const launcher = iframeDocument.querySelector(
          '.erxes-launcher'
        ) as HTMLElement;
        if (launcher) {
          const { color, logo: uiOptionsLogo } = uiOptions;
          logo = uiOptionsLogo;
          backgroundImage = logo
            ? `url(${process.env.API_URL}/read-file?key=${logo}&width=20)`
            : '';

          launcher.style.cssText = `
                          width: 56px;
                          height: 56px;
                          -webkit-font-smoothing: antialiased;
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
                          background-size: ${logo ? '' : '56px'};
                      `;
        }
      }
    }
  }
});

// after iframe load send connection info
iframe.onload = async () => {
  iframe.style.display = 'block';

  const contentWindow = iframe.contentWindow;

  if (!contentWindow) {
    return;
  }

  const setting = window.erxesSettings.messenger;

  setErxesProperty('showMessenger', () => {
    contentWindow.postMessage(
      {
        fromPublisher: true,
        action: 'showMessenger',
      },
      '*'
    );
  });

  contentWindow.postMessage(
    {
      fromPublisher: true,
      setting,
      storage: getStorage(),
    },
    '*'
  );
};

launcherIframe.onload = async () => {
  launcherIframe.style.opacity = '1';

  const contentWindow = iframe.contentWindow;
  if (!contentWindow) {
    return;
  }
  const iframeDocument =
    launcherIframe.contentDocument || launcherIframe?.contentWindow?.document;
  if (iframeDocument) {
    const div = document.createElement('div');
    div.innerHTML =
      '<div role="button" class="erxes-launcher" tabindex="0"></div>';
    iframeDocument.body.appendChild(div);
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
      contentWindow.postMessage(
        {
          fromPublisher: true,
          action: 'toggleMessenger',
        },
        '*'
      );
    };

    // Attach event listeners to the launcher element
    const launcherElement = iframeDocument?.querySelector('.erxes-launcher');

    if (launcherElement) {
      launcherElement.addEventListener('click', handleLauncherEvent);
      launcherElement.addEventListener('keyup', handleLauncherEvent);
    }
  }
};

// listen for widget toggle
window.addEventListener('message', async (event: MessageEvent) => {
  const data = event.data;
  const { isVisible, message, isSmallContainer } = data;

  listenForCommonRequests(event, iframe);

  if (data.fromErxes && data.source === 'fromMessenger') {
    const iframeDocument =
      launcherIframe.contentDocument || launcherIframe?.contentWindow?.document;
    const launcher = iframeDocument?.querySelector(
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
      const closeIcon =
        '<svg xmlns="http://www.w3.org/2000/svg"width="22"height="24"viewBox="0 0 24 24"fill="none"stroke="white"stroke-width="2"stroke-linecap="round"stroke-linejoin="round"><line x1="18"y1="6"x2="6"y2="18"/><line x1="6"y1="6"x2="18"y2="18"/></svg>';

      if (isVisible) {
        iframeContainer.classList.add('erxes-messenger-shown');
        iframeContainer.classList.remove('erxes-messenger-hidden');
        launcher.style.backgroundImage = 'none';
        launcher.innerHTML = closeIcon;
      } else {
        iframeContainer.classList.remove('erxes-messenger-shown');
        iframeContainer.classList.add('erxes-messenger-hidden');
        launcher.style.backgroundImage = backgroundImage;
        launcher.style.backgroundSize = `${logo ? '' : '56px'};`;
        launcher.innerHTML = ``;
      }
    }

    erxesContainer.classList.toggle('small', isSmallContainer);
    // document.body.classList.toggle('messenger-widget-shown', isVisible);
  }
});
