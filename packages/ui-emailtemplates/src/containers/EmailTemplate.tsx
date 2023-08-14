import React from 'react';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { QueryResponse } from '@erxes/ui/src/types';
import queries from '../graphql/queries';
import { EmptyState, Spinner } from '@erxes/ui/src';
import EmailTemplateComponent from '../components/EmailTemplate';

type Props = {
  templateId: string;
  onlyPreview?: boolean;
  handleSelect?: (_id: string) => void;
};

type FinalProps = {
  emailTemplateQuery: { emailTemplate: any } & QueryResponse;
} & Props;

class EmailTemplate extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { emailTemplateQuery } = this.props;

    if (emailTemplateQuery.loading) {
      return <Spinner objective />;
    }

    if (emailTemplateQuery.error) {
      return <EmptyState text="Not Found" icon="info-circle" />;
    }

    const updatedProps = {
      ...this.props,
      template: emailTemplateQuery.emailTemplate || {}
    };

    return <EmailTemplateComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.emailTemplate), {
      name: 'emailTemplateQuery',
      options: ({ templateId }) => ({
        variables: { _id: templateId }
      })
    })
  )(EmailTemplate)
);
