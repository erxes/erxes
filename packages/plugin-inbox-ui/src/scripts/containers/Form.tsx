import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { queries as kbQueries } from '@erxes/ui-knowledgebase/src/graphql';
import { TopicsQueryResponse } from '@erxes/ui-knowledgebase/src/types';
import { queries as integrationQueries } from '@erxes/ui-settings/src/integrations/graphql';
import { IntegrationsQueryResponse } from '@erxes/ui-settings/src/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import Form from '../components/Form';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  integrationsQuery: IntegrationsQueryResponse;
  kbTopicsQuery: TopicsQueryResponse;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const FormContainer = (props: Props & ICommonFormProps) => {
  const { integrationsQuery, kbTopicsQuery } = props;

  if (integrationsQuery.loading || (kbTopicsQuery && kbTopicsQuery.loading)) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsQuery.integrations;

  const kbTopics = (kbTopicsQuery && kbTopicsQuery.knowledgeBaseTopics) || [];

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
    graphql(gql(kbQueries.knowledgeBaseTopics), {
      name: 'kbTopicsQuery',
      skip: !isEnabled('knowledgebase')
    })
  )(FormContainer)
);
