import gql from 'graphql-tag';
import { router } from 'modules/common/utils';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Properties } from '../components';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../constants';
import { mutations, queries } from '../graphql';
import { companyBasicInfos, customerBasicInfos } from '../utils';

type Props = {
  queryParams: any,
  fieldsGroupsQuery: any,
  history: any,
  location: any,
  match: any,
  fieldsGroupsRemove: (params: { variables: { _id: string } }) => any,
  fieldsRemove: (params: { variables: { _id: string } }) => any,
  fieldsGroupsUpdateVisible: (params: { variables: { _id: string, isVisible: boolean } }) => any,
  fieldsUpdateVisible: (params: { variables: { _id: string, isVisible: boolean } }) => any
};

const PropertiesContainer = (props: Props) => {
  const {
    fieldsGroupsQuery,
    history,
    fieldsGroupsRemove,
    fieldsRemove,
    fieldsGroupsUpdateVisible,
    fieldsUpdateVisible,
    queryParams
  } = props;

  if (!router.getParam(history, 'type')) {
    router.setParams(history, { type: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER });
  }

  const removePropertyGroup = ({ _id }) => {
    fieldsGroupsRemove({
      variables: { _id }
    })
      .then(() => {
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
        Alert.success('Succesfully Removed');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertyVisible = ({ _id, isVisible }) => {
    fieldsUpdateVisible({
      variables: { _id, isVisible }
    })
      .then(() => {
        Alert.success('Successfully Updated');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertyGroupVisible = ({ _id, isVisible }) => {
    fieldsGroupsUpdateVisible({
      variables: { _id, isVisible }
    })
      .then(() => {
        Alert.success('Successfully Updated');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const currentType = router.getParam(history, 'type');
  const fieldsGroups = [...(fieldsGroupsQuery.fieldsGroups || {})];

  // Initializing default properties for customer and company
  let defaultGroup = companyBasicInfos;

  if (queryParams.type === FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER) {
    defaultGroup = customerBasicInfos;
  }

  fieldsGroups.unshift(defaultGroup);

  const updatedProps = {
    ...props,
    fieldsGroups,
    currentType,
    removePropertyGroup,
    removeProperty,
    updatePropertyVisible,
    updatePropertyGroupVisible
  };

  return <Properties {...updatedProps} />;
};

const options = ({ queryParams }) => ({
  refetchQueries: [
    {
      query: gql`${queries.fieldsGroups}`,
      variables: { contentType: queryParams.type }
    }
  ]
});

export default compose(
  graphql(gql(queries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: ({ queryParams } : { queryParams: any }) => ({
      variables: {
        contentType: queryParams.type || ''
      }
    })
  }),
  graphql(gql(mutations.fieldsGroupsRemove), {
    name: 'fieldsGroupsRemove',
    options
  }),
  graphql(gql(mutations.fieldsRemove), {
    name: 'fieldsRemove',
    options
  }),
  graphql(gql(mutations.fieldsUpdateVisible), {
    name: 'fieldsUpdateVisible',
    options
  }),
  graphql(gql(mutations.fieldsGroupsUpdateVisible), {
    name: 'fieldsGroupsUpdateVisible',
    options
  })
)(withRouter<Props>(PropertiesContainer));
