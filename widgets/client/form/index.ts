import gql from "graphql-tag";
import client from "../apollo-client";
import { getLocalStorageItem, initStorage } from "../common";
import { setLocale } from "../utils";
import widgetConnect from "../widgetConnect";
import { connection } from "./connection";
import { formConnectMutation,enabledServicesQuery } from "./graphql";
import { EnabledServices, IConnectResponse } from "./types";
import asyncComponent from "../AsyncComponent";

const App = asyncComponent(() =>
  import(/* webpackChunkName: "FormApp" */ './containers/App')
);

widgetConnect({
  postParams: {
    source: "fromForms"
  },

  connectMutation: (event: MessageEvent) => {
    const { setting, hasPopupHandlers, storage } = event.data;

    connection.setting = setting;
    connection.hasPopupHandlers = hasPopupHandlers;

    initStorage(storage);

    client.query({
      query: gql(enabledServicesQuery),
      fetchPolicy: "network-only"
    }).then((res: any) => {
      if (res.data.enabledServices) {
        const { enabledServices } = res.data as EnabledServices;
        connection.enabledServices = enabledServices;
      }
    });

    // call connect mutation
    return client
      .mutate({
        mutation: gql(formConnectMutation),
        variables: {
          brandCode: setting.brand_id,
          formCode: setting.form_id,
          cachedCustomerId: getLocalStorageItem("customerId")
        }
      })
      .catch(e => {
        console.log(e.message);
      });
  },

  connectCallback: (data: { widgetsLeadConnect: IConnectResponse }) => {
    const response = data.widgetsLeadConnect;

    if (!response) {
      throw new Error("Integration not found");
    }

    // save connection info
    connection.data = response;

    // set language
    setLocale(response.integration.languageCode || "en");
  },

  AppContainer: App
});
