// css
import "./index.css";

import {
  generateIntegrationUrl,
  getStorage,
  listenForCommonRequests,
  setErxesProperty
} from "../../widgetUtils";

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

const delay = 350;

if (isMobile) {
  viewportMeta = document.querySelector('meta[name="viewport"]');
}

function renewViewPort() {
  if (viewportMeta) {
    document.getElementsByTagName("head")[0].removeChild(viewportMeta);
  }

  newViewportMeta = document.createElement("meta");
  newViewportMeta.name = "viewport";
  newViewportMeta.content =
    "initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width";
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

const iframeId = "erxes-messenger-iframe";
const container = "erxes-messenger-container";

// container
const erxesContainer = document.createElement("div");
erxesContainer.id = container;
erxesContainer.className = "erxes-messenger-hidden";

// add iframe
const iframe: any = document.createElement("iframe");

iframe.id = iframeId;
iframe.src = generateIntegrationUrl("messenger");
iframe.style.display = "none";
iframe.allow = "camera *;microphone *";

erxesContainer.appendChild(iframe);
document.body.appendChild(erxesContainer);

// after iframe load send connection info
iframe.onload = async () => {
  iframe.style.display = "block";

  const contentWindow = iframe.contentWindow;

  if (!contentWindow) {
    return;
  }

  const setting = window.erxesSettings.messenger;

  setErxesProperty("showMessenger", () => {
    contentWindow.postMessage(
      {
        fromPublisher: true,
        action: "showMessenger"
      },
      "*"
    );
  });

  contentWindow.postMessage(
    {
      fromPublisher: true,
      setting,
      storage: getStorage()
    },
    "*"
  );
};

// listen for widget toggle
window.addEventListener("message", async (event: MessageEvent) => {
  const data = event.data;
  const { isVisible, message, isSmallContainer } = data;

  listenForCommonRequests(event, iframe);

  if (data.fromErxes && data.source === "fromMessenger") {
    if (isMobile) {
      document.body.classList.toggle("widget-mobile", isVisible);
    }

    if (message === "messenger") {
      if (isMobile && isVisible) {
        renewViewPort();
      } else {
        revertViewPort();
      }

      clearTimer();

      if (isVisible) {
        erxesContainer.className = "erxes-messenger-shown";
      } else {
        delaydSetClass("erxes-messenger-hidden");
      }

      erxesContainer.classList.toggle("small", isSmallContainer);
      document.body.classList.toggle("messenger-widget-shown", isVisible);
    }

    if (message === "notifier") {
      clearTimer();
      delaydToggleClass("erxes-notifier-shown", isVisible);

      // change container div dimension
      if (!isVisible) {
        delaydSetClass("erxes-messenger-hidden");
      }
    }

    if (message === "notifierFull") {
      clearTimer();

      // add class and hide notifier
      if (isVisible) {
        erxesContainer.className += " erxes-notifier-shown fullMessage";
      } else {
        delaydSetClass("erxes-messenger-hidden");
      }
    }
  }
});
