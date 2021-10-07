import * as React from 'react';
import Block from '../components/Block';
import { IBooking, IProductCategory } from '../types';
import { AppConsumer } from './AppContext';

type Props = {
  block: IProductCategory;
  widgetColor:string;
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
