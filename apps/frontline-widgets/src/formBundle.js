"use strict";
(() => {
  var __defProp = Object.defineProperty;
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

  // apps/frontline-widgets/src/formstyle.css
  var formstyle_default = "[id^='erxes-container'] {\n  z-index: 1000000000;\n  border: none;\n}\n\n[id^='erxes-container'] > iframe {\n  border: none;\n  height: 100% !important;\n}\n\n/*loader*/\n[data-erxes-embed] {\n  position: relative;\n  background: rgba(0, 0, 0, 0.03);\n  border-radius: 4px;\n  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);\n}\n\n.hidden {\n  display: none !important;\n}\n\n@media only screen and (max-width: 420px) {\n  [id^='erxes-container'] {\n    width: 100%;\n    max-height: none;\n  }\n\n  [id^='erxes-iframe'] {\n    bottom: 0;\n    right: 0;\n  }\n}\n\n.erxes-modal-iframe {\n  position: fixed; /* Stay in place */\n  z-index: 1000000; /* Sit on top */\n  left: 0;\n  top: 0;\n  bottom: 0;\n  min-width: 100%; /* Full width */\n  border: none;\n  height: 100% !important;\n}\n\n.erxes-slide-right-iframe,\n.erxes-slide-left-iframe {\n  position: fixed;\n  bottom: 5px;\n  border-radius: 10px;\n  width: 380px;\n  max-height: 100%;\n  max-height: calc(100% - 10px);\n  animation-delay: 1s;\n  -webkit-animation-delay: 1s;\n  -webkit-animation-duration: 0.3s;\n  animation-duration: 0.3s;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n  box-shadow: 0 3px 20px 0px rgba(0, 0, 0, 0.3);\n  overflow: hidden;\n}\n\n/* slide in left */\n.erxes-slide-left-iframe {\n  left: 5px;\n  animation: fadeInLeft 0.3s;\n  -webkit-animation: fadeInLeft 0.3s;\n}\n\n/* slide in right */\n.erxes-slide-right-iframe {\n  right: 5px;\n  animation: fadeInRight 0.3s;\n  -webkit-animation: fadeInRight 0.3s;\n}\n\n/* embeded form */\n.erxes-embedded-iframe {\n  position: initial !important;\n  margin: 0 auto;\n  height: 100%;\n  border-radius: 4px;\n  box-shadow: 0 3px 18px -2px rgba(0, 0, 0, 0.2);\n}\n\n/* dropdown */\n.erxes-dropdown-iframe {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  animation-delay: 1s;\n  -webkit-animation-delay: 1s;\n  animation: fadeInDown;\n  -webkit-animation: fadeInDown;\n  -webkit-animation-duration: 0.3s;\n  animation-duration: 0.3s;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n  max-height: 100%;\n  box-shadow: 0 3px 20px -2px rgba(0, 0, 0, 0.3);\n}\n\n/* shoutbox */\n.erxes-shoutbox-iframe {\n  position: fixed;\n  bottom: 0px;\n  right: 0px;\n  width: 416px;\n  height: 100%;\n  max-height: 100%;\n  max-height: calc(100% - 10px);\n}\n\n.erxes-shoutbox-iframe.erxes-hidden {\n  width: 96px;\n}\n\n/* animations */\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n@-webkit-keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n@-webkit-keyframes fadeInDown {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes fadeInDown {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n    transform: translate3d(0, -100%, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.fadeInDown {\n  -webkit-animation-name: fadeInDown;\n  animation-name: fadeInDown;\n}\n\n@-webkit-keyframes fadeInLeft {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes fadeInLeft {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n    transform: translate3d(-100%, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.fadeInLeft {\n  -webkit-animation-name: fadeInLeft;\n  animation-name: fadeInLeft;\n}\n\n@-webkit-keyframes fadeInRight {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n@keyframes fadeInRight {\n  from {\n    opacity: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n    transform: translate3d(100%, 0, 0);\n  }\n\n  to {\n    opacity: 1;\n    -webkit-transform: translate3d(0, 0, 0);\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.fadeInRight {\n  -webkit-animation-name: fadeInRight;\n  animation-name: fadeInRight;\n}\n";

  // apps/frontline-widgets/src/lib/utils.ts
  var getLocalStorageItem = (key) => {
    return localStorage.getItem(key);
  };

  // apps/frontline-widgets/src/formIndex.ts
  var styleElement = document.createElement("style");
  styleElement.textContent = formstyle_default;
  document.head.appendChild(styleElement);
  var generateIntegrationUrl = () => {
    const script = document.currentScript || (() => {
      const scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();
    if (script && script instanceof HTMLScriptElement) {
      return script.src.replace(`/formBundle.js`, `/form`);
    }
    return "";
  };
  var setErxesProperty = (name, value) => {
    const erxes = window.Erxes || {};
    erxes[name] = value;
    window.Erxes = erxes;
  };
  var getBrowserInfo = () => __async(void 0, null, function* () {
    if (window.location.hostname === "localhost") {
      return {
        url: window.location.pathname,
        hostname: window.location.href,
        language: navigator.language,
        userAgent: navigator.userAgent,
        countryCode: "MN"
      };
    }
    let location;
    try {
      const response = yield fetch("https://geo.erxes.io");
      location = yield response.json();
    } catch (e) {
      location = {
        city: "",
        remoteAddress: "",
        region: "",
        country: "",
        countryCode: ""
      };
    }
    return {
      remoteAddress: location.network,
      region: location.region,
      countryCode: location.countryCode,
      city: location.city,
      country: location.countryName,
      url: window.location.pathname,
      hostname: window.location.origin,
      language: navigator.language,
      userAgent: navigator.userAgent
    };
  });
  var listenForCommonRequests = (event, iframe) => __async(void 0, null, function* () {
    const { message, fromErxes, source, key, value } = event.data;
    if (fromErxes && (iframe == null ? void 0 : iframe.contentWindow)) {
      if (message === "requestingBrowserInfo") {
        iframe.contentWindow.postMessage(
          {
            fromPublisher: true,
            source,
            message: "sendingBrowserInfo",
            browserInfo: yield getBrowserInfo()
          },
          "*"
        );
      }
      if (message === "setLocalStorageItem") {
        const erxesStorage = JSON.parse(localStorage.getItem("erxes") || "{}");
        erxesStorage[key] = value;
        localStorage.setItem("erxes", JSON.stringify(erxesStorage));
      }
    }
  });
  var meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "initial-scale=1, width=device-width";
  document.getElementsByTagName("head")[0].appendChild(meta);
  var createIframe = (settings) => {
    const formId = settings.form_id;
    const containerId = `erxes-container-${formId}`;
    const iframeId = `erxes-iframe-${formId}`;
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
    }
    let iframe = document.getElementById(iframeId);
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = iframeId;
      iframe.style.display = "none";
      iframe.style.width = "100%";
      iframe.style.margin = "0 auto";
      iframe.style.height = "auto";
      iframe.allowFullscreen = true;
    }
    iframe.src = generateIntegrationUrl();
    container.appendChild(iframe);
    const embedContainer = document.querySelector(
      `[data-erxes-embed="${formId}"]`
    );
    if (embedContainer) {
      embedContainer.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
    iframe.onload = () => {
      iframe.style.display = "inherit";
      const handlerSelector = `[data-erxes-modal="${settings.form_id}"]`;
      const contentWindow = iframe.contentWindow;
      if (!contentWindow) {
        return;
      }
      const modifiedSettings = __spreadValues({}, settings);
      if (modifiedSettings.onAction) {
        delete modifiedSettings.onAction;
      }
      contentWindow.postMessage(
        {
          fromPublisher: true,
          hasPopupHandlers: document.querySelectorAll(handlerSelector).length > 0,
          settings: modifiedSettings,
          storage: getLocalStorageItem("erxes")
        },
        "*"
      );
    };
    return { container, iframe };
  };
  var postMessageToOne = (formId, data) => {
    const settingsAsString = Object.keys(iframesMapping).find((sas) => {
      const settings = JSON.parse(sas);
      return formId === settings.form_id;
    });
    if (!settingsAsString) {
      return;
    }
    const { iframe } = iframesMapping[settingsAsString];
    const contentWindow = iframe.contentWindow;
    if (!contentWindow) {
      return;
    }
    contentWindow.postMessage(
      __spreadValues({
        fromPublisher: true,
        formId
      }, data),
      "*"
    );
  };
  setErxesProperty("showPopup", (id) => {
    postMessageToOne(id, { action: "showPopup" });
  });
  setErxesProperty("callFormSubmit", (id) => {
    postMessageToOne(id, { action: "callSubmit" });
  });
  setErxesProperty("sendExtraFormContent", (id, html) => {
    postMessageToOne(id, { action: "extraFormContent", html });
  });
  var formSettings = window.erxesSettings.forms || [];
  var iframesMapping = {};
  var getMappingKey = (settings) => JSON.stringify({
    form_id: settings.form_id,
    channel_id: settings.channel_id
  });
  var getSettings = (settings) => formSettings.find(
    (s) => s.channel_id === settings.channel_id && s.form_id === settings.form_id
  );
  formSettings.forEach((formSettings2) => {
    iframesMapping[getMappingKey(formSettings2)] = createIframe(formSettings2);
  });
  window.addEventListener("message", (event) => __async(void 0, null, function* () {
    const data = event.data || {};
    const { fromErxes, source, message, settings } = data;
    if (!settings || source !== "fromForms") {
      return null;
    }
    const { container, iframe } = iframesMapping[getMappingKey(settings)] || {};
    listenForCommonRequests(event, iframe);
    const completeSettings = getSettings(settings);
    if (!completeSettings) {
      return null;
    }
    if (!(fromErxes && source === "fromForms")) {
      return null;
    }
    if (message === "submitResponse" && completeSettings.onAction) {
      completeSettings.onAction(data);
    }
    if (message === "connected") {
      const loadType = data.connectionInfo.widgetsLeadConnect.form.leadData.loadType;
      if (loadType === "popup") {
        const selector = `[data-erxes-modal="${settings.form_id}"]`;
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
          const elm = elements[i];
          elm.addEventListener("click", () => {
            iframe == null ? void 0 : iframe.contentWindow.postMessage(
              {
                fromPublisher: true,
                action: "showPopup",
                formId: settings.form_id
              },
              "*"
            );
          });
        }
      }
    }
    if (message === "changeContainerClass" && container) {
      container.className = data.className;
    }
    if (message === "changeContainerStyle" && container) {
      container.style = data.style;
    }
    return null;
  }));
})();
//# sourceMappingURL=formBundle.js.map
