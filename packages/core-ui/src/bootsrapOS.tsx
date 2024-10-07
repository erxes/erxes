import "@nateradebaugh/react-datetime/css/react-datetime.css";
import "abortcontroller-polyfill/dist/polyfill-patch-fetch";
import "erxes-icon/css/erxes.min.css";

import { getEnv, readFile } from "modules/common/utils";

import { ApolloProvider } from "@apollo/client";
// global style
import { GlobalStyle } from "@erxes/ui/src/styles/global-styles";
import React from "react";
import { createRoot } from "react-dom/client";
import dayjs from "dayjs";
import { getThemeItem } from "@erxes/ui/src/utils/core";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc, { parseLocal: true });

const root = createRoot(document.getElementById("root") as any);
const envs = getEnv();

fetch(`${envs.REACT_APP_API_URL}/initial-setup?envs=${JSON.stringify(envs)}`, {
  credentials: "include"
})
  .then(response => response.text())
  .then(res => {
    if (res !== "no owner") {
      localStorage.setItem("erxes_theme_configs", res);

      const link = document.createElement("link");
      link.id = "favicon";
      link.rel = "shortcut icon";

      const favicon = getThemeItem("favicon");
      link.href =
        favicon && typeof favicon === "string"
          ? readFile(favicon)
          : "/favicon.png";

      document.head.appendChild(link);
    }

    const apolloClient = require("./apolloClient").default;
    const { OwnerDescription } = require("modules/auth/components/OwnerSetup");
    const OwnerSetup = require("modules/auth/containers/OwnerSetup").default;
    const Routes = require("./routes").default;
    const AuthLayout =
      require("@erxes/ui/src/layout/components/AuthLayout").default;

    if (envs.REACT_APP_APM_SERVER_URL) {
      // TODO: Grafana Faro
    }

    let body = <Routes />;

    if (res === "no owner") {
      body = (
        <AuthLayout
          col={{ first: 5, second: 6 }}
          content={<OwnerSetup />}
          description={<OwnerDescription />}
        />
      );
    }

    return root.render(
      <ApolloProvider client={apolloClient}>
        <GlobalStyle />
        {body}
      </ApolloProvider>
    );
  });
