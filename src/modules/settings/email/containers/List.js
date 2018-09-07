import * as React from 'react';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { List } from '../components';

const ListContainer = props => {
  const { listQuery } = props;

  const brands = listQuery.brands || [];

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
    { name: 'listQuery' }
  )
)(ListContainer);
