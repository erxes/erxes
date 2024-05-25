declare const window: any;

import {
  generateIntegrationUrl,
  getStorage,
  listenForCommonRequests,
} from "../../widgetUtils";
import "./index.css";

// Set up the meta tag for responsive design
const meta = document.createElement("meta");
meta.name = "viewport";
meta.content = "initial-scale=1, width=device-width";
document.getElementsByTagName("head")[0].appendChild(meta);

const iframeId = "erxes-booking-iframe";
const container = "erxes-booking-container";

// Create and set up the container div
const erxesContainer = document.createElement("div");
erxesContainer.id = container;
erxesContainer.className = "";

// Create the iframe for booking integration
const iframe = document.createElement("iframe");
iframe.id = iframeId;
iframe.src = generateIntegrationUrl("booking");
iframe.style.display = "none";
erxesContainer.appendChild(iframe);

// Locate the embedding container in the DOM
const embedContainer = document.querySelector("[data-erxes-booking]");

const trackIframe = () => {
  // Handle iframe loading
  iframe.onload = () => {
    iframe.style.display = "block";

    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          fromPublisher: true,
          setting: window.erxesSettings.booking,
          storage: getStorage(),
        },
        "https://secure.example.com" // Replace with your actual target origin
      );
    }
  };
};

if (!embedContainer) {
  console.error(
    'Please create a "div" element with an attribute named "data-erxes-booking"'
  );
} else {
  embedContainer.appendChild(erxesContainer);
  trackIframe();
}

// Handle incoming messages securely
window.addEventListener("message", function (event: MessageEvent) {
  if (event.origin !== "https://secure.example.com") {
    return; // Ensure the message is from a trusted origin
  }

  listenForCommonRequests(event, iframe);
});
