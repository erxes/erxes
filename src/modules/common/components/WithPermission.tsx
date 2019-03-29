import { AppConsumer } from 'appContext';
import * as React from 'react';

type FinalProps = {
  can: (action: string) => React.ReactNode;
} & Props;

class WithPermission extends React.Component<FinalProps> {
  render() {
    const { action, children, can } = this.props;

    if (!can(action)) {
      return null;
    }

    return children;
  }
}

type Props = {
  action: string;
  children: React.ReactNode;
};

const WithConsumer = (props: Props) => {
  return (
    <AppConsumer>
      {({ can }) => <WithPermission {...props} can={can} />}
    </AppConsumer>
  );
};

export default WithConsumer;
