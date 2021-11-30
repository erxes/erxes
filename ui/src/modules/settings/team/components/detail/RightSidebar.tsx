import PortableDeals from 'modules/deals/components/PortableDeals';
import Sidebar from 'modules/layout/components/Sidebar';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';
import { IUser } from 'modules/auth/types';

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
