import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { Twitter } from '../components';

const TwitterContainer = props => {
  const { brandsQuery, type } = props;

  if (brandsQuery.loading) {
    return <Spinner />;
  }

  if (type === 'link') {
    // TODO
    // return Meteor.call('integrations.getTwitterAuthorizeUrl', (err, url) => {
    //   location.href = url;
    // });
  }

  const brands = brandsQuery.brands;

  const save = () => {
    // TODO
    // Meteor.call(
    //   'integrations.addTwitter',
    //   {
    //     brandId,
    //     queryParams: FlowRouter.current().queryParams,
    //   },
    //   error => {
    //     if (error) {
    //       return Alert.success(error.error);
    //     }
    //
    //     Alert.success('Congrats');
    //     return FlowRouter.go('/settings/integrations/list');
    //   },
    // );
  };

  const updatedProps = {
    ...props,
    brands,
    save
  };

  return <Twitter {...updatedProps} />;
};

TwitterContainer.propTypes = {
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
)(TwitterContainer);
