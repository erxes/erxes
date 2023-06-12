import * as compose from 'lodash.flowright';
import * as gq from '../graphql';

import { storeConstantToStore, withProps } from '../../utils';

import { CurrentUserQueryResponse } from '../types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  currentUserQuery: CurrentUserQueryResponse;
};

const withCurrentUser = Component => {
  const Container = (props: Props) => {
    const { currentUserQuery } = props;

    if (currentUserQuery.loading) {
      return null;
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
      graphql<{}, CurrentUserQueryResponse>(gql(gq.currentUser), {
        name: 'currentUserQuery'
      })
    )(Container)
  );
};

export default withCurrentUser;
