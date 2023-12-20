import client from '@erxes/ui/src/apolloClient';
import { Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { IAsset } from '../../../common/types';
import { queries } from '../../graphql';
import AssignArticles from '../../components/actions/Assign/Assign';

type Props = {
  objects?: IAsset[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  queryParams: any;
  assignedArticleIds?: string[];
  closeModal: () => void;
  assetId?: string;
};

type FinalProps = {
  knowledgeBaseTopics: any;
  assetKbDetail: any;
} & Props;

function AssignContainer(props: FinalProps) {
  const { assignedArticleIds, knowledgeBaseTopics, assetKbDetail } = props;

  const [articles, setArticles] = React.useState<any>([]);

  const loadArticles = categoryIds => {
    client
      .query({
        query: gql(queries.knowledgeBaseArticles),
        fetchPolicy: 'network-only',
        variables: { categoryIds, perPage: 500 }
      })
      .then(({ data }) => {
        const kbArticles = data.knowledgeBaseArticles || [];
        const articleIds = articles.map(article => article._id);

        const uniqueArticles = kbArticles.filter(
          kbArticle => !articleIds.includes(kbArticle._id)
        );

        setArticles([...articles, ...uniqueArticles]);
      });
  };

  const selectedArticleIds =
    assetKbDetail?.assetDetail?.kbArticleIds || assignedArticleIds || [];

  const updatedProps = {
    ...props,
    kbTopics: knowledgeBaseTopics.knowledgeBaseTopics || [],
    loadArticles,
    loadedArticles: articles,
    selectedArticleIds: [...selectedArticleIds],
    loading: knowledgeBaseTopics.loading
  };

  return <AssignArticles {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql(gql(queries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopics'
    })
  )(AssignContainer)
);
