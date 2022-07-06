import client from "../apollo-client";
import { connection } from "./connection";
import gql from "graphql-tag";
import { initStorage } from "../common";
import widgetConnect from "../widgetConnect";
import { widgetsConnectMutation } from "./graphql";
import { IIntegration } from "../types";
import asyncComponent from "../AsyncComponent";

const App = asyncComponent(() => 
  import(/* webpackChunkName: "BookingApp" */ "./containers/App")
)

widgetConnect({
  postParams: {
    source: "fromForms"
  },

  connectMutation: (event: MessageEvent) => {
    const { setting, storage } = event.data;

    connection.setting = setting;

    initStorage(storage);

    // call connect mutation
    return client
      .mutate({
        mutation: gql(widgetsConnectMutation),
        variables: {
          _id: setting.integration_id
        }
      })
      .catch(e => {
        console.log(e.message);
      });
  },

  connectCallback: (data: { widgetsBookingConnect: IIntegration }) => {
    const response = data.widgetsBookingConnect;

    if (!response) {
      throw new Error("Integration not found");
    }

    // save connection info
    connection.data.integration = response;
  },

  AppContainer: App
});
