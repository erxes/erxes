import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Sidebar } from 'modules/layout/components';
import { UserDetails } from '../components';

const UserDetailsContainer = (props, context) => {
  const { userDetailQuery } = props;

  if (userDetailQuery.loading) {
    return (
      <Sidebar full>
        <Spinner />
      </Sidebar>
    );
  }

  const updatedProps = {
    ...props,
    user: userDetailQuery.userDetail,
    currentUser: context.currentUser
  };

  return <UserDetails {...updatedProps} />;
};

UserDetailsContainer.propTypes = {
  id: PropTypes.string,
  userDetailQuery: PropTypes.object
};

UserDetailsContainer.contextTypes = {
  currentUser: PropTypes.object
};

const userDetail = gql`
  query userDetail($_id: String) {
    userDetail(_id: $_id) {
      username
      email
      role
      conversations {
        _id
        content
      }
      details {
        avatar
        fullName
        position
        location
        description
        twitterUsername
      }
      links {
        linkedIn
        twitter
        facebook
        github
        youtube
        website
      }
    }
  }
`;

export default compose(
  graphql(userDetail, {
    name: 'userDetailQuery',
    options: ({ id }) => ({
      variables: {
        _id: id
      }
    })
  })
)(UserDetailsContainer);
