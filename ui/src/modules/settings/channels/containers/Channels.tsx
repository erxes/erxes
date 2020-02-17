import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IntegrationsCountQueryResponse } from '../../integrations/types';
import DumbChannels from '../components/Channels';
import Empty from '../components/Empty';
import { queries } from '../graphql';
import {
  ChannelDetailQueryResponse,
  ChannelsGetLastQueryResponse,
  IChannel
} from '../types';

type Props = {
  currentChannelId: string;
};

type FinalProps = {
  integrationsCountQuery: IntegrationsCountQueryResponse;
  channelDetailQuery: ChannelDetailQueryResponse;
} & Props &
  IRouterProps;

class Channels extends React.Component<FinalProps> {
  render() {
    const {
      channelDetailQuery,
      location,
      integrationsCountQuery,
      currentChannelId
    } = this.props;

    let integrationsCount = 0;

    if (!integrationsCountQuery.loading) {
      const byChannel = integrationsCountQuery.integrationsTotalCount.byChannel;
      integrationsCount = byChannel[currentChannelId];
    }

    const extendedProps = {
      ...this.props,
      queryParams: queryString.parse(location.search),
      currentChannel: channelDetailQuery.channelDetail || {},
      loading: channelDetailQuery.loading,
      integrationsCount
    };

    return <DumbChannels {...extendedProps} />;
  }
}

const ChannelsContainer = withProps<Props>(
  compose(
    graphql<Props, ChannelDetailQueryResponse, { _id: string }>(
      gql(queries.channelDetail),
      {
        name: 'channelDetailQuery',
        options: ({ currentChannelId }: { currentChannelId: string }) => ({
          variables: { _id: currentChannelId },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, IntegrationsCountQueryResponse, { channelId: string }>(
      gql(queries.integrationsCount),
      {
        name: 'integrationsCountQuery',
        options: ({ currentChannelId }: { currentChannelId: string }) => ({
          variables: { channelId: currentChannelId }
        })
      }
    )
  )(Channels)
);

type withCurrentIdProps = {
  queryParams?: any;
};

type withCurrentIdFinalProps = {
  lastChannelQuery: IChannel;
} & IRouterProps &
  withCurrentIdProps;

// tslint:disable-next-line:max-classes-per-file
class WithCurrentId extends React.Component<withCurrentIdFinalProps> {
  componentWillReceiveProps(nextProps) {
    const {
      lastChannelQuery = {},
      history,
      queryParams: { _id }
    } = nextProps;

    const { channelsGetLast, loading } = lastChannelQuery;

    if (!_id && channelsGetLast && !loading && !history.location.hash) {
      routerUtils.setParams(history, { _id: channelsGetLast._id }, true);
    }
  }

  render() {
    const {
      queryParams: { _id }
    } = this.props;

    if (!_id) {
      return <Empty {...this.props} />;
    }

    const updatedProps = {
      ...this.props,
      currentChannelId: _id
    };

    return <ChannelsContainer {...updatedProps} />;
  }
}

const WithLastChannel = withProps<withCurrentIdProps>(
  compose(
    graphql<withCurrentIdProps, ChannelsGetLastQueryResponse, { _id: string }>(
      gql(queries.channelsGetLast),
      {
        name: 'lastChannelQuery',
        skip: ({ queryParams }) => queryParams._id,
        options: ({ queryParams }: withCurrentIdProps) => ({
          variables: { _id: queryParams._id },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(WithCurrentId)
);

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastChannel {...extendedProps} />;
};

export default withRouter<IRouterProps>(WithQueryParams);
