import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { ManageIntegrations } from 'modules/settings/integrations/containers/common';
import { integrationsListParams } from 'modules/settings/integrations/containers/utils';
import { queries as integQueries } from 'modules/settings/integrations/graphql';
import { queries, mutations } from '../graphql';

class ManageIntegrationsContainer extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(integrationIds) {
    const { currentChannel, editMutation } = this.props;

    editMutation({
      variables: {
        _id: currentChannel._id,
        name: currentChannel.name,
        integrationIds,
        memberIds: currentChannel.memberIds
      }
    })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  }

  render() {
    const { currentChannel } = this.props;

    const updatedProps = {
      ...this.props,
      current: currentChannel,
      save: this.save
    };

    return <ManageIntegrations {...updatedProps} />;
  }
}

ManageIntegrationsContainer.propTypes = {
  currentChannel: PropTypes.object,
  editMutation: PropTypes.func
};

export default compose(
  graphql(gql(mutations.channelEdit), {
    name: 'editMutation',
    options: ({ queryParams, currentChannel }) => {
      return {
        refetchQueries: [
          {
            query: gql(integQueries.integrations),
            variables: {
              channelId: currentChannel._id,
              ...integrationsListParams(queryParams)
            }
          },
          {
            query: gql(queries.channelDetail),
            variables: { _id: currentChannel._id }
          },
          {
            query: gql(queries.integrationsCount),
            variables: { channelId: currentChannel._id }
          }
        ]
      };
    }
  })
)(ManageIntegrationsContainer);
