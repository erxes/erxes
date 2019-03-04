import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { router } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Properties } from '../components';
import { FIELDS_GROUPS_CONTENT_TYPES } from '../constants';
import { mutations, queries } from '../graphql';
import {
  FieldsGroupsQueryResponse,
  FieldsGroupsRemoveMutationResponse,
  FieldsGroupsUpdateVisibleMutationResponse,
  FieldsRemoveMutationResponse,
  FieldsUpdateVisibleMutationResponse
} from '../types';
import { companyBasicInfos, customerBasicInfos } from '../utils';

type Props = {
  queryParams: any;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  FieldsGroupsRemoveMutationResponse &
  FieldsRemoveMutationResponse &
  FieldsGroupsUpdateVisibleMutationResponse &
  FieldsUpdateVisibleMutationResponse &
  IRouterProps;

const PropertiesContainer = (props: FinalProps) => {
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
    router.setParams(
      history,
      { type: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER },
      true
    );
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
  const fieldsGroups = [...(fieldsGroupsQuery.fieldsGroups || [])];

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
      query: gql`
        ${queries.fieldsGroups}
      `,
      variables: { contentType: queryParams.type }
    }
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse>(gql(queries.fieldsGroups), {
      name: 'fieldsGroupsQuery',
      options: ({ queryParams }) => ({
        variables: {
          contentType: queryParams.type || ''
        }
      })
    }),
    graphql<Props, FieldsGroupsRemoveMutationResponse, { _id: string }>(
      gql(mutations.fieldsGroupsRemove),
      {
        name: 'fieldsGroupsRemove',
        options
      }
    ),
    graphql<Props, FieldsRemoveMutationResponse, { _id: string }>(
      gql(mutations.fieldsRemove),
      {
        name: 'fieldsRemove',
        options
      }
    ),
    graphql<
      Props,
      FieldsUpdateVisibleMutationResponse,
      { _id: string; isVisible: boolean }
    >(gql(mutations.fieldsUpdateVisible), {
      name: 'fieldsUpdateVisible',
      options
    }),
    graphql<
      Props,
      FieldsGroupsUpdateVisibleMutationResponse,
      { _id: string; isVisible: boolean }
    >(gql(mutations.fieldsGroupsUpdateVisible), {
      name: 'fieldsGroupsUpdateVisible',
      options
    })
  )(withRouter<FinalProps>(PropertiesContainer))
);
