import * as React from "react";
import { ApolloProvider } from "react-apollo";
import * as ReactDOM from "react-dom";
import client from "../apollo-client";
import { connection } from "./connection";
import asyncComponent from "../AsyncComponent";

const KnowledgeBase = asyncComponent(() =>
  import(
    /* webpackChunkName: "knowledgebaseApp" */ './containers/KnowledgeBase'
  )
);

const render = () => {
  // render root react component
  ReactDOM.render(
    <ApolloProvider client={client}>
      <KnowledgeBase />
    </ApolloProvider>,

    document.getElementById("root")
  );
};

const settings = (window as any).knowledgebaseSettings;

if (settings) {
  connection.setting = settings;
  render();
} else {
  window.addEventListener("message", event => {
    const data = event.data;

    if (!(data.fromPublisher && data.setting)) {
      return;
    }

    connection.setting = event.data.setting;

    render();
  });
}
