import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Component from '../components/List';
import queries from '../graphql/queries';
import mutations from '../graphql/mutations';
import {
  ClientPortalConfigsQueryResponse,
  ClientPortalGetLastQueryResponse,
  ClientPortalTotalQueryResponse
} from '../types';

type ListProps = {
  _id?: string;
  queryParams: any;
} & IRouterProps;

type Props = {
  configsQuery: ClientPortalConfigsQueryResponse;
  totalCountQuery: ClientPortalTotalQueryResponse;
  removeMutation;
} & IRouterProps;

class List extends React.Component<Props & ListProps> {
  render() {
    const {
      history,
      removeMutation,
      configsQuery,
      totalCountQuery,
      ...props
    } = this.props;

    // remove action
    const remove = _id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            Alert.success('You successfully deleted a client portal.');

            history.push('/settings/client-portal');
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const configs = configsQuery.clientPortalGetConfigs || [];
    const totalCount = totalCountQuery.clientPortalConfigsTotalCount || 0;

    const updatedProps = {
      ...props,
      history,
      remove,
      totalCount,
      configs,
      loading: configsQuery.loading || false
    };

    return <Component {...updatedProps} />;
  }
}

const options = () => ({
  refetchQueries: [
    {
      query: gql(queries.getConfigs)
    },
    'clientPortalGetLast',
    'clientPortalGetConfig',
    'clientPortalConfigsTotalCount'
  ]
});

const ListContainer = withProps<ListProps & IRouterProps>(
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
    }),
    graphql<Props, any, any>(gql(mutations.remove), {
      name: 'removeMutation',
      options
    })
  )(List)
);

type LastConfigProps = {
  configGetLastQuery: ClientPortalGetLastQueryResponse;
};

// Getting lastConfig id to currentConfig
const LastConfig = (props: LastConfigProps & ListProps & IRouterProps) => {
  const { configGetLastQuery, history } = props;

  if (configGetLastQuery.loading) {
    return <Spinner objective={true} />;
  }

  const lastConfig = configGetLastQuery.clientPortalGetLast;

  if (lastConfig) {
    routerUtils.setParams(history, { _id: lastConfig._id });
  }

  const extendedProps = {
    _id: lastConfig && lastConfig._id,
    ...props
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
