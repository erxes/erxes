import React from 'react';
import { AppConsumer } from 'coreui/appContext';

const withConsumer = (WrappedComponent: any) => {
  return props => (
    <AppConsumer>
      {(context: any) => <WrappedComponent {...props} {...context} />}
    </AppConsumer>
  );
};

export default withConsumer;
