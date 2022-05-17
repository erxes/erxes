declare const window: any;

// css
import {
  generateIntegrationUrl,
  getStorage,
  listenForCommonRequests
} from "../../widgetUtils";
import "./index.css";

// meta
const meta = document.createElement("meta");
meta.name = "viewport";
meta.content = "initial-scale=1, width=device-width";
document.getElementsByTagName("head")[0].appendChild(meta);

const iframeId = "erxes-booking-iframe";
const container = "erxes-booking-container";

// container
const erxesContainer = document.createElement("div");
erxesContainer.id = container;
erxesContainer.className = "";

// add iframe
const iframe = document.createElement("iframe");
iframe.id = iframeId;
iframe.src = generateIntegrationUrl("booking");
iframe.style.display = "none";

erxesContainer.appendChild(iframe);

const embedContainer = document.querySelector("[data-erxes-booking]");

const trackIframe = () => {
  // after iframe load send connection info
  iframe.onload = () => {
    iframe.style.display = "block";

    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          fromPublisher: true,
          setting: window.erxesSettings.booking,
          storage: getStorage()
        },
        "*"
      );
    }
  };
};

if (!embedContainer) {
  console.log(
    'Please create a "div" element with an attribute named "data-erxes-booking"'
  );
} else {
  embedContainer.appendChild(erxesContainer);
  trackIframe();
}

// listen for messages from widget
window.addEventListener("message", async (event: MessageEvent) => {
  listenForCommonRequests(event, iframe);

  return null;
});
