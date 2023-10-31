import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import SyncHistoryList from '../components/SyncHistoryList';
import { ConfigsQueryResponse, IConfigsMap } from '../types';
import { mutations, queries } from '../graphql';
import React from 'react';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
} & Props;

const SyncHistoryListContainer = (props: FinalProps) => {
  const { updateConfigs, configsQuery } = props;

  const updatedProps = {
    ...props
  };
  return <SyncHistoryList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ConfigsQueryResponse>(gql(queries.configs), {
      name: 'configsQuery',
      options: props => ({
        variables: {
          code: 'DYNAMIC'
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<{}>(gql(mutations.updateConfigs), {
      name: 'updateConfigs'
    })
  )(SyncHistoryListContainer)
);
