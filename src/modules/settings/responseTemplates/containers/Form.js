import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Form } from '../components';
import { Spinner } from 'modules/common/components';

const FormContainer = props => {
  const { brandsQuery } = props;

  if (brandsQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands
  };

  return <Form {...updatedProps} />;
};

FormContainer.propTypes = {
  object: PropTypes.object,
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
    { name: 'brandsQuery' }
  )
)(FormContainer);
