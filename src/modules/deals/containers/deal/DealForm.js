import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { DealForm } from '../../components';
import { queries } from '../../graphql';

class DealFormContainer extends React.Component {
  render() {
    const { usersQuery } = this.props;

    const users = usersQuery.users || [];

    const extendedProps = {
      ...this.props,
      users
    };

    return <DealForm {...extendedProps} />;
  }
}

const propTypes = {
  usersQuery: PropTypes.object
};

DealFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.users), {
    name: 'usersQuery'
  })
)(DealFormContainer);
