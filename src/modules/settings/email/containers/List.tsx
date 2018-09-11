import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';

const ListContainer = (props: Props) => {
  const { listQuery } = props;

  const brands = listQuery.brands || [];

  const updatedProps = {
    ...this.props,
    refetch: listQuery.refetch,
    brands
  };

  return <List {...updatedProps} />;
};

type Props = {
  listQuery: any
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
