import React from 'react';

import { gql, useQuery } from '@apollo/client';

import { QueryResponse } from '@erxes/ui/src/types';
import { EmptyState, Spinner } from '@erxes/ui/src';

import EmailTemplateComponent from '../components/EmailTemplate';
import queries from '../graphql/queries';

type Props = {
  templateId: string;
  onlyPreview?: boolean;
  handleSelect?: (_id: string) => void;
};

const EmailTemplate = (props: Props) => {
  const { templateId } = props;

  const emailTemplateQuery = useQuery<{ emailTemplate: any } & QueryResponse>(
    gql(queries.emailTemplate),
    {
      variables: { _id: templateId },
    },
  );

  if (emailTemplateQuery.loading) {
    return <Spinner objective />;
  }

  if (emailTemplateQuery.error) {
    return <EmptyState text="Not Found" icon="info-circle" />;
  }

  const updatedProps = {
    ...props,
    template: emailTemplateQuery?.data?.emailTemplate || {},
  };

  return <EmailTemplateComponent {...updatedProps} />;
};

export default EmailTemplate;
