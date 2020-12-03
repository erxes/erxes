/*
 * Event's embeddable script
 */

import { generateIntegrationUrl, setErxesProperty } from "../../widgetUtils";

// add iframe
const iframe = document.createElement("iframe");

iframe.src = generateIntegrationUrl("events");
iframe.style.display = "none";

document.body.appendChild(iframe);

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
        args
      },
      "*"
    );
  };

  setErxesProperty("identifyCustomer", (args: any) => {
    sendMessage("identifyCustomer", args);
  });

  setErxesProperty("updateCustomerProperty", (name: string, value: any) => {
    sendMessage("updateCustomerProperty", { name, value });
  });

  setErxesProperty("sendEvent", (args: any) => {
    sendMessage("sendEvent", args);
  });

  sendMessage("init", { url: window.location.href });
};
