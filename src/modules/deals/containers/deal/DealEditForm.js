import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { DealEditForm } from '../../components';
import { queries } from '../../graphql';

class DealEditFormContainer extends React.Component {
  render() {
    const { usersQuery } = this.props;

    const extendedProps = {
      ...this.props,
      users: usersQuery.users || []
    };

    return <DealEditForm {...extendedProps} />;
  }
}

const propTypes = {
  usersQuery: PropTypes.object
};

DealEditFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.users), {
    name: 'usersQuery'
  })
)(DealEditFormContainer);
