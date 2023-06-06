import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Spinner from '../../components/Spinner';
import { storeConstantToStore, withProps } from '../../utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import * as gq from '../graphql';
import { CurrentUserQueryResponse } from '../types';

type Props = {
  currentUserQuery: CurrentUserQueryResponse;
};

const withCurrentUser = Component => {
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
      currentUser
    };

    if (currentUser) {
      const constants = currentUser.configsConstants || [];

      constants.forEach(c => storeConstantToStore(c.key, c.values));
    }

    return <Component {...updatedProps} />;
  };

  return withProps<{}>(
    compose(
      graphql<{}, CurrentUserQueryResponse>(gql(gq.currentUser), {
        name: 'currentUserQuery'
      })
    )(Container)
  );
};

export default withCurrentUser;
