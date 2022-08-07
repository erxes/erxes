import * as compose from 'lodash.flowright';

import { EditMutationResponse } from '../types';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { FieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import GenerateCustomFields from '@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields';
import { ICustomer } from '../types';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { mutations } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

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
    isDetail
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
