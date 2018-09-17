import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DealEditForm } from '../../components';
import { queries } from '../../graphql';

class DealEditFormContainer extends React.Component<{ usersQuery: any }> {
  render() {
    const { usersQuery } = this.props;

    const extendedProps = {
      ...this.props,
      users: usersQuery.users || []
    };

    return <DealEditForm {...extendedProps} />;
  }
}

export default compose(
  graphql(gql(queries.users), {
    name: 'usersQuery'
  })
)(DealEditFormContainer);
