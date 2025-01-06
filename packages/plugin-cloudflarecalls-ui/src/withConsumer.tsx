import React from 'react';
import { AppConsumer } from '@erxes/ui/src/appContext';

const withConsumer = (WrappedComponent: any) => {
  return (props) => (
    <AppConsumer>
      {(context: any) => <WrappedComponent {...props} {...context} />}
    </AppConsumer>
  );
};

export default withConsumer;
