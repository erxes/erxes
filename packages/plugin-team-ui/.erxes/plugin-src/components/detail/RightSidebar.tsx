import PortableDeals from '@erxes/ui/src/deals/components/PortableDeals';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import PortableTasks from '@erxes/ui/src/tasks/components/PortableTasks';
import PortableTickets from '@erxes/ui/src/tickets/components/PortableTickets';
import React from 'react';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  user: IUser;
};

export default class RightSidebar extends React.Component<Props> {
  render() {
    const { user } = this.props;

    return (
      <Sidebar>
        <PortableTasks mainType="user" mainTypeId={user._id} />
        <PortableDeals mainType="user" mainTypeId={user._id} />
        <PortableTickets mainType="user" mainTypeId={user._id} />
      </Sidebar>
    );
  }
}
