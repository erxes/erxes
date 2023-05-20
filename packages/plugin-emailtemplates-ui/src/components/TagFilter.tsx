import * as compose from 'lodash.flowright';

import { ITag, TagsQueryResponse } from '@erxes/ui-tags/src/types';

import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import CountsByTag from '@erxes/ui/src/components/CountsByTag';
import React from 'react';
import { queries as emailTemplatesQuery } from '../graphql';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import { withProps } from '@erxes/ui/src/utils';

const TagFilterContainer = (props: {
  emailTemplatesCountTagQuery?: any;
  tagsQuery?: TagsQueryResponse;
}) => {
  const { emailTemplatesCountTagQuery, tagsQuery } = props;

  const counts = (emailTemplatesCountTagQuery
    ? emailTemplatesCountTagQuery.emailTemplateCountsByTags
    : null) || { byTag: {} };

  let tagsLoading = false;
  let tags: ITag[] = [];

  if (tagsQuery) {
    tagsLoading = tagsQuery.loading || false;
    tags = tagsQuery.tags || [];
  }

  return (
    <CountsByTag
      tags={tags}
      counts={counts.byTag || {}}
      manageUrl="/tags?type=emailtemplates:emailtemplates"
      loading={tagsLoading}
    />
  );
};

type WrapperProps = {
  abortController?: any;
  type: string;
  loadingMainQuery: boolean;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, CountQueryResponse, any>(
      gql(emailTemplatesQuery.emailTemplatesCountTagQuery),
      {
        name: 'emailTemplatesCountTagQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ type, abortController }) => ({
          variables: { type },
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    ),
    graphql<WrapperProps, TagsQueryResponse, { type: string }>(
      gql(tagQueries.tags),
      {
        name: 'tagsQuery',
        skip: ({ loadingMainQuery }) => loadingMainQuery,
        options: ({ type, abortController }) => ({
          variables: {
            type: type
          },
          context: {
            fetchOptions: { signal: abortController && abortController.signal }
          }
        })
      }
    )
  )(TagFilterContainer)
);
