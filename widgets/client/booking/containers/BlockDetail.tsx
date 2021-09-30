import * as React from 'react';
import BlockDetail from '../components/BlockDetail';
import { AppConsumer } from './AppContext';
import { IProductCategory } from '../types';

type Props = {
  goToBookings: () => void;
  block: IProductCategory | null;
};

function BlockDetailContainer(props: Props) {
  const extendedProps = {
    ...props
  };

  return <BlockDetail {...extendedProps} />;
}

const WithContext = () => {
  return (
    <AppConsumer>
      {({ activeBlock, goToBookings }) => {
        return (
          <BlockDetailContainer
            block={activeBlock}
            goToBookings={goToBookings}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithContext;
