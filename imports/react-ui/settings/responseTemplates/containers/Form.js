import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { Form } from '../components';

const FormContainer = props => {
  const { brandsQuery } = props;

  if (brandsQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands,
  };

  return <Form {...updatedProps} />;
};

FormContainer.propTypes = {
  object: PropTypes.object,
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
    { name: 'brandsQuery' },
  ),
)(FormContainer);
