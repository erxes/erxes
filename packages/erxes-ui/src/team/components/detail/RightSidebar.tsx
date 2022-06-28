import { IUser } from '../../../auth/types';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import asyncComponent from '../../../components/AsyncComponent';
import { isEnabled } from '../../../utils/core';

type Props = {
  user: IUser;
};

const PortableDeals = asyncComponent(
  () =>
    isEnabled('cards') &&
    import(
      /* webpackChunkName: "PortableDeals" */ '@erxes/ui-cards/src/deals/components/PortableDeals'
    )
);

const PortableTasks = asyncComponent(
  () =>
    isEnabled('cards') &&
    import(
      /* webpackChunkName: "PortableTasks" */ '@erxes/ui-cards/src/tasks/components/PortableTasks'
    )
);

const PortableTickets = asyncComponent(
  () =>
    isEnabled('cards') &&
    import(
      /* webpackChunkName: "PortableTickets" */ '@erxes/ui-cards/src/tickets/components/PortableTickets'
    )
);

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
