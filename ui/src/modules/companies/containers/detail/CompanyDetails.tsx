import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { FIELDS_GROUPS_CONTENT_TYPES } from 'modules/settings/properties/constants';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { SystemFieldsGroupsQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import CompanyDetails from '../../components/detail/CompanyDetails';
import { queries } from '../../graphql';
import { DetailQueryResponse } from '../../types';

type Props = {
  id: string;
};

type FinalProps = {
  companyDetailQuery: DetailQueryResponse;
  fieldsGroupsQuery: SystemFieldsGroupsQueryResponse;
  currentUser: IUser;
} & Props;

const CompanyDetailsContainer = (props: FinalProps) => {
  const { id, companyDetailQuery, currentUser, fieldsGroupsQuery } = props;

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

  const fields = fieldsGroupsQuery.getSystemFieldsGroup.fields;

  const companyDetail = companyDetailQuery.companyDetail || {};

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
        })
      }
    )
  )(CompanyDetailsContainer)
);
