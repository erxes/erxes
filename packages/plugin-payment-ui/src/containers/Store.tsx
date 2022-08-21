import * as compose from 'lodash.flowright';

// import { ByKindTotalCount, IntegrationsCountQueryResponse } from '../types';
import { getEnv, withProps } from '@erxes/ui/src/utils';

import Home from '../components/Home';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';

type Props = {
  queryParams: any;
  history?: any;
};

type FinalProps = { totalCountQuery: any } & Props;

const Store = (props: FinalProps) => {
  const customLink = (kind: string, addLink: string) => {
    const { REACT_APP_API_URL } = getEnv();
    const url = `${REACT_APP_API_URL}/connect-integration?link=${addLink}&kind=${kind}`;

    window.location.replace(url);
  };

  const totalCount = 1;

  const updatedProps = {
    ...props,
    customLink,
    totalCount
  };

  return <Home {...updatedProps} />;
};

export default Store;
