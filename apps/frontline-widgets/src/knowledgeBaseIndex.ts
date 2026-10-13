import styles from './knowledgebasestyle.css';

type TKnowledgeBaseSettings = {
  topicId?: string;
  topic_id?: string;
};

type TErxesWindow = Window & {
  erxesSettings?: {
    knowledgeBase?: TKnowledgeBaseSettings;
    messenger?: unknown;
  };
};

type TWidgetMessage = {
  fromErxesKnowledgeBase?: boolean;
  type?: string;
  color?: string | null;
};

const BUNDLE_PATH = '/knowledgeBaseBundle.js';
const ROOT_ID = 'erxes-kb-root';
const STYLE_ID = 'erxes-kb-style';

const ICON_OPEN =
  '<svg class="erxes-kb-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6v13"/><path d="M12 6v13"/><path d="M21 6v13"/></svg>';
const ICON_CLOSE =
  '<svg class="erxes-kb-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>';

const findScriptSrc = (): string => {
  const current = document.currentScript;

  if (current instanceof HTMLScriptElement && current.src) {
    return current.src;
  }

  const script = Array.from(document.getElementsByTagName('script')).find(
    (item) => item.src.includes(BUNDLE_PATH),
  );

  return script?.src ?? '';
};

const SCRIPT_SRC = findScriptSrc();

const widgetUrl = (topicId: string, mode: 'inline' | 'floating') =>
  `${SCRIPT_SRC.split(BUNDLE_PATH)[0]}/knowledgebase?topicId=${encodeURIComponent(
    topicId,
  )}&mode=${mode}`;

const createIframe = (src: string) => {
  const iframe = document.createElement('iframe');

  iframe.src = src;
  iframe.title = 'Knowledge base';
  iframe.className = 'erxes-kb-iframe';

  return iframe;
};

const readMessage = (event: MessageEvent, iframe: HTMLIFrameElement) => {
  if (event.source !== iframe.contentWindow) {
    return null;
  }

  const data = event.data as TWidgetMessage | null;

  return data?.fromErxesKnowledgeBase ? data : null;
};

const mountInline = (target: HTMLElement, topicId: string) => {
  if (target.querySelector('.erxes-kb-iframe')) {
    return;
  }

  target.appendChild(createIframe(widgetUrl(topicId, 'inline')));
};

const mountFloating = (topicId: string, side: 'left' | 'right') => {
  if (document.getElementById(ROOT_ID)) {
    return;
  }

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.className = `erxes-kb-${side}`;

  const panel = document.createElement('div');
  panel.className = 'erxes-kb-panel';

  const iframe = createIframe(widgetUrl(topicId, 'floating'));
  panel.appendChild(iframe);

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'erxes-kb-launcher';
  launcher.setAttribute('aria-label', 'Help center');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = ICON_OPEN + ICON_CLOSE;

  const setOpen = (open: boolean) => {
    root.classList.toggle('erxes-kb-open', open);
    launcher.setAttribute('aria-expanded', String(open));
  };

  launcher.addEventListener('click', () =>
    setOpen(!root.classList.contains('erxes-kb-open')),
  );

  window.addEventListener('message', (event) => {
    const message = readMessage(event, iframe);

    if (message?.type === 'close') {
      setOpen(false);
      launcher.focus();
    }

    if (message?.type === 'ready' && message.color) {
      root.style.setProperty('--erxes-kb-color', message.color);
    }
  });

  root.appendChild(panel);
  root.appendChild(launcher);
  document.body.appendChild(root);
};

const init = () => {
  const { erxesSettings } = window as TErxesWindow;
  const settings = erxesSettings?.knowledgeBase;
  const topicId = settings?.topicId || settings?.topic_id;

  if (!topicId || !SCRIPT_SRC) {
    return;
  }

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = styles;
    document.head.appendChild(style);
  }

  const inline = document.querySelector('[data-erxes-kbase]');

  if (inline instanceof HTMLElement) {
    mountInline(inline, topicId);

    return;
  }

  mountFloating(topicId, erxesSettings?.messenger ? 'left' : 'right');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
