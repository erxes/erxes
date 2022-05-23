import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-settings/src/properties/constants';
import { queries as fieldQueries } from '@erxes/ui-settings/src/properties/graphql';
import { SystemFieldsGroupsQueryResponse } from '@erxes/ui-settings/src/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { IUser } from '@erxes/ui/src/auth/types';
import CompanyDetails from '../../components/detail/CompanyDetails';
import { queries } from '../../graphql';
import { DetailQueryResponse, ICompany } from '../../types';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  id: string;
};

type FinalProps = {
  companyDetailQuery: DetailQueryResponse;
  fieldsGroupsQuery: SystemFieldsGroupsQueryResponse;
  currentUser: IUser;
} & Props;

const CompanyDetailsContainer = (props: FinalProps) => {
  const {
    id,
    companyDetailQuery,
    currentUser,
    fieldsGroupsQuery = {} as SystemFieldsGroupsQueryResponse
  } = props;

  if (companyDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!companyDetailQuery.companyDetail) {
    return (
      <EmptyState text="Company not found" image="/images/actions/24.svg" />
    );
  }

  if (fieldsGroupsQuery.loading) {
    return <Spinner />;
  }

  const fields = (fieldsGroupsQuery.getSystemFieldsGroup || {}).fields || [];

  const companyDetail = companyDetailQuery.companyDetail || ({} as ICompany);

  const taggerRefetchQueries = [
    {
      query: gql(queries.companyDetail),
      variables: { _id: id }
    }
  ];

  const updatedProps = {
    ...props,
    loading: companyDetailQuery.loading,
    company: companyDetail,
    taggerRefetchQueries,
    currentUser,
    fields
  };

  return <CompanyDetails {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.companyDetail),
      {
        name: 'companyDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    ),
    graphql<Props, SystemFieldsGroupsQueryResponse>(
      gql(fieldQueries.getSystemFieldsGroup),
      {
        name: 'fieldsGroupsQuery',
        options: () => ({
          variables: {
            contentType: FIELDS_GROUPS_CONTENT_TYPES.COMPANY
          }
        }),
        skip: !isEnabled('forms')
      }
    )
  )(CompanyDetailsContainer)
);
