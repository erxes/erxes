import { getLocalStorageItem, setLocalStorageItem } from "../common";

const Events: any = {
  init(args: any) {
    const customerId = getLocalStorageItem("customerId");

    this.sendEvent({
      name: "pageView",
      customerId,
      attributes: { url: args.url }
    });
  },

  identifyCustomer(args: { email?: string; phone?: string; code?: string }) {
    this.sendRequest("events-identify-customer", { args });
  },

  updateCustomerProperty({ name, value }: { name: string; value: any }) {
    const customerId = getLocalStorageItem("customerId");

    this.sendRequest("events-update-customer-property", {
      customerId,
      name,
      value
    });
  },

  sendRequest(path: string, data: any) {
    const { API_URL } = process.env;

    fetch(`${API_URL}/${path}`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(response => {
        if (response.customerId) {
          setLocalStorageItem("customerId", response.customerId);
        }
      })
      .catch(errorResponse => {
        console.log(errorResponse);
      });
  },

  sendEvent(data: any) {
    this.sendRequest("events-receive", data);
  }
};

window.addEventListener("message", event => {
  const { data } = event;

  if (!data.fromPublisher) {
    return;
  }

  const { action, args } = data;

  Events[action](args);
});
