import styles from './formstyle.css';
import { listenForCommonRequests as sharedListenForCommonRequests } from './lib/utils';

declare const window: any;

const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

const generatePollUrl = (): string => {
  const script =
    document.currentScript ||
    (() => {
      const scripts = document.getElementsByTagName('script');

      return scripts[scripts.length - 1];
    })();

  if (script && script instanceof HTMLScriptElement) {
    return script.src.replace(`/pollBundle.js`, `/poll`);
  }

  return '';
};

const POLL_URL = generatePollUrl();

type Settings = {
  poll_id: string;
  channel_id: string;
  onAction?: (data?: any) => void;
};

const erxesPollsGlobal: {
  iframesMapping: Record<string, { container: HTMLElement; iframe: any }>;
  initialized: boolean;
} = (window.__erxesPollsGlobal = window.__erxesPollsGlobal || {
  iframesMapping: {},
  initialized: false,
});

const { iframesMapping } = erxesPollsGlobal;

const getPollSettings = (): Settings[] => window.erxesSettings?.polls || [];

const getMappingKey = (settings: Settings) =>
  JSON.stringify({
    poll_id: settings.poll_id,
    channel_id: settings.channel_id,
  });

const getSettings = (settings: Settings) =>
  getPollSettings().find(
    (candidate: Settings) =>
      candidate.channel_id === settings.channel_id &&
      candidate.poll_id === settings.poll_id,
  );

const createIframe = (settings: Settings) => {
  const containerId = `erxes-container-poll-${settings.poll_id}`;
  const iframeId = `erxes-iframe-poll-${settings.poll_id}`;

  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'erxes-modal-iframe hidden';
  }

  let iframe: any = document.getElementById(iframeId);

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.margin = '0 auto';
    iframe.allowTransparency = true;
    iframe.style.background = 'transparent';
  }

  iframe.src = POLL_URL;
  container.appendChild(iframe);
  document.body.appendChild(container);

  iframe.onload = () => {
    if (iframe.contentDocument?.body) {
      iframe.contentDocument.body.style.background = 'transparent';
    }

    const modifiedSettings = { ...settings };
    delete modifiedSettings.onAction;

    iframe.contentWindow?.postMessage(
      { fromPublisher: true, settings: modifiedSettings },
      '*',
    );
  };

  return { container, iframe };
};

const postMessageToOne = (pollId: string, data: any) => {
  const key = Object.keys(iframesMapping).find(
    (candidate) => JSON.parse(candidate).poll_id === pollId,
  );

  if (!key) {
    return;
  }

  iframesMapping[key].iframe?.contentWindow?.postMessage(
    { fromPublisher: true, pollId, ...data },
    '*',
  );
};

const initPolls = () => {
  getPollSettings().forEach((settings: Settings) => {
    const key = getMappingKey(settings);

    if (!iframesMapping[key]) {
      iframesMapping[key] = createIframe(settings);
    }
  });
};

const runInitialSetup = () => {
  if (erxesPollsGlobal.initialized) {
    return;
  }

  erxesPollsGlobal.initialized = true;

  const erxes = window.Erxes || {};
  erxes.showPoll = (pollId: string) =>
    postMessageToOne(pollId, { action: 'showPoll' });
  window.Erxes = erxes;

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element)?.closest?.(
      '[data-erxes-poll]',
    ) as HTMLElement | null;

    const pollId = trigger?.getAttribute('data-erxes-poll');

    if (pollId) {
      postMessageToOne(pollId, { action: 'showPoll' });
    }
  });

  window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data || {};
    const { fromErxes, source, message, settings } = data;

    if (!fromErxes || source !== 'fromPolls' || !settings) {
      return;
    }

    const { container, iframe } = iframesMapping[getMappingKey(settings)] || {};

    sharedListenForCommonRequests(event, iframe);

    const completeSettings = getSettings(settings);

    if (!completeSettings) {
      return;
    }

    if (message === 'changeContainerClass' && container) {
      container.className = data.className;
    }

    if (message === 'submitResponse' && completeSettings.onAction) {
      completeSettings.onAction(data);
    }
  });
};

runInitialSetup();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPolls);
} else {
  initPolls();
}
