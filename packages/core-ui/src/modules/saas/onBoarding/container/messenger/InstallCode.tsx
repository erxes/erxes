import React from 'react';

import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { IntegrationsQueryResponse } from 'modules/saas/onBoarding/types';
import { queries } from 'modules/saas/onBoarding/graphql';
import InstallCode from 'modules/saas/onBoarding/components/messengerScript/InstallCode';

type Props = {};

type FinalProps = { integrationsQuery: IntegrationsQueryResponse } & Props;

function InstallCodes(props: FinalProps) {
  const { integrationsQuery } = props;

  if (integrationsQuery.loading) {
    return null;
  }
  const integrations = integrationsQuery.integrations || [];

  const updatedProps = {
    ...props,
    integration: integrations && integrations[0],
  };

  return <InstallCode {...updatedProps} />;
}

export default compose(
  graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: () => {
      return {
        variables: { kind: 'messenger' },
        fetchPolicy: 'network-only',
      };
    },
  }),
)(InstallCodes);
