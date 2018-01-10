import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, gql, graphql } from 'react-apollo';
import { router as routerUtils } from 'modules/common/utils';
import { IntegrationList } from './';

const Channels = props => {
  const { channelsQuery, history } = props;

  const channels = channelsQuery.channels || [];

  const updatedProps = {
    ...props,
    channels,
    loading: channelsQuery.loading
  };

  if (channelsQuery.loading) {
    return null;
  }

  if (!routerUtils.getParam(history, 'id')) {
    const firstChannel = channels[0];
    routerUtils.setParams(history, { id: firstChannel._id });
  }

  return <IntegrationList {...updatedProps} />;
};

Channels.propTypes = {
  channelsQuery: PropTypes.object,
  history: PropTypes.object
};

export default withRouter(
  compose(
    graphql(
      gql`
        query channels($page: Int, $perPage: Int, $memberIds: [String]) {
          channels(page: $page, perPage: $perPage, memberIds: $memberIds) {
            _id
            name
            description
            integrationIds
            memberIds
          }
        }
      `,
      {
        name: 'channelsQuery',
        options: () => {
          return {
            notifyOnNetworkStatusChange: true,
            perPage: 20
          };
        }
      }
    )
  )(Channels)
);
