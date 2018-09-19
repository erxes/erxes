import gql from 'graphql-tag';
import { ResponseTemplate } from 'modules/inbox/components/conversationDetail';
import { mutations, queries } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IResponseTemplate } from '../../../settings/responseTemplates/types';

type Props = {
  object: IResponseTemplate,
  brandsQuery: any,
  responseTemplatesQuery: any,
  saveResponseTemplateMutation: (doc: { variables: IResponseTemplate }) => Promise<any>,
};

const ResponseTemplateContainer = (props: Props) => {
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
