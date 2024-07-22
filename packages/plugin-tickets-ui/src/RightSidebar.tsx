import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { isEnabled } from "@erxes/ui/src/utils/core";

type Props = {
  user: IUser;
};

const PortableDeals = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PortableDeals" */ "@erxes/ui-sales/src/deals/components/PortableDeals"
    )
);

const PortableTasks = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PortableTasks" */ "@erxes/ui-cards/src/tasks/components/PortableTasks"
    )
);

const PortablePurchases = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PortableTickets" */ "@erxes/ui-purchases/src/purchases/components/PortablePurchases"
    )
);

const PortableTickets = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PortableTickets" */ "@erxes/ui-tickets/src/tickets/components/PortableTickets"
    )
);

export default class RightSidebar extends React.Component<Props> {
  render() {
    const { user } = this.props;

    return (
      <Sidebar>
        {isEnabled("cards") && (
          <PortableTasks mainType="user" mainTypeId={user._id} />
        )}
        {isEnabled("purchases") && (
          <PortablePurchases mainType="user" mainTypeId={user._id} />
        )}
        {isEnabled("sales") && (
          <PortableDeals mainType="user" mainTypeId={user._id} />
        )}

        <PortableTickets mainType="user" mainTypeId={user._id} />
      </Sidebar>
    );
  }
}
