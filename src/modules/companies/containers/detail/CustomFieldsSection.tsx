import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { GenerateCustomFields } from 'modules/settings/properties/components';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations } from '../../graphql';
import { ICompany } from '../../types';

type Props = {
  company: ICompany;
  companiesEdit: (params: { variables: ICompany }) => Promise<any>;
  fieldsGroupsQuery: any;
};

const CustomFieldsSection = (props: Props) => {
  const { company, companiesEdit, fieldsGroupsQuery } = props;

  if (fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const { _id } = company;

  const save = (data, callback) => {
    companiesEdit({
      variables: { _id, ...data }
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
    customFieldsData: company.customFieldsData || {},
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <GenerateCustomFields {...updatedProps} />;
};

const options = () => ({
  refetchQueries: ['companDetail']
});

export default compose(
  graphql(gql(fieldQueries.fieldsGroups), {
    name: 'fieldsGroupsQuery',
    options: () => ({
      variables: {
        contentType: FIELDS_GROUPS_CONTENT_TYPES.COMPANY
      }
    })
  }),
  // mutations
  graphql(gql(mutations.companiesEdit), {
    name: 'companiesEdit',
    options
  })
)(CustomFieldsSection);
