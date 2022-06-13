import PortableDeals from '@erxes/ui-cards/src/deals/components/PortableDeals';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import PortableTasks from '@erxes/ui-cards/src/tasks/components/PortableTasks';
import PortableTickets from '@erxes/ui-cards/src/tickets/components/PortableTickets';
import React from 'react';
import { isEnabled } from '../../../utils/core';
import { IUser } from '../../../auth/types';

type Props = {
  user: IUser;
};

export default class RightSidebar extends React.Component<Props> {
  render() {
    const { user } = this.props;
    if (isEnabled('cards')) {
      return (
        <Sidebar>
          <PortableTasks mainType="user" mainTypeId={user._id} />
          <PortableDeals mainType="user" mainTypeId={user._id} />
          <PortableTickets mainType="user" mainTypeId={user._id} />
        </Sidebar>
      );
    }

    return null;
  }
}
