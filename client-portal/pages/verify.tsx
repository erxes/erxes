import AppProvider, { AppConsumer } from '../modules/appContext';
import { Store } from '../modules/types';
import VerifyContainer from '../modules/user/containers/Verify';

export default function VerifyPage() {
  return (
    <AppProvider>
      <AppConsumer>
        {({ config }: Store) => {
          return <VerifyContainer {...{ config }} />;
        }}
      </AppConsumer>
    </AppProvider>
  );
}
