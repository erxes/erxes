import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  FieldsEditMutationResponse,
  FieldsGroupsQueryResponse,
  FieldsUpdateVisibilityToCreateMutationResponse
} from '@erxes/ui-forms/src/settings/properties/types';
import {
  FieldsGroupsRemoveMutationResponse,
  FieldsGroupsUpdateVisibleMutationResponse,
  FieldsRemoveMutationResponse,
  FieldsUpdateOrderMutationResponse,
  FieldsUpdateOrderMutationVariables,
  FieldsUpdateVisibleMutationResponse,
  GroupsUpdateOrderMutationResponse
} from '../types';
import {
  mutations,
  queries
} from '@erxes/ui-forms/src/settings/properties/graphql';

import { IRouterProps } from '@erxes/ui/src/types';
import Properties from '../components/Properties';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { router } from '@erxes/ui/src/utils';
import { updateCustomFieldsCache } from '@erxes/ui-forms/src/settings/properties/utils';
import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
  fieldsGetTypes: any;
} & Props &
  FieldsGroupsRemoveMutationResponse &
  FieldsRemoveMutationResponse &
  FieldsGroupsUpdateVisibleMutationResponse &
  FieldsUpdateVisibleMutationResponse &
  FieldsUpdateOrderMutationResponse &
  FieldsUpdateVisibilityToCreateMutationResponse &
  GroupsUpdateOrderMutationResponse &
  IRouterProps;

const PropertiesContainer = (props: FinalProps) => {
  const {
    fieldsGroupsQuery,
    history,
    fieldsGroupsRemove,
    fieldsRemove,
    fieldsGroupsUpdateVisible,
    fieldsUpdateVisible,
    fieldsUpdateOrder,
    fieldsUpdateSystemFields,
    groupsUpdateOrder,
    queryParams,
    fieldsGetTypes
  } = props;

  if (fieldsGroupsQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (fieldsGetTypes.loading) {
    return <Spinner />;
  }

  const services = fieldsGetTypes.fieldsGetTypes || [];

  if (!router.getParam(history, 'type')) {
    router.setParams(
      history,
      { type: services.length > 0 ? services[0].contentType.toString() : '' },
      true
    );
  }

  const removePropertyGroup = ({ _id }) => {
    fieldsGroupsRemove({
      variables: { _id }
    })
      .then(() => {
        Alert.success('You successfully deleted a property group');
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
        updateCustomFieldsCache({ id: _id, type: queryParams.type });

        Alert.success('You successfully deleted a property field');
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
        Alert.success('You changed a property field visibility');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertySystemFields = ({
    _id,
    isVisibleToCreate,
    isRequired
  }: {
    _id: string;
    isVisibleToCreate?: boolean;
    isRequired?: boolean;
  }) => {
    fieldsUpdateSystemFields({
      variables: { _id, isVisibleToCreate, isRequired }
    })
      .then(() => {
        Alert.success('You changed a property field');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatePropertyDetailVisible = ({ _id, isVisibleInDetail }) => {
    fieldsUpdateVisible({
      variables: { _id, isVisibleInDetail }
    })
      .then(() => {
        Alert.success('You changed a property field visibility');
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
        Alert.success('You changed a property group visibility');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updateFieldOrder = fieldOrders => {
    fieldsUpdateOrder({
      variables: {
        orders: fieldOrders.map((field, index) => ({
          _id: field._id,
          order: index + 1
        }))
      }
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  const updateGroupOrder = groupOrders => {
    groupsUpdateOrder({
      variables: {
        orders: groupOrders.map((group, index) => ({
          _id: group._id,
          order: index + 1
        }))
      }
    }).catch(error => {
      Alert.error(error.message);
    });
  };

  const currentType = router.getParam(history, 'type');
  const fieldsGroups = [...(fieldsGroupsQuery.fieldsGroups || [])];

  const updatedProps = {
    ...props,
    services,
    fieldsGroups,
    currentType,
    removePropertyGroup,
    removeProperty,
    updatePropertyVisible,
    updatePropertyDetailVisible,
    updatePropertyGroupVisible,
    updatePropertySystemFields,
    updateFieldOrder,
    updateGroupOrder
  };

  return <Properties {...updatedProps} />;
};

const options = ({ queryParams }) => ({
  refetchQueries: [
    {
      query: gql`
        ${queries.fieldsGroups}
      `,
      variables: {
        contentType: queryParams.type
      }
    }
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.fieldsGetTypes), {
      name: 'fieldsGetTypes'
    }),

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
    graphql<Props, FieldsEditMutationResponse, { _id: string }>(
      gql(mutations.fieldsUpdateSystemFields),
      {
        name: 'fieldsUpdateSystemFields',
        options
      }
    ),
    graphql<
      Props,
      FieldsUpdateVisibleMutationResponse,
      { _id: string; isVisible: boolean; isVisibleInDetail: boolean }
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
    }),
    graphql<
      Props,
      FieldsUpdateOrderMutationResponse,
      FieldsUpdateOrderMutationVariables
    >(gql(mutations.fieldsUpdateOrder), {
      name: 'fieldsUpdateOrder',
      options
    }),
    graphql<
      Props,
      GroupsUpdateOrderMutationResponse,
      FieldsUpdateOrderMutationVariables
    >(gql(mutations.groupsUpdateOrder), {
      name: 'groupsUpdateOrder',
      options
    })
  )(withRouter<FinalProps>(PropertiesContainer))
);
