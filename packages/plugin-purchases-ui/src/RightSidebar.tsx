import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

type Props = {
  user: IUser;
};

const PortablePurchases = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PortablePurchases" */ "@erxes/ui-purchases/src/purchases/components/PortablePurchases"
    )
);

export default class RightSidebar extends React.Component<Props> {
  render() {
    const { user } = this.props;

    return (
      <Sidebar>
        <PortablePurchases mainType="user" mainTypeId={user._id} />
      </Sidebar>
    );
  }
}
