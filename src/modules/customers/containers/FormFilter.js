import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FormFilter } from '../components';

const FormFilterContainer = props => {
  const { formsQuery } = props;

  const updatedProps = {
    ...props,
    forms: formsQuery.forms || [],
    loading: formsQuery.loading
  };

  return <FormFilter {...updatedProps} />;
};

FormFilterContainer.propTypes = {
  formsQuery: PropTypes.object,
  counts: PropTypes.object
};

export default compose(
  graphql(
    gql`
      query forms {
        forms {
          _id
          title
        }
      }
    `,
    {
      name: 'formsQuery'
    }
  )
)(FormFilterContainer);
