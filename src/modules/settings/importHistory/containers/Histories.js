import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { router, Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import gql from 'graphql-tag';
import { Histories } from '../components';

class HistoriesContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { historiesQuery, history, importHistoriesRemove } = this.props;
    const { __ } = this.context;

    if (!router.getParam(history, 'type')) {
      router.setParams(history, { type: 'customer' });
    }

    const currentType = router.getParam(history, 'type');

    const removeHistory = _id => {
      this.setState({ loading: true });

      importHistoriesRemove({
        variables: { _id }
      })
        .then(() => {
          Alert.success(__('Successfully Removed all customers'));
          this.setState({ loading: false });
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      histories: historiesQuery.importHistories || [],
      loading: historiesQuery.loading || this.state.loading,
      removeHistory,
      currentType
    };

    return <Histories {...updatedProps} />;
  }
}

HistoriesContainer.propTypes = {
  queryParams: PropTypes.object,
  historiesQuery: PropTypes.object,
  history: PropTypes.object,
  importHistoriesRemove: PropTypes.func
};

HistoriesContainer.contextTypes = {
  __: PropTypes.func
};

export default compose(
  graphql(gql(queries.histories), {
    name: 'historiesQuery',
    options: ({ queryParams }) => ({
      fetchPolicy: 'network-only',
      variables: {
        type: queryParams.type || 'customer'
      }
    })
  }),
  graphql(gql(mutations.importHistoriesRemove), {
    name: 'importHistoriesRemove',
    options: {
      refetchQueries: ['importHistories']
    }
  })
)(withRouter(HistoriesContainer));
