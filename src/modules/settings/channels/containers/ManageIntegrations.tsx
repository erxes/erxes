import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { ManageIntegrations } from 'modules/settings/integrations/containers/common';
import { integrationsListParams } from 'modules/settings/integrations/containers/utils';
import { queries as integQueries } from 'modules/settings/integrations/graphql';
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import { IChannel } from '../types';

type Props = {
  currentChannel: IChannel;
  editMutation: (params: { variables: {
    _id: string;
    name: string;
    integrationIds: string[];
    memberIds: string[];
  } }) => Promise<any>;
  queryParams: any;
};

class ManageIntegrationsContainer extends Component<Props, {}> {
  constructor(props: Props) {
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

export default compose(
  graphql(gql(mutations.channelEdit), {
    name: 'editMutation',
    options: ({ queryParams, currentChannel } : { queryParams: any, currentChannel: IChannel }) => {
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
