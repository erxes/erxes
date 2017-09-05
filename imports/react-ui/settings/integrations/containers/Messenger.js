import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { Messenger } from '../components';
import { saveCallback } from './utils';

const MessengerContainer = props => {
  const { brandsQuery, integration, refetch } = props;

  if (brandsQuery.loading) {
    return null;
  }

  const save = doc => saveCallback({ doc }, 'addMessenger', 'editMessenger', integration, refetch);

  const updatedProps = {
    ...props,
    save,
    brands: brandsQuery.brands,
  };

  return <Messenger {...updatedProps} />;
};

MessengerContainer.propTypes = {
  integration: PropTypes.object,
  brandsQuery: PropTypes.object,
  refetch: PropTypes.func,
};

export default compose(
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
          code
        }
      }
    `,
    {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only',
      }),
    },
  ),
)(MessengerContainer);
