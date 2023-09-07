import * as compose from "lodash.flowright";

import { IUser } from "../../auth/types";
import QuickNavigation from "../components/QuickNavigation";
import React from "react";
import { queries as generalQueries } from "@erxes/ui-settings/src/general/graphql";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { withProps } from "../../utils";

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

const WithUser = QuickNavigationContainer;

export default WithUser;
