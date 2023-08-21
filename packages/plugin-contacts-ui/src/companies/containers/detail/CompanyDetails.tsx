import * as compose from 'lodash.flowright';

import { DetailQueryResponse, ICompany } from '../../types';

import CompanyDetails from '../../components/detail/CompanyDetails';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { SystemFieldsGroupsQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries } from '../../graphql';
import { withProps } from '@erxes/ui/src/utils';

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
