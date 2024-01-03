import { Alert } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { router, withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { refetchQueries } from '../common';
import ListComponents from '../components/List';
import { mutations, queries } from '../graphql';
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
      configs: configs?.riskAssessmentsConfigs || [],
      totalCount: configsTotalCount.riskAssessmentsConfigsTotalCount || 0,
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
