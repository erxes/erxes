import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { router } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import gql from 'graphql-tag';
import { Histories } from '../components';

const PropertiesContainer = props => {
  const {
    historiesQuery,
    history
    // importHistoriesRemove,
  } = props;

  if (!router.getParam(history, 'type')) {
    router.setParams(history, { type: 'customer' });
  }

  const currentType = router.getParam(history, 'type');
  console.log(historiesQuery);
  const removeHistory = () => {
    return null;
  };

  const updatedProps = {
    ...props,
    histories: historiesQuery.importHistories || [],
    removeHistory,
    currentType
  };

  return <Histories {...updatedProps} />;
};

PropertiesContainer.propTypes = {
  queryParams: PropTypes.object,
  historiesQuery: PropTypes.object,
  history: PropTypes.object,
  importHistoriesRemove: PropTypes.func
};

export default compose(
  graphql(gql(queries.histories), {
    name: 'historiesQuery',
    options: ({ queryParams }) => ({
      variables: {
        type: queryParams.type || 'customer'
      }
    })
  }),
  graphql(gql(mutations.importHistoriesRemove), {
    name: 'importHistoriesRemove'
  })
)(withRouter(PropertiesContainer));
