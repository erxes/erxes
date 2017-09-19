import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { compose, gql, graphql } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { Facebook } from '../components';
import { Spinner } from '/imports/react-ui/common';

const FacebookContainer = props => {
  const { brandsQuery } = props;

  if (brandsQuery.loading) {
    return <Spinner />;
  }

  const brands = brandsQuery.brands;

  const save = doc => {
    Meteor.call('integrations.addFacebook', doc, error => {
      if (error) {
        return Alert.error(error.error);
      }

      Alert.success('Congrats');
      return FlowRouter.go('/settings/integrations/list');
    });
  };

  const updatedProps = {
    ...props,
    brands,
    save,
  };

  return <Facebook {...updatedProps} />;
};

FacebookContainer.propTypes = {
  type: PropTypes.string,
  brandsQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
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
)(FacebookContainer);
