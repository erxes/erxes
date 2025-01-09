import { gql, useQuery } from '@apollo/client';
import Form from '../components/Form';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries as integrationQueries } from '@erxes/ui-inbox/src/settings/integrations/graphql';
import { queries as kbQueries } from '@erxes/ui-knowledgebase/src/graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IntegrationsQueryResponse } from '@erxes/ui-inbox/src/settings/integrations/types';
import { TopicsQueryResponse } from '@erxes/ui-knowledgebase/src/types';
import React from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const FormContainer: React.FC<Props & ICommonFormProps> = (props) => {
  const { data: integrationsData, loading: integrationsLoading } = useQuery<IntegrationsQueryResponse>(
    gql(integrationQueries.integrations)
  );
  
  const { data: kbTopicsData, loading: kbTopicsLoading } = useQuery<TopicsQueryResponse>(
    gql(kbQueries.knowledgeBaseTopicsShort),
    { skip: !isEnabled('knowledgebase') }
  );

  if (integrationsLoading || kbTopicsLoading) {
    return <Spinner objective={true} />;
  }

  const integrations = integrationsData?.integrations || [];
  const kbTopics = kbTopicsData?.knowledgeBaseTopics || [];

  const updatedProps = {
    ...props,
    messengers: integrations.filter(i => i.kind === 'messenger'),
    leads: integrations.filter(i => i.kind === 'lead'),
    kbTopics,
  };

  return <Form {...updatedProps} />;
};

export default FormContainer;
