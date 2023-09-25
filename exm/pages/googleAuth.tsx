import AppProvider, { AppConsumer } from "../modules/appContext";

import GoogleAuthContainer from "../modules/user/containers/GoogleAuth";

export default function GoogleAuth() {
  return (
    <AppProvider>
      <AppConsumer>
        {({ config }: any) => {
          return <GoogleAuthContainer {...{ config }} />;
        }}
      </AppConsumer>
    </AppProvider>
  );
}
