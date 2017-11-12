import React from 'react';
import PropTypes from 'prop-types';
import { gql, graphql, compose } from 'react-apollo';
import { Loading } from 'modules/common/components';
import { List } from '../components';

const ListContainer = props => {
  const { listQuery } = props;

  if (listQuery.loading) {
    return <Loading title="Email appearance" />;
  }

  const brands = listQuery.brands;

  const updatedProps = {
    ...this.props,
    refetch: listQuery.refetch,
    brands
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  listQuery: PropTypes.object
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
    {
      name: 'listQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            params: queryParams
          }
        };
      }
    }
  )
)(ListContainer);
