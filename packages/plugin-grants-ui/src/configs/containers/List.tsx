import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import { mutations, queries } from '../graphql';
import { Spinner, confirm } from '@erxes/ui/src';
import { ConfigsQueryResponse } from '../../common/type';
import List from '../components/List';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  listQueryResponse: ConfigsQueryResponse;
  removeConfig: any;
} & Props;

class ConfigsList extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { listQueryResponse, removeConfig } = this.props;

    if (listQueryResponse.loading) {
      return <Spinner />;
    }

    const remove = variables => {
      confirm().then(() => {
        removeConfig({ variables });
      });
    };

    const updatedProps = {
      remove,
      configs: listQueryResponse.grantConfigs,
      totalCount: listQueryResponse.grantConfigsTotalCount
    };

    return <List {...updatedProps} />;
  }
}

export const refetchQueries = () => {
  return [{ query: gql(queries.configs) }];
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.configs), {
      name: 'listQueryResponse'
    }),
    graphql<Props>(gql(mutations.removeConfig), {
      name: 'removeConfig',
      options: params => ({
        refetchQueries: refetchQueries()
      })
    })
  )(ConfigsList)
);
