import React from 'react';
import { EmptyState, Spinner, withProps } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import * as compose from 'lodash.flowright';
import { QueryResponse } from '@erxes/ui/src/types';
import { queries } from '../graphql';
import EmailTemplatesComponent from '../components/SelectEmailTemplate';
type Props = {
  searchValue: string;
  handleSelect: (id: string) => void;
  selectedTemplateId?: string;
};

type FinalProps = {
  emailTemplatesQuery: { emailTemplates: any[] } & QueryResponse;
  totalCountQuery: { emailTemplatesTotalCount: number } & QueryResponse;
} & Props;

class EmailTemplates extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      emailTemplatesQuery,
      totalCountQuery,
      handleSelect,
      selectedTemplateId
    } = this.props;

    const { emailTemplates, loading } = emailTemplatesQuery;
    const { emailTemplatesTotalCount } = totalCountQuery;

    if (loading) {
      return <Spinner />;
    }

    if (!emailTemplatesTotalCount) {
      return (
        <EmptyState
          size="small"
          text="Not Found"
          image="/images/actions/5.svg"
        />
      );
    }

    const updatedProps = {
      templates: emailTemplates || [],
      totalCount: emailTemplatesTotalCount || 0,
      handleSelect,
      selectedTemplateId
    };

    return <EmailTemplatesComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.emailTemplates), {
      name: 'emailTemplatesQuery',
      options: ({ searchValue }) => ({
        variables: { searchValue },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(queries.totalCount), {
      name: 'totalCountQuery',
      options: ({ searchValue }) => ({
        variables: { searchValue },
        fetchPolicy: 'network-only'
      })
    })
  )(EmailTemplates)
);
