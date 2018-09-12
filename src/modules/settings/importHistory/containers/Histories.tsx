import gql from 'graphql-tag';
import { Alert, router } from 'modules/common/utils';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Histories } from '../components';
import { mutations, queries } from '../graphql';

type State = {
  loading: boolean
}

class HistoriesContainer extends Component<Props, State> {
  static contextTypes =  {
    __: PropTypes.func
  }


  constructor(props: Props) {
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

type Props = {
  queryParams: any,
  historiesQuery: any,
  history: any,
  location: any,
  match: any,
  importHistoriesRemove: (params: { variables: { _id: string } }) => any
};

export default compose(
  graphql<Props>(gql(queries.histories), {
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
)(withRouter<Props>(HistoriesContainer));
