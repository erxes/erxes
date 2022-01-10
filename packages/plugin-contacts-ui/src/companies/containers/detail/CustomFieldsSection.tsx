import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import Sidebar from 'modules/layout/components/Sidebar';
import GenerateCustomFields from 'modules/settings/properties/components/GenerateCustomFields';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { FieldsGroupsQueryResponse } from '../../../settings/properties/types';
import { mutations } from '../../graphql';
import { EditMutationResponse, ICompany } from '../../types';

type Props = {
  company: ICompany;
  loading?: boolean;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  EditMutationResponse;

const CustomFieldsSection = (props: FinalProps) => {
  const { loading, company, companiesEdit, fieldsGroupsQuery } = props;

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
    loading,
    isDetail: false,
    customFieldsData: company.customFieldsData,
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || []
  };

  return <GenerateCustomFields {...updatedProps} />;
};

const options = () => ({
  refetchQueries: ['companDetail']
});

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: () => ({
          variables: {
            contentType: FIELDS_GROUPS_CONTENT_TYPES.COMPANY,
            isDefinedByErxes: false
          }
        })
      }
    ),
    graphql<Props, EditMutationResponse, ICompany>(
      gql(mutations.companiesEdit),
      {
        name: 'companiesEdit',
        options
      }
    )
  )(CustomFieldsSection)
);
