import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { ResponseTemplate } from '../components';
import { mutations, queries } from '../graphql';

const ResponseTemplateContainer = props => {
  const {
    brandsQuery,
    responseTemplatesQuery,
    saveResponseTemplateMutation
  } = props;

  if (responseTemplatesQuery.loading || brandsQuery.loading) {
    return null;
  }

  const saveResponseTemplate = (variables, callback) => {
    saveResponseTemplateMutation({ variables })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands,
    saveResponseTemplate,
    responseTemplates: responseTemplatesQuery.responseTemplates
  };

  return <ResponseTemplate {...updatedProps} />;
};

ResponseTemplateContainer.propTypes = {
  object: PropTypes.object,
  brandsQuery: PropTypes.object,
  responseTemplatesQuery: PropTypes.object,
  saveResponseTemplateMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.brandList), { name: 'brandsQuery' }),
  graphql(gql(queries.responseTemplateList), {
    name: 'responseTemplatesQuery'
  }),
  graphql(gql(mutations.saveResponseTemplate), {
    name: 'saveResponseTemplateMutation'
  })
)(ResponseTemplateContainer);
