import * as compose from "lodash.flowright";

import { CurrentUserQueryResponse } from "../types";
import React from "react";
import Spinner from "../../common/Spinner";
import { queries as gq } from "../graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "../../utils";

type Props = {
  currentUserQuery: CurrentUserQueryResponse;
};

const withCurrentUser = (Component) => {
  const Container = (props: Props) => {
    const { currentUserQuery } = props;

    if (currentUserQuery.loading) {
      return <Spinner />;
    }

    const currentUser = currentUserQuery.currentUser;

    // useEffect( () => {
    //   currentUserQuery.subscribeToMore({
    //     document: gql(gq.userChanged),
    //     variables: { userId: currentUser ? currentUser._id : null },
    //     updateQuery: () => {
    //       currentUserQuery.refetch();
    //     }
    //   });
    // });

    const updatedProps = {
      ...props,
      currentUser,
    };

    if (currentUser) {
      const constants = currentUser.configsConstants || [];

      const storeConstantToStore = (key, values) => {
        localStorage.setItem(`config:${key}`, JSON.stringify(values));
      };

      constants.forEach((c) => storeConstantToStore(c.key, c.values));
    }

    return <Component {...updatedProps} />;
  };

  return withProps<{}>(
    compose(
      graphql<{}, CurrentUserQueryResponse>(gql(gq.currentUser), {
        name: "currentUserQuery",
      })
    )(Container)
  );
};

export default withCurrentUser;
