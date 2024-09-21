import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-engage/src/graphql';
import {
  EngageVerifiedEmailsQueryResponse,
  IEmailFormProps,
} from '@erxes/ui-engage/src/types';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import EmailForm from '../components/EmailForm';

type FinalProps = {
  engageVerifiedEmailsQuery: EngageVerifiedEmailsQueryResponse;
} & IEmailFormProps;

const EmailFormContainer = (props: FinalProps) => {
  const { engageVerifiedEmailsQuery } = props;

  const verifiedEmails = engageVerifiedEmailsQuery.engageVerifiedEmails || [];
  const error = engageVerifiedEmailsQuery.error;

  const updatedProps = {
    ...props,
    error: error && error.message,
    verifiedEmails,
  };

  return <EmailForm {...updatedProps} />;
};

export default withProps<IEmailFormProps>(
  compose(
    graphql<IEmailFormProps, EngageVerifiedEmailsQueryResponse>(
      gql(queries.verifiedEmails),
      { name: 'engageVerifiedEmailsQuery' }
    ),
  )(EmailFormContainer)
);
