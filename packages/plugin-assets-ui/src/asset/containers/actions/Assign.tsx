import client from '@erxes/ui/src/apolloClient';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
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
} & { assetKbDetail: any };

const AssignContainer = (props: Props) => {
  const { assignedArticleIds, assetKbDetail } = props;

  const [articles, setArticles] = React.useState<any>([]);

  const knowledgeBaseTopics = useQuery(gql(queries.knowledgeBaseTopics));

  const loadArticles = (categoryIds) => {
    client
      .query({
        query: gql(queries.knowledgeBaseArticles),
        fetchPolicy: 'network-only',
        variables: { categoryIds, perPage: 500 },
      })
      .then(({ data }) => {
        const kbArticles = data.knowledgeBaseArticles || [];
        const articleIds = articles.map((article) => article._id);

        const uniqueArticles = kbArticles.filter(
          (kbArticle) => !articleIds.includes(kbArticle._id),
        );

        setArticles([...articles, ...uniqueArticles]);
      });
  };

  const selectedArticleIds =
    assetKbDetail?.assetDetail?.kbArticleIds || assignedArticleIds || [];

  const updatedProps = {
    ...props,
    kbTopics: knowledgeBaseTopics?.data?.knowledgeBaseTopics || [],
    loadArticles,
    loadedArticles: articles || [],
    selectedArticleIds: [...selectedArticleIds],
    loading: knowledgeBaseTopics.loading,
  };

  return <AssignArticles {...updatedProps} />;
};

export default AssignContainer;
