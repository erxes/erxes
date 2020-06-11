declare const window: any;

/*
 * Knowledge base's embeddable script
 */

// css
import { generateIntegrationUrl } from "../../utils";
import "./index.css";

// meta
const meta = document.createElement("meta");
meta.name = "viewport";
meta.content = "initial-scale=1, width=device-width";
document.getElementsByTagName("head")[0].appendChild(meta);

const iframeId = "erxes-knowledge-iframe";
const container = "erxes-knowledge-container";

// container
const erxesContainer = document.createElement("div");
erxesContainer.id = container;
erxesContainer.className = "";

// add iframe
const iframe = document.createElement("iframe");
iframe.id = iframeId;
iframe.src = generateIntegrationUrl("knowledgebase");
iframe.style.display = "none";

erxesContainer.appendChild(iframe);

const embedContainer = document.querySelector("[data-erxes-kbase]");

const trackIframe = () => {
  // after iframe load send connection info
  iframe.onload = () => {
    iframe.style.display = "block";

    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          fromPublisher: true,
          setting: window.erxesSettings.knowledgeBase
        },
        "*"
      );
    }
  };
};

if (!embedContainer) {
  console.log(
    'Please create a "div" element with an attribute named "data-erxes-kbase"'
  ); // eslint-disable-line
} else {
  embedContainer.appendChild(erxesContainer);
  trackIframe();
}
