/*
 * Event's embeddable script
 */

import {
  generateIntegrationUrl,
  getStorage,
  setErxesProperty,
} from "../../widgetUtils";

// add iframe
const iframe = document.createElement("iframe");

const integrationUrl = generateIntegrationUrl("events");
iframe.src = integrationUrl;
iframe.style.display = "none";

document.body.appendChild(iframe);

// extract the target origin from the integration URL
const url = new URL(integrationUrl);
const targetOrigin = url.origin; // e.g., "https://example.com"

// after iframe load send connection info
iframe.onload = async () => {
  const contentWindow = iframe.contentWindow;

  if (!contentWindow) {
    return;
  }

  const sendMessage = (action: string, args: any) => {
    contentWindow.postMessage(
      {
        fromPublisher: true,
        action,
        storage: getStorage(),
        args,
      },
      targetOrigin
    );
  };

  setErxesProperty("identifyCustomer", (args: any) => {
    sendMessage("identifyCustomer", args);
  });

  setErxesProperty(
    "updateCustomerProperties",
    (data: Array<{ name: string; value: any }>) => {
      sendMessage("updateCustomerProperties", data);
    }
  );

  setErxesProperty("sendEvent", (args: any) => {
    sendMessage("sendEvent", args);
  });

  sendMessage("init", { url: window.location.href });
};
