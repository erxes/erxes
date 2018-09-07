import * as React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import { queries } from '../graphql';
import { Channels as DumbChannels, Empty } from '../components';

class Channels extends React.Component {
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

Channels.propTypes = {
  currentChannelId: PropTypes.string,
  integrationsCountQuery: PropTypes.object,
  channelDetailQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object
};

const ChannelsContainer = compose(
  graphql(gql(queries.channelDetail), {
    name: 'channelDetailQuery',
    options: ({ currentChannelId }) => ({
      variables: { _id: currentChannelId },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'integrationsCountQuery',
    options: ({ currentChannelId }) => ({
      variables: { channelId: currentChannelId }
    })
  })
)(Channels);

class WithCurrentId extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { lastChannelQuery = {}, history, queryParams: { _id } } = nextProps;

    const { channelsGetLast, loading } = lastChannelQuery;

    if (!_id && channelsGetLast && !loading) {
      routerUtils.setParams(history, { _id: channelsGetLast._id });
    }
  }

  render() {
    const { queryParams: { _id } } = this.props;

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

WithCurrentId.propTypes = {
  lastChannelQuery: PropTypes.object,
  history: PropTypes.object,
  queryParams: PropTypes.object
};

const WithLastChannel = compose(
  graphql(gql(queries.channelsGetLast), {
    name: 'lastChannelQuery',
    skip: ({ queryParams }) => queryParams._id,
    options: ({ queryParams }) => ({
      variables: { _id: queryParams._id },
      fetchPolicy: 'network-only'
    })
  })
)(WithCurrentId);

const WithQueryParams = props => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastChannel {...extendedProps} />;
};

WithQueryParams.propTypes = {
  location: PropTypes.object
};

export default withRouter(WithQueryParams);
