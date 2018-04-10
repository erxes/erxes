import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { router as routerUtils } from 'modules/common/utils';
import { queries } from '../graphql';
import { Channels } from '../components';

class ChannelsWithCurrent extends React.Component {
  componentWillReceiveProps() {
    const { history, currentChannelId } = this.props;

    if (!routerUtils.getParam(history, 'id') && currentChannelId) {
      routerUtils.setParams(history, { id: currentChannelId });
    }
  }

  render() {
    const {
      channelDetailQuery,
      location,
      integrationsCountQuery,
      currentChannelId
    } = this.props;

    if (integrationsCountQuery.loading) {
      return <Spinner />;
    }

    const extendedProps = {
      ...this.props,
      queryParams: queryString.parse(location.search),
      currentChannel: channelDetailQuery.channelDetail || {},
      loading: channelDetailQuery.loading,
      refetch: channelDetailQuery.refetch,
      integrationsCount:
        integrationsCountQuery.integrationsTotalCount.byChannel[
          currentChannelId
        ] || 0
    };

    return <Channels {...extendedProps} />;
  }
}

ChannelsWithCurrent.propTypes = {
  currentChannelId: PropTypes.string,
  integrationsCountQuery: PropTypes.object,
  channelDetailQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object
};

//When there is currentChannel id
const ChannelsWithCurrentContainer = compose(
  graphql(gql(queries.channelDetail), {
    name: 'channelDetailQuery',
    options: ({ currentChannelId }) => ({
      variables: { _id: currentChannelId || '' },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'integrationsCountQuery',
    options: ({ currentChannelId }) => ({
      variables: { channelId: currentChannelId || '' }
    })
  })
)(ChannelsWithCurrent);

//Getting lastChannel id to currentChannel
const ChannelsWithLast = props => {
  const { lastChannelQuery } = props;
  const lastChannel = lastChannelQuery.channelsGetLast || {};
  const extendedProps = { ...props, currentChannelId: lastChannel._id };

  return <ChannelsWithCurrentContainer {...extendedProps} />;
};

ChannelsWithLast.propTypes = {
  lastChannelQuery: PropTypes.object
};

const ChannelsWithLastContainer = compose(
  graphql(gql(queries.channelsGetLast), {
    name: 'lastChannelQuery'
  })
)(ChannelsWithLast);

//Main channel component
const MainContainer = props => {
  const { history } = props;
  const currentChannelId = routerUtils.getParam(history, 'id');

  if (currentChannelId) {
    const extendedProps = { ...props, currentChannelId };

    return <ChannelsWithCurrentContainer {...extendedProps} />;
  }

  return <ChannelsWithLastContainer {...props} />;
};

MainContainer.propTypes = {
  history: PropTypes.object
};

export default withRouter(MainContainer);
