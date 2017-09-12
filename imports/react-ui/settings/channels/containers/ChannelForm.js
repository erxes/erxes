import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from '/imports/react-ui/common';
import { ChannelForm } from '../components';

const ChannelFormContainer = props => {
  const { object, integrationsQuery, usersQuery, brandsQuery } = props;

  if (usersQuery.loading || brandsQuery.loading || integrationsQuery.loading) {
    return <Spinner />;
  }

  const integrations = integrationsQuery.integrations || [];
  const members = usersQuery.users || [];

  let selectedIntegrations = [];
  let selectedMembers = [];

  if (object) {
    selectedIntegrations = integrations.filter(integ => object.integrationIds.includes(integ._id));
    selectedMembers = members.filter(u => object.memberIds.includes(u._id));
  }

  const updatedProps = {
    ...props,
    integrations,
    members,
    selectedIntegrations,
    selectedMembers,
  };

  return <ChannelForm {...updatedProps} />;
};

ChannelFormContainer.propTypes = {
  object: PropTypes.object,
  integrationsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  usersQuery: PropTypes.object,
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
    { name: 'integrationsQuery' },
  ),
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
        }
      }
    `,
    { name: 'brandsQuery' },
  ),
  graphql(
    gql`
      query users {
        users {
          _id
          details
        }
      }
    `,
    { name: 'usersQuery' },
  ),
)(ChannelFormContainer);
