import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ICommonFormProps } from '../../common/types';
import { Form } from '../components';

type Props = {
  brandsQuery: any;
};

const FormContainer = (props: Props & ICommonFormProps) => {
  const { brandsQuery } = props;

  if (brandsQuery.loading) {
    return <Spinner objective={true} />;
  }

  return <Form {...props} brands={brandsQuery.brands} />;
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
