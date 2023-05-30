import client from '@erxes/ui/src/apolloClient';
import { Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { IAsset } from '../../common/types';
import { queries } from '../category/graphql';
import AssignArticles from '../components/AssignArticles';

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

type State = {
  articles: any[];
};

class AssignContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = { articles: [] };
  }

  loadArticles = categoryIds => {
    client
      .query({
        query: gql(queries.knowledgeBaseArticles),
        fetchPolicy: 'network-only',
        variables: { categoryIds, perPage: 500 }
      })
      .then(({ data }) => {
        const kbArticles = data.knowledgeBaseArticles || [];
        const articleIds = this.state.articles.map(article => article._id);

        const uniqueArticles = kbArticles.filter(
          kbArticle => !articleIds.includes(kbArticle._id)
        );

        this.setState({
          articles: [...this.state.articles, ...uniqueArticles]
        });
      });
  };

  render() {
    const {
      knowledgeBaseTopics,
      assetKbDetail,
      assignedArticleIds
    } = this.props;

    if (knowledgeBaseTopics.loading) {
      return <Spinner />;
    }

    const selectedArticleIds =
      assetKbDetail?.assetDetail?.kbArticleIds || assignedArticleIds || [];

    const updatedProps = {
      ...this.props,
      kbTopics: knowledgeBaseTopics.knowledgeBaseTopics || [],
      loadArticles: this.loadArticles,
      loadedArticles: this.state.articles,
      selectedArticleIds: [...selectedArticleIds]
    };

    return <AssignArticles {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql(gql(queries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopics'
    })
  )(AssignContainer)
);
