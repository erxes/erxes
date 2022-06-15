import { Sidebar } from '@erxes/ui/src';
import React from 'react';
import BasicInfo from '../../containers/details/BasicInfo';
import { IClientPortalUser } from '../../types';

type Props = {
  clientPortalUser: IClientPortalUser;
};

class LeftSidebar extends React.Component<Props> {
  render() {
    const { clientPortalUser } = this.props;

    return (
      <Sidebar wide={true}>
        <BasicInfo clientPortalUser={clientPortalUser} />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
