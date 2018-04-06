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
  usersQuery: PropTypes.object,
  stagesQuery: PropTypes.object
};

DealFormContainer.propTypes = propTypes;

const DealFormContainerWithData = compose(
  graphql(gql(queries.users), {
    name: 'usersQuery'
  })
)(DealFormContainer);

const DealActivity = props => {
  const { dealActivityLogQuery } = props;

  const extendedProps = {
    ...props,
    loadingLogs: dealActivityLogQuery.loading,
    dealActivityLog: dealActivityLogQuery.activityLogsDeal || []
  };

  return <DealFormContainerWithData {...extendedProps} />;
};

DealActivity.propTypes = {
  dealActivityLogQuery: PropTypes.object
};

const DealActivityContainer = compose(
  graphql(gql(queries.activityLogsDeal), {
    name: 'dealActivityLogQuery',
    options: ({ deal }) => ({
      variables: {
        _id: deal._id
      }
    })
  })
)(DealActivity);

const MainContainer = props => {
  const { deal } = props;

  if (deal) {
    return <DealActivityContainer {...props} />;
  }

  return <DealFormContainerWithData {...props} />;
};

MainContainer.propTypes = {
  deal: PropTypes.object
};

export default MainContainer;
