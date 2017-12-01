import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { ChannelForm } from '../components';

const ChannelFormContainer = props => {
  const { object, integrationsQuery, usersQuery } = props;

  if (usersQuery.loading || integrationsQuery.loading) {
    return <Spinner objective />;
  }

  const integrations = integrationsQuery.integrations || [];
  const members = usersQuery.users || [];

  let selectedIntegrations = [];
  let selectedMembers = [];

  if (object) {
    selectedIntegrations = integrations.filter(integ =>
      object.integrationIds.includes(integ._id)
    );
    selectedMembers = members.filter(u => object.memberIds.includes(u._id));
  }

  const updatedProps = {
    ...props,
    integrations,
    members,
    selectedIntegrations,
    selectedMembers
  };

  return <ChannelForm {...updatedProps} />;
};

ChannelFormContainer.propTypes = {
  object: PropTypes.object,
  integrationsQuery: PropTypes.object,
  usersQuery: PropTypes.object
};

export default compose(
  graphql(
    gql`
      query integrations {
        integrations {
          _id
          name
          brand {
            _id
            name
          }
          channels {
            _id
            name
          }
        }
      }
    `,
    {
      name: 'integrationsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }
  ),
  graphql(
    gql`
      query users {
        users {
          _id
          details {
            avatar
            fullName
            position
            twitterUsername
          }
        }
      }
    `,
    {
      name: 'usersQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }
  )
)(ChannelFormContainer);
