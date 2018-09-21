import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';

type Props = {
  listQuery: any;
};

const ListContainer = (props: Props) => {
  const { listQuery } = props;

  const brands = listQuery.brands || [];

  const updatedProps = {
    ...props,
    refetch: listQuery.refetch,
    brands
  };

  return <List {...updatedProps} />;
};

export default compose(
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
          code
          emailConfig
        }
      }
    `,
    { name: 'listQuery' }
  )
)(ListContainer);
