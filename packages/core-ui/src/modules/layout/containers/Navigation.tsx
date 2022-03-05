import { IUser } from "modules/auth/types";
import React from "react";
import { withProps } from "../../common/utils";
import Navigation from "../components/Navigation";

type Props = {
  currentUser: IUser;
};

class NavigationContainer extends React.Component<Props> {
  render() {
    return <Navigation {...this.props} />;
  }
}

export default withProps<Props>(NavigationContainer);
