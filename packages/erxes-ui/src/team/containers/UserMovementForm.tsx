import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import { queries } from '../graphql';
import UserMovementFormComponent from '../components/detail/UserMovementForm';
import { UserMovementsQueryResponse } from '../types';
type Props = {
  userId: string;
  contentType: string;
};

type FinalProps = {
  userMovementsQueryResponse: UserMovementsQueryResponse;
} & Props;

class UserMovementForm extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { userMovementsQueryResponse } = this.props;

    const { userMovements, loading } = userMovementsQueryResponse;

    const updateProps = {
      list: userMovements || [],
      loading
    };

    return <UserMovementFormComponent {...updateProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.userMovements), {
      name: 'userMovementsQueryResponse',
      options: ({ userId, contentType }) => ({
        variables: {
          userId,
          contentType
        },
        fetchPolicy: 'no-cache'
      })
    })
  )(UserMovementForm)
);
