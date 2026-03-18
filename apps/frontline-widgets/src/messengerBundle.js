'use strict';
(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) =>
        x.done
          ? resolve(x.value)
          : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // apps/frontline-widgets/src/index.css
  var src_default =
    '#erxes-messenger-container {\n  position: fixed;\n  bottom: 0;\n  right: 0;\n  z-index: 2147483647;\n}\n\n#erxes-messenger-iframe {\n  position: absolute !important;\n  border: none;\n  z-index: 2147483647;\n  height: 100%;\n  width: 100%;\n  border-radius: 1rem;\n  overflow: hidden;\n}\n\n.erxes-launcher {\n  position: absolute;\n  right: 12px;\n  bottom: 12px;\n  border: none;\n  z-index: 2147483649;\n  overflow: hidden;\n  height: 48px;\n  width: 48px;\n  opacity: 0;\n  transition: box-shadow 0.3s ease-in-out, opacity 0.3s;\n  border-radius: 50%;\n  /* filter: drop-shadow(rgba(9, 14, 21, 0.1) 0px 3px 6px)\n    drop-shadow(rgba(9, 14, 21, 0.1) 0px 1px 12px); */\n  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.06), 0 2px 32px 0 rgba(0, 0, 0, 0.16);\n}\n\n.erxes-messenger-hidden {\n  position: fixed;\n  height: min(720px, 100% - 104px);\n  min-height: 80px;\n  width: 408px;\n  max-height: 720px;\n  border-radius: 1rem;\n  right: 16px;\n  bottom: 92px;\n  transform-origin: right bottom;\n  transition: width 200ms ease 0s, height 200ms ease 0s,\n    max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s,\n    opacity 83ms ease-out 0s;\n  transform: scale(0);\n  opacity: 0;\n  pointer-events: none;\n}\n\n.erxes-messenger-shown {\n  position: fixed;\n  height: 100%;\n  min-height: 378px;\n  width: 408px;\n  max-height: 600px;\n  border-radius: 1rem;\n  right: 16px;\n  bottom: 92px;\n  transform-origin: right bottom;\n  box-shadow: 0 2px 8px 1px rgba(0, 0, 0, 0.2);\n  opacity: 1;\n  transition: width 200ms ease 0s, height 200ms ease 0s,\n    max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s,\n    opacity 83ms ease-out 0s;\n  pointer-events: all;\n}\n\n.erxes-messenger-shown:after {\n  opacity: 0.9 !important;\n  right: -20px !important;\n  bottom: -20px !important;\n}\n\n.erxes-messenger-shown.small {\n  max-height: 310px;\n}\n\n.erxes-messenger-shown > iframe,\n.erxes-notifier-shown > iframe {\n  height: 100% !important;\n  max-width: none;\n  bottom: 0;\n}\n\n.erxes-notifier-shown {\n  width: 370px;\n  height: 230px;\n}\n\n.erxes-notifier-shown.fullMessage {\n  height: 550px;\n  max-height: 100%;\n}\n\n@media only screen and (max-width: 420px) {\n  #erxes-messenger-container {\n    width: 100%;\n    max-height: none;\n  }\n\n  .erxes-messenger-shown {\n    height: calc(100% - 72px);\n    width: 100%;\n    max-height: none;\n    display: block;\n    right: 0;\n    bottom: 72px;\n  }\n\n  #erxes-messenger-iframe {\n    bottom: 0;\n    right: 0;\n  }\n\n  body.messenger-widget-shown.widget-mobile {\n    overflow: hidden;\n    position: absolute;\n    height: 100%;\n  }\n}\n';

  // apps/frontline-widgets/src/index.ts
  var styleElement = document.createElement('style');
  styleElement.textContent = src_default;
  document.head.appendChild(styleElement);
  var isMobile =
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/Android/i);
  var defaultLogo = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)`;
  var viewportMeta = null;
  var newViewportMeta = null;
  var backgroundImage = defaultLogo;
  var baseUrl = '';
  var hasCustomLogo = false;
  var ERXES_WIDGET_CONTAINER_ID = 'erxes-messenger-container';
  var MESSENGER_IFRAME_ID = 'erxes-messenger-iframe';
  var CLOSE_ICON_STRING = `
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;
  var erxesWidgetContainer = document.createElement('div');
  erxesWidgetContainer.id = ERXES_WIDGET_CONTAINER_ID;
  if (isMobile) {
    document.documentElement.style.marginBottom = '72px';
  }
  var messengerIframeContainer = document.createElement('div');
  messengerIframeContainer.className = 'erxes-messenger-frame';
  var messengerIframe = document.createElement('iframe');
  messengerIframe.id = MESSENGER_IFRAME_ID;
  var generateIntegrationUrl = (integrationKind) => {
    const script =
      document.currentScript ||
      (() => {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
      })();
    if (script && script instanceof HTMLScriptElement) {
      return script.src.replace(`messengerBundle.js`, ``);
    }
    return '';
  };
  messengerIframe.src = generateIntegrationUrl('messenger');
  messengerIframe.style.display = 'none';
  messengerIframe.allow =
    'camera *; microphone *; clipboard-read; clipboard-write';
  var launcherIframeDocument = void 0;
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
  var _parentAudioCtx = null;
  var getParentAudioCtx = () => {
    if (_parentAudioCtx) return _parentAudioCtx;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      _parentAudioCtx = new AudioCtx();
    } catch (e) {}
    return _parentAudioCtx;
  };
  var playParentSound = () => {
    const ctx = getParentAudioCtx();
    if (!ctx) return;
    ctx
      .resume()
      .then(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      })
      .catch((_err) => {});
  };
  var updateLauncherBadge = (count) => {
    let badge = erxesWidgetContainer.querySelector('#erxes-unread-badge');
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'erxes-unread-badge';
        badge.style.cssText =
          'position:absolute;bottom:53px;right:5px;min-width:18px;height:18px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;box-sizing:border-box;pointer-events:none;line-height:1;font-family:sans-serif;z-index:2147483650;';
        erxesWidgetContainer.appendChild(badge);
      }
      badge.textContent = count > 99 ? '99+' : String(count);
    } else if (badge) {
      badge.remove();
    }
  };
  var handleLauncherEvent = (event) => {
    var _a;
    if (
      (event.type === 'keyup' && event.key === 'Enter') ||
      event.type === 'click'
    ) {
      (_a = getParentAudioCtx()) == null ? void 0 : _a.resume();
      postMessageToContentWindow();
    }
  };
  var handleLauncherIframeLoad = () =>
    __async(void 0, null, function* () {
      var _a;
      launcherIframeDocument =
        launcherIframe.contentDocument ||
        ((_a =
          launcherIframe == null ? void 0 : launcherIframe.contentWindow) ==
        null
          ? void 0
          : _a.document);
      if (launcherIframeDocument) {
        const launcherBtn = launcherIframeDocument.createElement('div');
        launcherBtn.setAttribute('role', 'button');
        launcherBtn.setAttribute('class', 'erxes-launcher');
        launcherBtn.setAttribute('tabindex', '0');
        launcherIframeDocument.body.appendChild(launcherBtn);
        launcherBtn.addEventListener('click', handleLauncherEvent);
        launcherBtn.addEventListener('keyup', handleLauncherEvent);
      }
    });
  var launcherContainer = document.createElement('div');
  launcherContainer.className = 'erxes-launcher-container';
  var launcherIframe = document.createElement('iframe');
  launcherIframe.id = 'erxes-launcher';
  launcherIframe.className = 'erxes-launcher';
  launcherIframe.src = 'about:blank';
  messengerIframeContainer.appendChild(messengerIframe);
  launcherContainer.appendChild(launcherIframe);
  launcherIframe.addEventListener('load', handleLauncherIframeLoad);
  erxesWidgetContainer.append(messengerIframeContainer, launcherContainer);
  document.body.appendChild(erxesWidgetContainer);
  var handleMessengerIframeLoad = () =>
    __async(void 0, null, function* () {
      if (!messengerIframe || !messengerIframe.contentWindow) {
        console.error('Messenger: Iframe or content window is not available');
        return;
      }
      const contentWindow = messengerIframe.contentWindow;
      messengerIframe.style.display = 'block';
      setupShowMessengerProperty(contentWindow);
      sendMessageToIframe(contentWindow);
      launcherIframe.style.opacity = '1';
    });
  var getStorage = () => {
    return localStorage.getItem('erxes') || '{}';
  };
  var setErxesProperty = (name, value) => {
    const erxes = window.Erxes || {};
    erxes[name] = value;
    window.Erxes = erxes;
  };
  var setupShowMessengerProperty = (contentWindow) => {
    setErxesProperty('showMessenger', () => {
      contentWindow.postMessage(
        {
          fromPublisher: true,
          action: 'showMessenger',
        },
        '*',
      );
    });
  };
  var sendMessageToIframe = (contentWindow) => {
    var _a;
    const settings =
      (_a = window.erxesSettings) == null ? void 0 : _a.messenger;
    contentWindow.postMessage(
      {
        fromPublisher: true,
        settings,
        storage: getStorage(),
      },
      '*',
    );
  };
  messengerIframe.addEventListener('load', handleMessengerIframeLoad);
  var postMessageToContentWindow = () => {
    if (!messengerIframe || !messengerIframe.contentWindow) {
      return;
    }
    const contentWindow = messengerIframe.contentWindow;
    contentWindow.postMessage(
      {
        fromPublisher: true,
        action: 'toggleMessenger',
      },
      '*',
    );
  };
  var handleMessageEvent = (event) =>
    __async(void 0, null, function* () {
      const { data } = event;
      if (data.fromErxes && data.message === 'connected' && data.apiUrl) {
        baseUrl = data.apiUrl;
      }
      if (data.fromErxes && data.connectionInfo) {
        const { connectionInfo } = data;
        const { widgetsMessengerConnect } = connectionInfo || {};
        const { uiOptions } = widgetsMessengerConnect || {};
        if (!uiOptions) {
          return console.error('Messenger: uiOptions is not defined');
        }
        const launcherBtn =
          launcherIframeDocument == null
            ? void 0
            : launcherIframeDocument.querySelector('.erxes-launcher');
        if (!launcherBtn) {
          return console.error('Messenger: launcher element is not defined');
        }
        const { primary, logo: uiOptionsLogo } = uiOptions;
        const logo = uiOptionsLogo;
        const color = primary == null ? void 0 : primary.DEFAULT;
        const foreground = primary == null ? void 0 : primary.foreground;
        hasCustomLogo = !!logo;
        backgroundImage = hasCustomLogo
          ? `url(${baseUrl}/read-file?key=${encodeURIComponent(logo)})`
          : backgroundImage;
        launcherBtn.style.cssText = `
      width: 48px;
      height: 48px;
      font-smoothing: antialiased;
      animation: pop 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 20px;
      position: fixed;
      top: 0;
      left: 0;
      line-height: 48px;
      pointer-events: auto;
      text-align: center;
      transition: background-image 0.3s ease-in;
      z-index: 2147483646;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      background-color: ${color};
      color: ${foreground || '#673fbd'};
      background-image: ${backgroundImage};
      background-size: ${hasCustomLogo ? '32px' : '18px'};
      background-position: center;
    `;
      }
    });
  window.addEventListener('message', handleMessageEvent);
  window.addEventListener('message', (event) =>
    __async(void 0, null, function* () {
      var _a;
      const { data } = event;
      const { isVisible, message, isSmallContainer } = data || {};
      if (data.fromErxes && data.source === 'fromMessenger') {
        if (message === 'playSound') {
          playParentSound();
          return;
        }
        if (message === 'unreadCount') {
          updateLauncherBadge((_a = data.unreadCount) != null ? _a : 0);
          return;
        }
        const launcher =
          launcherIframeDocument == null
            ? void 0
            : launcherIframeDocument.querySelector('.erxes-launcher');
        if (!launcher) {
          return console.error('Messenger: launcher element is not defined');
        }
        if (isMobile) {
          document.body.classList.toggle('widget-mobile', isVisible);
        }
        if (message === 'messenger') {
          if (isMobile && isVisible) {
            renewViewPort();
          } else {
            revertViewPort();
          }
          if (isVisible) {
            messengerIframeContainer.classList.add('erxes-messenger-shown');
            messengerIframeContainer.classList.remove('erxes-messenger-hidden');
            launcher.style.backgroundImage = 'none';
            launcher.innerHTML = CLOSE_ICON_STRING;
          } else {
            messengerIframeContainer.classList.remove('erxes-messenger-shown');
            messengerIframeContainer.classList.add('erxes-messenger-hidden');
            launcher.style.backgroundImage = backgroundImage;
            launcher.style.backgroundSize = hasCustomLogo ? '32px' : '18px';
            launcher.innerHTML = '';
          }
        }
        erxesWidgetContainer.classList.toggle('small', isSmallContainer);
      }
    }),
  );
})();
//# sourceMappingURL=messengerBundle.js.map
