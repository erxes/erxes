import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import BasicInfo from '../../containers/detail/BasicInfo';
import { IContract } from '../../types';

type Props = {
  contract: IContract;
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { contract } = this.props;

    return (
      <Sidebar wide={true}>
        <BasicInfo contract={contract} />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
