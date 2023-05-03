import client from '@erxes/ui/src/apolloClient';
import { Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { IAsset } from '../../common/types';
import { queries } from '../category/graphql';
import AssignArticles from '../components/AssignArticles';

type Props = {
  objects: IAsset[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  queryParams: any;
  knowledgeData?: any;
  closeModal: () => void;
};

type FinalProps = {
  knowledgeBaseTopics: any;
} & Props;

type State = {
  articles: string[];
};

class AssignContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = { articles: [] };
  }

  loadArticles = categoryId => {
    client
      .query({
        query: gql(queries.knowledgeBaseArticles),
        fetchPolicy: 'network-only',
        variables: { categoryIds: [categoryId] }
      })
      .then(({ data }) => {
        this.setState({ articles: data.knowledgeBaseArticles || [] });
      });
  };

  render() {
    const { knowledgeBaseTopics } = this.props;

    if (knowledgeBaseTopics.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      kbTopics: knowledgeBaseTopics.knowledgeBaseTopics || [],
      loadArticles: this.loadArticles,
      loadedArticles: this.state.articles
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
