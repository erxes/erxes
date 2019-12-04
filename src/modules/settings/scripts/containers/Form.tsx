import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { queries as kbQueries } from 'modules/knowledgeBase/graphql';
import { TopicsQueryResponse } from 'modules/knowledgeBase/types';
import { queries as integrationQueries } from 'modules/settings/integrations/graphql';
import { IntegrationsQueryResponse } from 'modules/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { ICommonFormProps } from '../../common/types';
import Form from '../components/Form';

type Props = {
  integrationsQuery: IntegrationsQueryResponse;
  kbTopicsQuery: TopicsQueryResponse;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const FormContainer = (props: Props & ICommonFormProps) => {
  const { integrationsQuery, kbTopicsQuery } = props;

  if (integrationsQuery.loading || kbTopicsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations;

  const kbTopics = kbTopicsQuery.knowledgeBaseTopics;

  const updatedProps = {
    ...props,
    messengers: integrations.filter(i => i.kind === 'messenger'),
    leads: integrations.filter(i => i.kind === 'lead'),
    kbTopics
  };

  return <Form {...updatedProps} />;
};

export default withProps<ICommonFormProps>(
  compose(
    graphql(gql(integrationQueries.integrations), {
      name: 'integrationsQuery'
    }),
    graphql(gql(kbQueries.knowledgeBaseTopics), { name: 'kbTopicsQuery' })
  )(FormContainer)
);
