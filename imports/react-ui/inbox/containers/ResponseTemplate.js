import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { ResponseTemplate } from '../components';

const ResponseTemplateContainer = props => {
  const { brandsQuery, responseTemplatesQuery } = props;

  if (responseTemplatesQuery.loading || brandsQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands,
    responseTemplates: responseTemplatesQuery.responseTemplates,
  };

  return <ResponseTemplate {...updatedProps} />;
};

ResponseTemplateContainer.propTypes = {
  object: PropTypes.object,
  brandsQuery: PropTypes.object,
  responseTemplatesQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
        }
      }
    `,
    { name: 'brandsQuery' },
  ),
  graphql(
    gql`
      query responseTemplates {
        responseTemplates {
          _id
          name
          brandId
          content
        }
      }
    `,
    { name: 'responseTemplatesQuery' },
  ),
)(ResponseTemplateContainer);
