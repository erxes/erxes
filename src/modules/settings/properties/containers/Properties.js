import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { router } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Properties } from '../components';

const PropertiesContainer = props => {
  const {
    fieldsGroupsQuery,
    history,
    fieldsGroupsRemove,
    fieldsRemove,
    fieldsGroupsUpdateVisible,
    fieldsGroupsUpdateOrder,
    fieldsUpdateVisible,
    fieldsUpdateOrder
  } = props;
  const fieldsgroups = fieldsGroupsQuery.fieldsgroups || [];

  if (!router.getParam(history, 'type')) {
    router.setParams(history, { type: 'Customer' });
  }

  const removePropertyGroup = ({ _id }) => {
    fieldsGroupsRemove({
      variables: { _id }
    })
      .then(() => {
        fieldsGroupsQuery.refetch();
        Alert.success('Successfully Removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const removeProperty = ({ _id }) => {
    fieldsRemove({
      variables: { _id }
    })
      .then(() => {
        fieldsGroupsQuery.refetch();
        Alert.success('Succesfully Removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertyVisible = ({ visible }) => {
    fieldsUpdateVisible({
      variables: { visible }
    })
      .then(() => {})
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertyGroupVisible = ({ visible }) => {
    fieldsGroupsUpdateVisible({
      variables: { visible }
    })
      .then(() => {})
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertyGroupOrder = ({ visible }) => {
    fieldsGroupsUpdateOrder({
      variables: { visible }
    })
      .then(() => {})
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertyOrder = ({ visible }) => {
    fieldsUpdateOrder({
      variables: { visible }
    })
      .then(() => {})
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const currentType = router.getParam(history, 'type');

  const updatedProps = {
    ...props,
    fieldsgroups,
    currentType,
    removePropertyGroup,
    removeProperty,
    updatePropertyVisible,
    updatePropertyGroupVisible,
    updatePropertyOrder,
    updatePropertyGroupOrder
  };

  return <Properties {...updatedProps} />;
};

PropertiesContainer.propTypes = {
  queryParams: PropTypes.object,
  fieldsGroupsQuery: PropTypes.object.isRequired,
  history: PropTypes.object,
  fieldsGroupsRemove: PropTypes.func.isRequired,
  fieldsRemove: PropTypes.func.isRequired,
  fieldsGroupsUpdateVisible: PropTypes.func,
  fieldsGroupsUpdateOrder: PropTypes.func,
  fieldsUpdateVisible: PropTypes.func,
  fieldsUpdateOrder: PropTypes.func
};

export default compose(
  graphql(gql(queries.fieldsgroups), {
    name: 'fieldsGroupsQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentType: queryParams.type || 'Customer'
      }
    })
  }),
  graphql(gql(mutations.fieldsGroupsRemove), {
    name: 'fieldsGroupsRemove'
  }),
  graphql(gql(mutations.fieldsRemove), {
    name: 'fieldsRemove'
  }),
  graphql(gql(mutations.fieldsUpdateVisible), {
    name: 'fieldsUpdateVisible'
  }),
  graphql(gql(mutations.fieldsGroupsUpdateVisible), {
    name: 'fieldsGroupsUpdateVisible'
  }),
  graphql(gql(mutations.fieldsGroupsUpdateOrder), {
    name: 'fieldsGroupsUpdateOrder'
  }),
  graphql(gql(mutations.fieldsUpdateOrder), {
    name: 'fieldsUpdateOrder'
  })
)(withRouter(PropertiesContainer));
