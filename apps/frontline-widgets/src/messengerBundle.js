"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // apps/frontline-widgets/src/index.css
  var src_default = "#erxes-messenger-container {\n  position: fixed;\n  bottom: 0;\n  right: 0;\n  z-index: 2147483647;\n}\n\n#erxes-messenger-iframe {\n  position: absolute !important;\n  border: none;\n  z-index: 2147483647;\n  height: 100%;\n  width: 100%;\n  border-radius: 1rem;\n  overflow: hidden;\n  /* Must match the embedded document's color scheme \u2014 a mismatch with a\n     dark host page forces an opaque white canvas on the iframe */\n  color-scheme: light;\n  background: transparent;\n}\n\n/* Launcher iframe \u2014 extra space so the badge can overflow the button edge */\n.erxes-launcher {\n  position: absolute;\n  right: 8px;\n  bottom: 8px;\n  border: none;\n  z-index: 2147483649;\n  overflow: visible;\n  height: 72px;\n  width: 72px;\n  opacity: 0;\n  transition: opacity 0.3s ease;\n  background: transparent;\n  /* Must match the about:blank document's (light) scheme \u2014 a mismatch with a\n     dark host page forces an opaque white canvas on the iframe */\n  color-scheme: light;\n}\n\n.erxes-messenger-hidden {\n  position: fixed;\n  height: min(720px, 100% - 104px);\n  min-height: 80px;\n  width: 408px;\n  max-height: 720px;\n  border-radius: 1rem;\n  right: 16px;\n  bottom: 92px;\n  transform-origin: right bottom;\n  transition: width 200ms ease 0s, height 200ms ease 0s,\n    max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s,\n    opacity 83ms ease-out 0s;\n  transform: scale(0);\n  opacity: 0;\n  pointer-events: none;\n}\n.erxes-messenger-expand {\n  position: fixed;\n  min-height: 80px;\n  max-height: calc(100% - 104px);\n  height: calc(100% - 104px);\n  width: min(688px, max(0px, -20px + 100dvw));\n  border-radius: 1rem;\n  right: 16px;\n  bottom: 92px;\n  transform-origin: right bottom;\n  transition: width 200ms ease 0s, height 200ms ease 0s,\n    max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s,\n    opacity 83ms ease-out 0s;\n  opacity: 1;\n  pointer-events: all;\n  box-shadow: oklch(0.1621 0.017 256.72 / 90%) 0px 5px 40px 0px;\n}\n\n.erxes-messenger-shown {\n  position: fixed;\n  height: min(704px, 100% - 104px);\n  min-height: 80px;\n  width: min(400px, max(0px, -20px + 100dvw));\n  max-height: 704px;\n  border-radius: 1rem;\n  right: 16px;\n  bottom: 92px;\n  transform-origin: right bottom;\n  box-shadow: oklch(0.1621 0.017 256.72 / 90%) 0px 5px 40px 0px;\n  opacity: 1;\n  transition: width 200ms ease 0s, height 200ms ease 0s,\n    max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s,\n    opacity 83ms ease-out 0s;\n  pointer-events: all;\n}\n\n.erxes-messenger-shown:after {\n  opacity: 0.9 !important;\n  right: -20px !important;\n  bottom: -20px !important;\n}\n\n.erxes-messenger-shown.small {\n  max-height: 310px;\n}\n\n.erxes-messenger-shown > iframe,\n.erxes-notifier-shown > iframe {\n  height: 100% !important;\n  max-width: none;\n  bottom: 0;\n}\n\n.erxes-notifier-shown {\n  width: 370px;\n  height: 230px;\n}\n\n.erxes-notifier-shown.fullMessage {\n  height: 550px;\n  max-height: 100%;\n}\n\n@media only screen and (max-width: 420px) {\n  #erxes-messenger-container {\n    width: 100%;\n    max-height: none;\n  }\n\n  .erxes-messenger-shown {\n    height: calc(100% - 72px);\n    width: 100%;\n    max-height: none;\n    display: block;\n    right: 0;\n    bottom: 72px;\n  }\n\n  #erxes-messenger-iframe {\n    bottom: 0;\n    right: 0;\n  }\n\n  body.messenger-widget-shown.widget-mobile {\n    overflow: hidden;\n    position: absolute;\n    height: 100%;\n  }\n}\n";

  // apps/frontline-widgets/src/lib/utils.ts
  var getBrowserInfo = () => ({
    url: window.location.pathname,
    hostname: window.location.origin,
    language: navigator.language,
    userAgent: navigator.userAgent
  });
  var listenForCommonRequests = (event, iframe) => {
    const { message, fromErxes, source, key, value } = event.data || {};
    if (!fromErxes || !(iframe == null ? void 0 : iframe.contentWindow)) {
      return;
    }
    if (message === "requestingBrowserInfo") {
      iframe.contentWindow.postMessage(
        {
          fromPublisher: true,
          source,
          message: "sendingBrowserInfo",
          browserInfo: getBrowserInfo()
        },
        "*"
      );
    }
    if (message === "setLocalStorageItem") {
      const erxesStorage = JSON.parse(localStorage.getItem("erxes") || "{}");
      erxesStorage[key] = value;
      localStorage.setItem("erxes", JSON.stringify(erxesStorage));
    }
  };

  // apps/frontline-widgets/src/index.ts
  var ERXES_WIDGET_CONTAINER_ID = "erxes-messenger-container";
  var MESSENGER_IFRAME_ID = "erxes-messenger-iframe";
  var LAUNCHER_CACHE_KEY = "erxes-messenger-launcher";
  var LAUNCHER_CACHE_MAX_AGE = 24 * 60 * 60 * 1e3;
  var EARLY_CONNECT_DELAY = 2e3;
  var getStorage = () => {
    return localStorage.getItem("erxes") || "{}";
  };
  var getMessengerSettings = () => {
    var _a;
    return (_a = window.erxesSettings) == null ? void 0 : _a.messenger;
  };
  var readLauncherCache = () => {
    var _a;
    try {
      const cache = JSON.parse(localStorage.getItem(LAUNCHER_CACHE_KEY) || "");
      return (cache == null ? void 0 : cache.integrationId) === ((_a = getMessengerSettings()) == null ? void 0 : _a.integrationId) ? cache : void 0;
    } catch (e) {
      return void 0;
    }
  };
  var writeLauncherCache = (changes) => {
    var _a;
    try {
      localStorage.setItem(
        LAUNCHER_CACHE_KEY,
        JSON.stringify(__spreadProps(__spreadValues(__spreadValues({}, readLauncherCache()), changes), {
          integrationId: (_a = getMessengerSettings()) == null ? void 0 : _a.integrationId
        }))
      );
    } catch (e) {
    }
  };
  var needsEarlyConnect = () => {
    const settings = getMessengerSettings() || {};
    const cache = readLauncherCache();
    return Boolean(
      settings.email || settings.phone || settings.code || settings.data || settings.companyData || !(cache == null ? void 0 : cache.savedAt) || cache.engaged || Date.now() - cache.savedAt > LAUNCHER_CACHE_MAX_AGE
    );
  };
  var getHostTheme = (settings) => {
    var _a, _b;
    if ((settings == null ? void 0 : settings.theme) === "dark" || (settings == null ? void 0 : settings.theme) === "light") {
      return settings.theme;
    }
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = (_b = (_a = window.matchMedia) == null ? void 0 : _a.call(
      window,
      "(prefers-color-scheme: dark)"
    )) == null ? void 0 : _b.matches;
    return storedTheme === "dark" || !storedTheme && prefersDark ? "dark" : "light";
  };
  var sendMessageToIframe = (contentWindow) => {
    const settings = getMessengerSettings();
    const theme = getHostTheme(settings);
    contentWindow.postMessage(
      {
        fromPublisher: true,
        settings,
        storage: getStorage(),
        theme
      },
      "*"
    );
  };
  (function initErxesMessengerWidget() {
    const existingContainer = document.getElementById(
      ERXES_WIDGET_CONTAINER_ID
    );
    if (existingContainer) {
      if (existingContainer.refreshErxesMessenger) {
        existingContainer.refreshErxesMessenger();
        return;
      }
      const existingIframe = document.getElementById(
        MESSENGER_IFRAME_ID
      );
      if (existingIframe == null ? void 0 : existingIframe.contentWindow) {
        sendMessageToIframe(existingIframe.contentWindow);
      }
      return;
    }
    const styleElement = document.createElement("style");
    styleElement.textContent = src_default;
    document.head.appendChild(styleElement);
    const isMobile = navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i);
    const defaultLogo = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)`;
    const viewportMeta = null;
    let newViewportMeta = null;
    let backgroundImage = defaultLogo;
    let baseUrl = "";
    let hasCustomLogo = false;
    const CLOSE_ICON_STRING = `
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;
    const erxesWidgetContainer = document.createElement("div");
    erxesWidgetContainer.id = ERXES_WIDGET_CONTAINER_ID;
    if (isMobile) {
      document.documentElement.style.marginBottom = "72px";
    }
    const messengerIframeContainer = document.createElement("div");
    messengerIframeContainer.className = "erxes-messenger-frame";
    const messengerIframe = document.createElement("iframe");
    messengerIframe.id = MESSENGER_IFRAME_ID;
    messengerIframe.title = "Messenger";
    const generateIntegrationUrl = (integrationKind) => {
      const script = document.currentScript || (() => {
        const scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1];
      })();
      if (script && script instanceof HTMLScriptElement) {
        return script.src.replace(`messengerBundle.js`, ``);
      }
      return "";
    };
    const messengerUrl = generateIntegrationUrl("messenger");
    messengerIframe.style.display = "none";
    messengerIframe.allow = "camera *; microphone *; clipboard-read; clipboard-write";
    let launcherIframeDocument = void 0;
    let lastUnreadCount = 0;
    let isMessengerVisible = false;
    let isMessengerMounted = false;
    let isMessengerLoaded = false;
    let wantsMessengerVisible = false;
    function renewViewPort() {
      if (viewportMeta) {
        document.getElementsByTagName("head")[0].removeChild(viewportMeta);
      }
      newViewportMeta = document.createElement("meta");
      newViewportMeta.name = "viewport";
      newViewportMeta.content = "initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width";
      document.getElementsByTagName("head")[0].appendChild(newViewportMeta);
    }
    function revertViewPort() {
      if (newViewportMeta) {
        document.getElementsByTagName("head")[0].removeChild(newViewportMeta);
      }
      if (viewportMeta) {
        document.getElementsByTagName("head")[0].appendChild(viewportMeta);
      }
    }
    let _parentAudioCtx = null;
    const getParentAudioCtx = () => {
      if (_parentAudioCtx)
        return _parentAudioCtx;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx)
          return null;
        _parentAudioCtx = new AudioCtx();
      } catch (e) {
      }
      return _parentAudioCtx;
    };
    const playParentSound = () => {
      const ctx = getParentAudioCtx();
      if (!ctx)
        return;
      ctx.resume().then(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }).catch((_err) => {
      });
    };
    const renderBadge = (count) => {
      if (!launcherIframeDocument)
        return;
      const launcherBtn = launcherIframeDocument.querySelector(".erxes-launcher");
      if (!launcherBtn)
        return;
      let badge = launcherIframeDocument.getElementById("erxes-unread-badge");
      if (count > 0) {
        if (!badge) {
          badge = launcherIframeDocument.createElement("span");
          badge.id = "erxes-unread-badge";
          badge.setAttribute("aria-hidden", "true");
          badge.style.cssText = "position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-sizing:border-box;pointer-events:none;line-height:1;font-family:sans-serif;z-index:1;";
          launcherBtn.appendChild(badge);
        }
        badge.textContent = count > 99 ? "99+" : String(count);
      } else if (badge) {
        badge.remove();
      }
    };
    const updateLauncherLabel = () => {
      const launcherBtn = launcherIframeDocument == null ? void 0 : launcherIframeDocument.querySelector(".erxes-launcher");
      if (!launcherBtn) {
        return;
      }
      launcherBtn.setAttribute(
        "aria-label",
        isMessengerVisible ? "Close messenger" : lastUnreadCount > 0 ? `Open messenger, ${lastUnreadCount} unread` : "Open messenger"
      );
      launcherBtn.setAttribute("aria-expanded", String(isMessengerVisible));
    };
    const updateLauncherBadge = (count) => {
      lastUnreadCount = count;
      renderBadge(count);
      updateLauncherLabel();
    };
    const handleLauncherClick = () => {
      var _a;
      (_a = getParentAudioCtx()) == null ? void 0 : _a.resume();
      setMessengerVisible(!wantsMessengerVisible);
    };
    const setMessengerVisible = (isVisible) => {
      wantsMessengerVisible = isVisible;
      if (isVisible) {
        writeLauncherCache({ engaged: true });
      }
      if (isMessengerLoaded) {
        postVisibilityToContentWindow();
      } else if (isVisible) {
        mountMessenger();
      }
    };
    const applyLauncherLook = (look) => {
      const launcherBtn = launcherIframeDocument == null ? void 0 : launcherIframeDocument.querySelector(".erxes-launcher");
      if (!launcherBtn) {
        return;
      }
      hasCustomLogo = Boolean(look.logoUrl);
      backgroundImage = hasCustomLogo ? `url(${look.logoUrl})` : defaultLogo;
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
      background-color: ${look.color};
      color: ${look.foreground || "#673fbd"};
      background-image: ${backgroundImage};
      background-size: ${hasCustomLogo ? "32px" : "18px"};
      background-position: center;
    `;
      if (isMessengerVisible) {
        launcherBtn.style.backgroundImage = "none";
        launcherBtn.innerHTML = CLOSE_ICON_STRING;
      }
      launcherIframe.style.visibility = "visible";
      launcherIframe.style.opacity = "1";
    };
    const hideLauncher = () => {
      launcherIframe.style.visibility = "hidden";
      launcherIframe.style.opacity = "0";
    };
    const handleLauncherIframeLoad = () => __async(this, null, function* () {
      var _a;
      launcherIframeDocument = launcherIframe.contentDocument || ((_a = launcherIframe == null ? void 0 : launcherIframe.contentWindow) == null ? void 0 : _a.document);
      if (launcherIframeDocument) {
        launcherIframeDocument.documentElement.style.colorScheme = "light";
        launcherIframeDocument.documentElement.style.background = "transparent";
        launcherIframeDocument.body.style.background = "transparent";
        launcherIframeDocument.body.style.margin = "0";
        const launcherStyle = launcherIframeDocument.createElement("style");
        launcherStyle.textContent = ".erxes-launcher{border:0;padding:0;margin:0;font:inherit;appearance:none}.erxes-launcher:focus{outline:none}.erxes-launcher:focus-visible{outline:2px solid #fff;outline-offset:-5px;box-shadow:inset 0 0 0 3px rgba(0,0,0,.6)}";
        launcherIframeDocument.head.appendChild(launcherStyle);
        const launcherBtn = launcherIframeDocument.createElement("button");
        launcherBtn.type = "button";
        launcherBtn.className = "erxes-launcher";
        launcherIframeDocument.body.appendChild(launcherBtn);
        updateLauncherLabel();
        launcherBtn.addEventListener("click", handleLauncherClick);
        launcherBtn.addEventListener("pointerenter", mountMessenger);
        const cache = readLauncherCache();
        if (cache == null ? void 0 : cache.savedAt) {
          applyLauncherLook(cache);
        }
      }
    });
    const launcherContainer = document.createElement("div");
    launcherContainer.className = "erxes-launcher-container";
    const launcherIframe = document.createElement("iframe");
    launcherIframe.id = "erxes-launcher";
    launcherIframe.className = "erxes-launcher";
    launcherIframe.src = "about:blank";
    launcherIframe.title = "Messenger launcher";
    launcherIframe.style.visibility = "hidden";
    launcherContainer.appendChild(launcherIframe);
    launcherIframe.addEventListener("load", handleLauncherIframeLoad);
    erxesWidgetContainer.append(messengerIframeContainer, launcherContainer);
    document.body.appendChild(erxesWidgetContainer);
    function mountMessenger() {
      if (isMessengerMounted) {
        return;
      }
      isMessengerMounted = true;
      messengerIframe.src = messengerUrl;
      messengerIframeContainer.appendChild(messengerIframe);
    }
    const handleMessengerIframeLoad = () => __async(this, null, function* () {
      if (!messengerIframe || !messengerIframe.contentWindow) {
        console.error("Messenger: Iframe or content window is not available");
        return;
      }
      const contentWindow = messengerIframe.contentWindow;
      messengerIframe.style.display = "block";
      isMessengerLoaded = true;
      sendMessageToIframe(contentWindow);
      if (wantsMessengerVisible) {
        postVisibilityToContentWindow();
      }
    });
    const setErxesProperty = (name, value) => {
      const erxes = window.Erxes || {};
      erxes[name] = value;
      window.Erxes = erxes;
    };
    setErxesProperty("showMessenger", () => setMessengerVisible(true));
    messengerIframe.addEventListener("load", handleMessengerIframeLoad);
    const scheduleEarlyConnect = () => {
      const connectWhenIdle = () => setTimeout(() => {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(mountMessenger, { timeout: 5e3 });
        } else {
          mountMessenger();
        }
      }, EARLY_CONNECT_DELAY);
      if (document.readyState === "complete") {
        connectWhenIdle();
      } else {
        window.addEventListener("load", connectWhenIdle, { once: true });
      }
    };
    const startMessenger = () => {
      var _a;
      if ((_a = getMessengerSettings()) == null ? void 0 : _a.eager) {
        mountMessenger();
      } else if (needsEarlyConnect()) {
        scheduleEarlyConnect();
      }
    };
    startMessenger();
    erxesWidgetContainer.refreshErxesMessenger = () => {
      if (isMessengerLoaded && messengerIframe.contentWindow) {
        sendMessageToIframe(messengerIframe.contentWindow);
        return;
      }
      const cache = readLauncherCache();
      if (cache == null ? void 0 : cache.savedAt) {
        applyLauncherLook(cache);
      } else {
        hideLauncher();
      }
      startMessenger();
    };
    const postVisibilityToContentWindow = () => {
      if (!messengerIframe || !messengerIframe.contentWindow) {
        return;
      }
      messengerIframe.contentWindow.postMessage(
        {
          fromPublisher: true,
          action: "toggleMessenger",
          isVisible: wantsMessengerVisible
        },
        "*"
      );
    };
    const handleMessageEvent = (event) => __async(this, null, function* () {
      const { data } = event;
      if (data.fromErxes && data.message === "connected" && data.apiUrl) {
        baseUrl = data.apiUrl;
      }
      if (data.fromErxes && data.connectionInfo) {
        const { connectionInfo } = data;
        const { widgetsMessengerConnect } = connectionInfo || {};
        const { uiOptions } = widgetsMessengerConnect || {};
        if (!uiOptions) {
          return console.error("Messenger: uiOptions is not defined");
        }
        if (!(launcherIframeDocument == null ? void 0 : launcherIframeDocument.querySelector(".erxes-launcher"))) {
          return console.error("Messenger: launcher element is not defined");
        }
        const { primary, launcherLogo: logo } = uiOptions;
        const look = {
          color: primary == null ? void 0 : primary.DEFAULT,
          foreground: primary == null ? void 0 : primary.foreground,
          logoUrl: logo ? `${baseUrl}/read-file?key=${encodeURIComponent(logo)}` : ""
        };
        applyLauncherLook(look);
        writeLauncherCache(__spreadValues(__spreadProps(__spreadValues({}, look), {
          savedAt: Date.now()
        }), widgetsMessengerConnect.customerId ? { engaged: true } : {}));
      }
    });
    window.addEventListener("message", handleMessageEvent);
    window.addEventListener("message", (event) => __async(this, null, function* () {
      var _a;
      const { data } = event;
      const { isVisible, message, isSmallContainer } = data || {};
      listenForCommonRequests(event, messengerIframe);
      if (data.fromErxes && data.source === "fromMessenger") {
        if (message === "playSound") {
          playParentSound();
          return;
        }
        if (message === "unreadCount") {
          updateLauncherBadge((_a = data.count) != null ? _a : 0);
          return;
        }
        const launcher = launcherIframeDocument == null ? void 0 : launcherIframeDocument.querySelector(".erxes-launcher");
        if (!launcher) {
          return console.error("Messenger: launcher element is not defined");
        }
        if (isMobile) {
          document.body.classList.toggle("widget-mobile", isVisible);
        }
        if (message === "expandMessenger") {
          messengerIframeContainer.classList.remove("erxes-messenger-shown");
          messengerIframeContainer.classList.add("erxes-messenger-expand");
        }
        if (message === "collapseMessenger") {
          messengerIframeContainer.classList.remove("erxes-messenger-expand");
          messengerIframeContainer.classList.add("erxes-messenger-shown");
        }
        if (message === "messenger") {
          if (isMobile && isVisible) {
            renewViewPort();
          } else {
            revertViewPort();
          }
          if (isVisible) {
            isMessengerVisible = true;
            messengerIframeContainer.classList.add("erxes-messenger-shown");
            messengerIframeContainer.classList.remove("erxes-messenger-hidden");
            launcher.style.backgroundImage = "none";
            launcher.innerHTML = CLOSE_ICON_STRING;
            renderBadge(0);
          } else {
            isMessengerVisible = false;
            messengerIframeContainer.classList.remove(
              "erxes-messenger-shown",
              "erxes-messenger-expand"
            );
            messengerIframeContainer.classList.add("erxes-messenger-hidden");
            launcher.style.backgroundImage = backgroundImage;
            launcher.style.backgroundSize = hasCustomLogo ? "32px" : "18px";
            launcher.innerHTML = "";
            renderBadge(lastUnreadCount);
          }
          wantsMessengerVisible = isMessengerVisible;
          updateLauncherLabel();
        }
        if ("isSmallContainer" in (data || {})) {
          erxesWidgetContainer.classList.toggle("small", isSmallContainer);
        }
      }
    }));
    let lastNotifiedUrl = window.location.pathname;
    const notifyLocationChange = () => {
      const currentUrl = window.location.pathname;
      if (currentUrl === lastNotifiedUrl)
        return;
      lastNotifiedUrl = currentUrl;
      if (!messengerIframe.contentWindow)
        return;
      messengerIframe.contentWindow.postMessage(
        {
          fromPublisher: true,
          action: "locationChange",
          url: currentUrl
        },
        "*"
      );
    };
    const patchHistoryMethod = (methodName) => {
      const original = history[methodName].bind(history);
      history[methodName] = (data, unused, url) => {
        original(data, unused, url);
        notifyLocationChange();
      };
    };
    patchHistoryMethod("pushState");
    patchHistoryMethod("replaceState");
    window.addEventListener("popstate", notifyLocationChange);
    window.addEventListener("hashchange", notifyLocationChange);
  })();
})();
//# sourceMappingURL=messengerBundle.js.map
