import * as dayjs from "dayjs";
import * as localizedFormat from "dayjs/plugin/localizedFormat";
import * as relativeTime from "dayjs/plugin/relativeTime";
import "erxes-icon/css/erxes.min.css";

import * as React from "react";
import { ApolloProvider } from "react-apollo";
import * as ReactDOM from "react-dom";
import client from "../apollo-client";
import { connection } from "./connection";
import { KnowledgeBase } from "./containers";
import "./sass/style.scss";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

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
