import * as React from "react";
import { ApolloProvider } from "react-apollo";
import * as ReactDOM from "react-dom";
import client from "../apollo-client";
import { connection } from "./connection";
import { KnowledgeBase } from "./containers";
import "./sass/style.scss";

window.addEventListener("message", event => {
  const data = event.data;

  if (!(data.fromPublisher && data.setting)) {
    return;
  }

  connection.setting = event.data.setting;

  // render root react component
  ReactDOM.render(
    <ApolloProvider client={client}>
      <KnowledgeBase />
    </ApolloProvider>,

    document.getElementById("root")
  );
});
