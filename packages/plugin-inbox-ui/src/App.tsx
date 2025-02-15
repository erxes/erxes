import "@erxes/ui/src/styles/global-styles.ts";
import "erxes-icon/css/erxes.min.css";
import "@erxes/ui/src/styles/style.min.css";
import "@nateradebaugh/react-datetime/css/react-datetime.css";

import { AppProvider } from "coreui/appContext";
import GeneralRoutes from "./generalRoutes";
import { PluginLayout } from "@erxes/ui/src/styles/main";
import React from "react";
import dayjs from "dayjs";
import { dummyUser } from "@erxes/ui/src/constants/dummy-data";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const App = () => {
  return (
    <PluginLayout>
      <AppProvider currentUser={dummyUser}>
        <GeneralRoutes />
      </AppProvider>
    </PluginLayout>
  );
};

export default App;
