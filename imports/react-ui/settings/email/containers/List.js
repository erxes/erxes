import React, { PropTypes } from 'react';
import { gql, graphql, compose } from 'react-apollo';
import { List } from '../components';

const ListContainer = props => {
  const { listQuery } = props;

  if (listQuery.loading) {
    return null;
  }

  const brands = listQuery.brands;

  const updatedProps = {
    ...this.props,
    refetch: listQuery.refetch,
    brands,
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  listQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
    query objects($limit: Int!) {
      brands(limit: $limit) {
        _id
        name
        code
        emailConfig
      }
    }
  `,
    {
      name: 'listQuery',
      options: () => {
        return {
          variables: {
            limit: 100,
          },
        };
      },
    },
  ),
)(ListContainer);
