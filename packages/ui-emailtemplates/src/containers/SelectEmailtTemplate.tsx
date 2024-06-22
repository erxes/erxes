import React from 'react';

import { gql, useQuery } from '@apollo/client';

import { EmptyState, Spinner } from '@erxes/ui/src';

import { queries } from '../graphql';
import EmailTemplatesComponent from '../components/SelectEmailTemplate';
import {
  EmailTemplatesQueryResponse,
  EmailTemplatesTotalCountQueryResponse,
} from '../types';

type Props = {
  searchValue: string;
  handleSelect: (id: string) => void;
  selectedTemplateId?: string;
};

const SelectEmailTemplate = (props: Props) => {
  const { searchValue, handleSelect, selectedTemplateId } = props;

  const emailTemplatesQuery = useQuery<EmailTemplatesQueryResponse>(
    gql(queries.emailTemplates),
    {
      variables: { searchValue },
    },
  );

  const totalCountQuery = useQuery<EmailTemplatesTotalCountQueryResponse>(
    gql(queries.totalCount),
    {
      variables: { searchValue },
    },
  );

  const loading = emailTemplatesQuery.loading || totalCountQuery.loading;

  if (loading) {
    return <Spinner />;
  }

  if (!loading && !totalCountQuery?.data?.emailTemplatesTotalCount) {
    return (
      <EmptyState size="small" text="Not Found" image="/images/actions/5.svg" />
    );
  }

  const updatedProps = {
    templates: emailTemplatesQuery?.data?.emailTemplates || [],
    totalCount: totalCountQuery?.data?.emailTemplatesTotalCount || 0,
    handleSelect,
    selectedTemplateId,
  };

  return <EmailTemplatesComponent {...updatedProps} />;
};

export default SelectEmailTemplate;
