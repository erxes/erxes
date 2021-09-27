import * as React from 'react';
import Block from '../components/Block';
import { IProductCategory } from '../types';
import { AppConsumer } from './AppContext';

type Props = {
  category: IProductCategory;
};

function BlockContainer(props: Props) {
  return (
    <AppConsumer>
      {({ goToBlock }) => {
        return <Block {...props} onClick={goToBlock} />;
      }}
    </AppConsumer>
  );
}

export default BlockContainer;
