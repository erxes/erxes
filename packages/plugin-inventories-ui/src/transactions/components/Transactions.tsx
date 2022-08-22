import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import Actionbar from './Actionbar';
import List from '../containers/List';
import { SUBMENU } from '../../constants';

type Props = {
  data: any[];
  queryParams: any;
  history: any;
};

const Transactions = (props: Props) => {
  return (
    <Wrapper
      header={<Wrapper.Header title={__('Transactions')} submenu={SUBMENU} />}
      content={<List />}
      actionBar={<Actionbar />}
      hasBorder
    />
  );
};

export default Transactions;
