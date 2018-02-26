import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { List } from '../components';

const ProductListContainer = props => {
  const { productsQuery, addMutation, editMutation, removeMutation } = props;

  const products = productsQuery.products || [];

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeMutation({
        variables: { _id }
      })
        .then(() => {
          productsQuery.refetch();

          Alert.success('Successfully deleted.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // create or update action
  const save = ({ doc }, callback, product) => {
    let mutation = addMutation;
    // if edit mode
    if (product) {
      mutation = editMutation;
      doc._id = product._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        productsQuery.refetch();

        Alert.success('Successfully saved!');
        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    products,
    save,
    remove,
    loading: productsQuery.loading
  };

  return <List {...updatedProps} />;
};

ProductListContainer.propTypes = {
  productsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.products), {
    name: 'productsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.productAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.productEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.productRemove), {
    name: 'removeMutation'
  })
)(ProductListContainer);
