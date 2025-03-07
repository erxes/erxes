import React from "react";
import GeneralRoutes from "./generalRoutes";
import { PluginLayout } from "@erxes/ui/src/styles/main";
import "@erxes/ui/src/styles/global-styles";
import "erxes-icon/css/erxes.min.css";
import "@erxes/ui/src/styles/style.min.css";
import { AppProvider } from "@erxes/ui/src/appContext";
import { dummyUser } from "@erxes/ui/src/constants/dummy-data";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

const App = () => {
  return (
    <AppProvider currentUser={dummyUser}>
      <PluginLayout>
        <GeneralRoutes />
      </PluginLayout>
    </AppProvider>
  );
};

export default App;
