import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { withProps } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import { mutations } from '../graphql';
import { EditMutationResponse, ICustomer } from '../types';

type Props = {
  customer: ICustomer;
  loading?: boolean;
  isDetail: boolean;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  EditMutationResponse;

const CustomFieldsSection = (props: FinalProps) => {
  const {
    customer,
    customersEdit,
    fieldsGroupsQuery,
    loading,
    isDetail
  } = props;

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = customer;

  const save = (variables, callback) => {
    customersEdit({
      variables: { _id, ...variables }
    })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    save,
    loading,
    customFieldsData: customer.customFieldsData,
    fieldsGroups: fieldsGroupsQuery ? fieldsGroupsQuery.fieldsGroups : [],
    isDetail,
    object: customer
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: () => ({
          variables: {
            contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER,
            isDefinedByErxes: false
          }
        }),
        skip: !isEnabled('forms') ? true : false
      }
    ),

    // mutations
    graphql<Props, EditMutationResponse, ICustomer>(
      gql(mutations.customersEdit),
      {
        name: 'customersEdit',
        options: () => ({
          refetchQueries: ['customerDetail']
        })
      }
    )
  )(CustomFieldsSection)
);
