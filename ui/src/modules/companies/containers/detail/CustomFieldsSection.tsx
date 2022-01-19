import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import Sidebar from 'modules/layout/components/Sidebar';
import { ConfigsQueryResponse } from 'modules/settings/general/types';
import GenerateCustomFields from 'modules/settings/properties/components/GenerateCustomFields';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { queries as settingsQueries } from 'modules/settings/general/graphql';
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
  configsQuery: ConfigsQueryResponse;
} & Props &
  EditMutationResponse;

const CustomFieldsSection = (props: FinalProps) => {
  const {
    loading,
    company,
    companiesEdit,
    fieldsGroupsQuery,
    configsQuery
  } = props;

  if (fieldsGroupsQuery.loading || configsQuery.loading) {
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
    fieldsGroups: fieldsGroupsQuery.fieldsGroups || [],
    configs: configsQuery.configs || []
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
    graphql<{}, ConfigsQueryResponse>(gql(settingsQueries.configs), {
      name: 'configsQuery'
    }),
    graphql<Props, EditMutationResponse, ICompany>(
      gql(mutations.companiesEdit),
      {
        name: 'companiesEdit',
        options
      }
    )
  )(CustomFieldsSection)
);
