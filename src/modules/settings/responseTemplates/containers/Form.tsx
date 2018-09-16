import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Form } from '../components';

type Props = {
  object: any,
  brandsQuery: any
};

const FormContainer = (props: Props) => {
  const { brandsQuery } = props;

  if (brandsQuery.loading) {
    return <Spinner objective />;
  }

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands
  };

  return <Form {...updatedProps} />;
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
