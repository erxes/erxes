import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { Facebook } from '../components';

const FacebookContainer = props => {
  const { brandsQuery } = props;

  if (brandsQuery.loading) {
    return <Spinner />;
  }

  const brands = brandsQuery.brands;

  const save = () => {
    // TODO
    // Meteor.call('integrations.addFacebook', doc, error => {
    //   if (error) {
    //     return Alert.error(error.error);
    //   }
    //
    //   Alert.success('Congrats');
    //   return FlowRouter.go('/settings/integrations/list');
    // });
  };

  const updatedProps = {
    ...props,
    brands,
    save
  };

  return <Facebook {...updatedProps} />;
};

FacebookContainer.propTypes = {
  type: PropTypes.string,
  brandsQuery: PropTypes.object
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
        fetchPolicy: 'network-only'
      })
    }
  )
)(FacebookContainer);
