import * as compose from 'lodash.flowright';

import Form from '../components/Form';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IntegrationsQueryResponse } from '@erxes/ui-inbox/src/settings/integrations/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { TopicsQueryResponse } from '@erxes/ui-knowledgebase/src/types';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries as integrationQueries } from '@erxes/ui-inbox/src/settings/integrations/graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { queries as kbQueries } from '@erxes/ui-knowledgebase/src/graphql';
import { withProps } from '@erxes/ui/src/utils';

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
