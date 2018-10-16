import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { GenerateCustomFields } from 'modules/settings/properties/components';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations } from '../../graphql';
import { ICustomer } from '../../types';

type Props = {
  customer: ICustomer;
  loading?: boolean;
  customersEdit: (doc: { variables: ICustomer }) => Promise<any>;
  fieldsGroupsQuery: any;
};

const CustomFieldsSection = (props: Props) => {
  const { loading, customer, customersEdit, fieldsGroupsQuery } = props;

  if (fieldsGroupsQuery.loading) {
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
    customFieldsData: customer.customFieldsData || {},
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default compose(
  graphql(gql(fieldQueries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: () => ({
      variables: {
        contentType: FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER
      }
    })
  }),

  // mutations
  graphql(gql(mutations.customersEdit), {
    name: 'customersEdit',
    options: () => ({
      refetchQueries: ['customerDetail']
    })
  })
)(CustomFieldsSection);
