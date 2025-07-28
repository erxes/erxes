import React from 'react';

import { gql, useQuery } from '@apollo/client';

import { QueryResponse } from '@erxes/ui/src/types';
import { EmptyState, Spinner } from '@erxes/ui/src';

import EmailTemplateComponent from '../components/EmailTemplate';
import queries from '../graphql/queries';
import { IEmailTemplate } from '../types';

type Props = {
  templateId: string;
  onlyPreview?: boolean;
  handleSelect?: (_id: string) => void;
  additionalAction?: (
    template: IEmailTemplate,
    refetch: () => void
  ) => JSX.Element;
};

const EmailTemplate = (props: Props) => {
  const { templateId } = props;

  const { data, loading, error, refetch } = useQuery<
    { emailTemplate: any } & QueryResponse
  >(gql(queries.emailTemplate), {
    variables: { _id: templateId }
  });

  if (loading) {
    return <Spinner objective />;
  }

  if (error) {
    return <EmptyState text='Not Found' icon='info-circle' />;
  }

  const updatedProps = {
    ...props,
    template: data?.emailTemplate || {},
    refetch
  };

  return <EmailTemplateComponent {...updatedProps} />;
};

export default EmailTemplate;
