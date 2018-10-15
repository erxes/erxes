import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils } from 'modules/common/utils';
import queryString from 'query-string';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Channels as DumbChannels, Empty } from '../components';
import { queries } from '../graphql';
import { IChannel } from '../types';

interface IProps extends IRouterProps {
  currentChannelId: string;
  integrationsCountQuery: any;
  channelDetailQuery: any;
}

class Channels extends React.Component<IProps> {
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

const ChannelsContainer = compose(
  graphql(gql(queries.channelDetail), {
    name: 'channelDetailQuery',
    options: ({ currentChannelId }: { currentChannelId: string }) => ({
      variables: { _id: currentChannelId },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'integrationsCountQuery',
    options: ({ currentChannelId }: { currentChannelId: string }) => ({
      variables: { channelId: currentChannelId }
    })
  })
)(Channels);

interface IWithCurrentIdProps extends IRouterProps {
  lastChannelQuery: IChannel;
  queryParams: any;
}

// tslint:disable-next-line:max-classes-per-file
class WithCurrentId extends React.Component<IWithCurrentIdProps> {
  componentWillReceiveProps(nextProps) {
    const {
      lastChannelQuery = {},
      history,
      queryParams: { _id }
    } = nextProps;

    const { channelsGetLast, loading } = lastChannelQuery;

    if (!_id && channelsGetLast && !loading) {
      routerUtils.setParams(history, { _id: channelsGetLast._id });
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

const WithLastChannel = compose(
  graphql(gql(queries.channelsGetLast), {
    name: 'lastChannelQuery',
    skip: ({ queryParams }) => queryParams._id,
    options: ({ queryParams }: { queryParams: any }) => ({
      variables: { _id: queryParams._id },
      fetchPolicy: 'network-only'
    })
  })
)(WithCurrentId);

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastChannel {...extendedProps} />;
};

export default withRouter<IRouterProps>(WithQueryParams);
