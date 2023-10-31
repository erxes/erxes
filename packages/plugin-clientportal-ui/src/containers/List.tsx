import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  Alert,
  confirm,
  router as routerUtils,
  withProps
} from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import Component from '../components/List';
import mutations from '../graphql/mutations';
import queries from '../graphql/queries';
import {
  ClientPortalConfigsQueryResponse,
  ClientPortalGetLastQueryResponse,
  ClientPortalTotalQueryResponse
} from '../types';

type ListProps = {
  _id?: string;
  kind: 'client' | 'vendor';
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

    const configs = configsQuery.clientPortalGetConfigs || [];

    // remove action
    const remove = _id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            Alert.success('You successfully deleted a business portal.');

            if (configs.length > 1) {
              history.push(
                `/settings/business-portal/${props.kind}?_id=${configs[0]._id}`
              );
            } else {
              history.push('/settings/business-portal');
            }

            configsQuery.refetch();
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

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
      options: ({ queryParams, kind }: { queryParams: any; kind: string }) => ({
        variables: {
          page: queryParams.page,
          perPage: queryParams.perPage,
          kind
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

const LastConfigContainer = withProps<ListProps & IRouterProps>(
  compose(
    graphql<Props, ClientPortalGetLastQueryResponse>(
      gql(queries.getConfigLast),
      {
        name: 'configGetLastQuery',
        options: (props: any) => ({
          fetchPolicy: 'network-only',
          variables: {
            kind: props.kind
          }
        })
      }
    )
  )(LastConfig)
);

// Main home component
const MainContainer = (props: ListProps) => {
  const { history } = props;
  const _id = routerUtils.getParam(history, '_id');

  console.log('LastConfigContainer', props);

  if (_id) {
    const extendedProps = { ...props, _id };

    return <ListContainer {...extendedProps} />;
  }

  return <LastConfigContainer {...props} />;
};

export default MainContainer;
