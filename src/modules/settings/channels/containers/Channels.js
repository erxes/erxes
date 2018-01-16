import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { queries } from '../graphql';
import { compose, gql, graphql } from 'react-apollo';
import { router as routerUtils } from 'modules/common/utils';
import { IntegrationList } from './';

const Channels = props => {
  const { channelsQuery, history } = props;
  const queryParams = queryString.parse(props.location.search);
  const channels = channelsQuery.channels || [];

  const updatedProps = {
    ...props,
    channels,
    queryParams,
    loading: channelsQuery.loading,
    refetch: channelsQuery.refetch
  };

  if (channelsQuery.loading) {
    return null;
  }

  if (!routerUtils.getParam(history, 'id')) {
    const firstChannel = channels[0];
    firstChannel && routerUtils.setParams(history, { id: firstChannel._id });
  }

  return <IntegrationList {...updatedProps} />;
};

Channels.propTypes = {
  channelsQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(
  compose(
    graphql(gql(queries.channels), {
      name: 'channelsQuery',
      options: () => {
        return {
          notifyOnNetworkStatusChange: true,
          perPage: 20
        };
      }
    })
  )(Channels)
);
