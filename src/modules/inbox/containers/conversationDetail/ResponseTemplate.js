import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ResponseTemplate } from 'modules/inbox/components/conversationDetail';
import { mutations, queries } from 'modules/inbox/graphql';

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
        responseTemplatesQuery.refetch();
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
    name: 'responseTemplatesQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.saveResponseTemplate), {
    name: 'saveResponseTemplateMutation',
    options: {
      refetchQueries: [
        {
          query: gql`${queries.responseTemplateList}`
        }
      ]
    }
  })
)(ResponseTemplateContainer);
