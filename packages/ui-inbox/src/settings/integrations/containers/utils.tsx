import gql from 'graphql-tag';
import juice from 'juice';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import sanitizeHtml from 'sanitize-html';
import { queries } from '../graphql';

export const cleanHtml = (content: string) => {
  // all style inlined
  const inlineStyledContent = juice(content);

  return sanitizeHtml(inlineStyledContent, {
    allowedTags: false,
    allowedAttributes: false,
    transformTags: {
      html: 'div',
      body: 'div'
    },

    // remove some unusual tags
    exclusiveFilter: n => {
      return (
        n.tag === 'meta' ||
        n.tag === 'head' ||
        n.tag === 'style' ||
        n.tag === 'base' ||
        n.tag === 'script'
      );
    }
  });
};

export const integrationsListParams = queryParams => ({
  ...generatePaginationParams(queryParams),
  searchValue: queryParams.searchValue,
  kind: queryParams.kind
});

export const getRefetchQueries = (kind: string) => {
  return [
    {
      query: gql(queries.integrations),
      variables: {
        ...integrationsListParams({}),
        kind
      }
    },
    {
      query: gql(queries.integrationTotalCount),
      variables: {
        ...integrationsListParams({}),
        kind
      }
    }
  ];
};
