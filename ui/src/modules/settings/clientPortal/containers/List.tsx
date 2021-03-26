import { withProps } from 'erxes-ui/lib/utils/core';
import gql from 'graphql-tag';
import compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Component from '../components/List';
import queries from '../graphql/queries';
import {
  ClientPortalConfigsQueryResponse,
  ClientPortalGetLastQueryResponse,
  ClientPortalTotalQueryResponse
} from '../types';

type ListProps = {
  _id?: string;
  queryParams: any;
  history: any;
};

type Props = {
  configsQuery: ClientPortalConfigsQueryResponse;
  totalCountQuery: ClientPortalTotalQueryResponse;
} & IRouterProps;

class List extends React.Component<Props & ListProps> {
  render() {
    const { configsQuery, totalCountQuery, ...props } = this.props;

    const configs = configsQuery.clientPortalGetConfigs || [];
    const totalCount = totalCountQuery.clientPortalConfigsTotalCount || 0;

    const updatedProps = {
      ...props,
      totalCount,
      configs,
      loading: configsQuery.loading || false
    };

    return <Component {...updatedProps} />;
  }
}

const ListContainer = withProps<ListProps>(
  compose(
    graphql(gql(queries.getConfigs), {
      name: 'configsQuery',
      options: ({ queryParams }: { queryParams: any }) => ({
        variables: {
          page: queryParams.page,
          perPage: queryParams.perPage
        }
      })
    }),
    graphql(gql(queries.getTotalCount), {
      name: 'totalCountQuery'
    })
  )(List)
);

type LastConfigProps = {
  configGetLastQuery: ClientPortalGetLastQueryResponse;
};

// Getting lastConfig id to currentConfig
const LastConfig = (props: LastConfigProps & ListProps) => {
  const { configGetLastQuery, history, queryParams } = props;

  if (configGetLastQuery.loading) {
    return <Spinner objective={true} />;
  }

  const lastConfig = configGetLastQuery.clientPortalGetLast;

  if (lastConfig) {
    routerUtils.setParams(history, { _id: lastConfig._id });
  }

  const extendedProps = {
    history,
    queryParams,
    _id: lastConfig && lastConfig._id
  };

  return <ListContainer {...extendedProps} />;
};

const LastConfigContainer = withProps<ListProps>(
  compose(
    graphql<Props, ClientPortalGetLastQueryResponse, {}>(
      gql(queries.getConfigLast),
      {
        name: 'configGetLastQuery'
      }
    )
  )(LastConfig)
);

// Main home component
const MainContainer = (props: ListProps) => {
  const { history } = props;
  const _id = routerUtils.getParam(history, '_id');

  if (_id) {
    const extendedProps = { ...props, _id };

    return <ListContainer {...extendedProps} />;
  }

  return <LastConfigContainer {...props} />;
};

export default MainContainer;
