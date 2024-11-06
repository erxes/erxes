import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

type Props = {
  user: IUser;
};

const PortableDeals = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PortableDeals" */ "@erxes/ui-sales/src/deals/components/PortableDeals"
    )
);

export default class RightSidebar extends React.Component<Props> {
  render() {
    const { user } = this.props;

    return (
      <Sidebar>
        <PortableDeals mainType="user" mainTypeId={user._id} />
      </Sidebar>
    );
  }
}
