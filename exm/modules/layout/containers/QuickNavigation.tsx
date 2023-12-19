import { IUser } from "../../auth/types";
import QuickNavigation from "../components/QuickNavigation";
import React from "react";
import withCurrentUser from "../../auth/containers/withCurrentUser";

type Props = {
  currentUser: IUser;
};

type State = {};

class QuickNavigationContainer extends React.Component<Props, State> {
  render() {
    const { currentUser } = this.props;

    return <QuickNavigation currentUser={currentUser} />;
  }
}

const WithUser = withCurrentUser(QuickNavigationContainer);

export default WithUser;
