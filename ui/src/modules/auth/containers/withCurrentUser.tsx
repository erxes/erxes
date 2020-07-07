import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { storeConstantToStore, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
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
      graphql<{}, CurrentUserQueryResponse>(gql(queries.currentUser), {
        name: 'currentUserQuery'
      })
    )(Container)
  );
};

export default withCurrentUser;
