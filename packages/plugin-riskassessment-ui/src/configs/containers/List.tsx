import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { router, withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import ListComponents from '../components/List';
import { mutations, queries } from '../graphql';
import { Alert } from '@erxes/ui/src';
import { refetchQueries } from '../common';
type Props = {
  queryParams: any;
  history: any;
} & IRouterProps;

type FinalProps = {
  configs: any;
  configsTotalCount: any;
  removeConfigs: any;
} & Props;

class List extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }
  render() {
    const { configs, configsTotalCount } = this.props;

    const remove = configIds => {
      this.props
        .removeConfigs({ variables: { configIds } })
        .then(() => {
          Alert.success('Config removed successfully');
        })
        .catch(err => {
          Alert.error(err.message);
        });
    };

    const updatedProps = {
      ...this.props,
      configs: configs?.riskIndicatorConfigs || [],
      totalCount: configsTotalCount.riskIndicatorConfigsTotalCount || 0,
      remove
    };

    return <ListComponents {...updatedProps} />;
  }
}

export const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  sortDirection: Number(queryParams?.sortDirection) || undefined,
  sortField: queryParams?.sortField,
  cardType: queryParams?.cardType,
  boardId: queryParams?.boardId,
  pipelineId: queryParams?.pipelineId,
  stageId: queryParams?.stageId,
  customFieldId: queryParams?.customFieldId
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.configs), {
      name: 'configs',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql<Props>(gql(queries.totalCount), {
      name: 'configsTotalCount',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql<Props>(gql(mutations.removeConfigs), {
      name: 'removeConfigs',
      options: ({ queryParams }) => ({
        refetchQueries: refetchQueries(queryParams)
      })
    })
  )(List)
);
