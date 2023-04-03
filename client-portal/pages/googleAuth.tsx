import AppProvider, { AppConsumer } from '../modules/appContext';
import { Store } from '../modules/types';
import GoogleAuthContainer from '../modules/user/containers/GoogleAuth';

export default function GoogleAuth() {
  return (
    <AppProvider>
      <AppConsumer>
        {({ config }: Store) => {
          return <GoogleAuthContainer {...{ config }} />;
        }}
      </AppConsumer>
    </AppProvider>
  );
}
