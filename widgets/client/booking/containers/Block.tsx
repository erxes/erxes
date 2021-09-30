import * as React from 'react';
import Block from '../components/Block';
import { IProductCategory } from '../types';
import { AppConsumer } from './AppContext';

type Props = {
  block: IProductCategory;
};

function BlockContainer(props: Props) {
  return (
    <AppConsumer>
      {({ goToBlock }) => {
        return <Block {...props} goToBlock={goToBlock} />;
      }}
    </AppConsumer>
  );
}

export default BlockContainer;
