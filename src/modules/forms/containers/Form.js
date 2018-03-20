import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { queries } from '../graphql';
import { Form } from '../components';

const ListContainer = props => {
  const { brandsQuery, formsQuery, contentTypeId } = props;

  if (brandsQuery.loading) {
    return <Spinner objective />;
  }

  const brands = brandsQuery.brands || [];
  const forms = formsQuery.forms || [];

  const updatedProps = {
    ...this.props,
    brands,
    forms,
    contentTypeId
  };

  return <Form {...updatedProps} />;
};

ListContainer.propTypes = {
  contentTypeId: PropTypes.string,
  brandsQuery: PropTypes.object,
  formsQuery: PropTypes.object,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.forms), {
    name: 'formsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(ListContainer);
