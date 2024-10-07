import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

type Props = {
  user: IUser;
};

const PortableTasks = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PortableTickets" */ "@erxes/ui-tasks/src/tasks/components/PortableTasks"
    )
);

export default class RightSidebar extends React.Component<Props> {
  render() {
    const { user } = this.props;

    return (
      <Sidebar>
        <PortableTasks mainType="user" mainTypeId={user._id} />
      </Sidebar>
    );
  }
}
