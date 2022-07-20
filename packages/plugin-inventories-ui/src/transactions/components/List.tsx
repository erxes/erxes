import React from 'react';
import { __, Wrapper } from '@erxes/ui/src';
import { SUBMENU } from '../../constants';

type Props = {
  data: any[];
};

const List = (props: Props) => {
  return (
    <Wrapper
      header={<Wrapper.Header title={__('Transactions')} submenu={SUBMENU} />}
      content={<>List will be here</>}
      leftSidebar={<Wrapper.Sidebar></Wrapper.Sidebar>}
    />
  );
};

export default List;
