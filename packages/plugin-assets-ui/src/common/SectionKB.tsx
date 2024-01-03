import React, { useState } from 'react';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { queries } from '../asset/category/graphql';
import {
  ControlLabel,
  Icon,
  Spinner,
  Box,
  BarItems,
  Button,
  Tip
} from '@erxes/ui/src';
import { ContainerBox, KbTopics } from '../style';
import { KbArticlesContainer, KbArticles, KbTreeViewItem } from '../style';
import client from '@erxes/ui/src/apolloClient';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import { generateParamsIds } from './utils';
import { checkKnowledge } from './constant';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  kbTopicsQueryResponse: any;
} & Props;

type Stage = {
  topicsToShow: string[];
  categoriesToShow: string[];
  articles: any[];
};

class SelectKbArticles extends React.Component<FinalProps, Stage> {
  constructor(props) {
    super(props);

    this.state = {
      topicsToShow: [],
      categoriesToShow: [],
      articles: []
    };
  }

  renderArticles(catId) {
    const { categoriesToShow, articles } = this.state;
    const { queryParams, history } = this.props;
    const articleIds = generateParamsIds(queryParams?.articleIds) || [];

    if (!categoriesToShow.includes(catId)) {
      return;
    }

    const handleSelect = articleId => {
      if (articleIds.includes(articleId)) {
        return setParams(history, {
          articleIds: (articleIds || []).filter(id => id !== articleId)
        });
      }

      setParams(history, { articleIds: [...articleIds, articleId] });
    };

    return articles
      .filter(({ categoryId }) => categoryId === catId)
      .map(article => (
        <KbTreeViewItem
          key={article._id}
          className={articleIds.includes(article._id) ? 'active' : ''}
          onClick={handleSelect.bind(this, article._id)}
        >
          <ControlLabel>{article.title}</ControlLabel>
        </KbTreeViewItem>
      ));
  }

  rendeCategories(_id, categories) {
    const { topicsToShow, categoriesToShow } = this.state;
    const { queryParams, history } = this.props;

    if (!topicsToShow.includes(_id)) {
      return;
    }

    const getArticlesCategory = categoryId => {
      return this.state.articles
        .filter(article => article.categoryId === categoryId)
        .map(article => article._id);
    };

    const handleOpen = (e, catId) => {
      e.stopPropagation();
      if (categoriesToShow.includes(catId)) {
        return this.setState({
          categoriesToShow: categoriesToShow.filter(
            topicId => topicId !== catId
          )
        });
      }
      this.setState({
        categoriesToShow: [...categoriesToShow, catId]
      });
    };

    const handleSelect = catId => {
      const articleIds = getArticlesCategory(catId);
      if (
        articleIds.every(articleId =>
          (queryParams?.articleIds || []).includes(articleId)
        )
      ) {
        return removeParams(history, 'articleIds');
      }
      setParams(history, { articleIds });
    };

    return (
      <KbArticlesContainer>
        {(categories || []).map(({ _id, title }) => {
          const articleIds = getArticlesCategory(_id);
          const isSelected =
            !!articleIds?.length &&
            articleIds.every(articleId =>
              (queryParams?.articleIds || []).includes(articleId)
            );

          return (
            <ContainerBox column key={_id}>
              <KbTreeViewItem
                className={isSelected ? 'active' : ''}
                onClick={handleSelect.bind(this, _id)}
              >
                <ContainerBox spaceBetween>
                  <ControlLabel>{title}</ControlLabel>
                  <Icon
                    size={10}
                    onClick={e => handleOpen(e, _id)}
                    icon={
                      categoriesToShow.includes(_id) ? 'downarrow-2' : 'chevron'
                    }
                  />
                </ContainerBox>
              </KbTreeViewItem>
              <KbArticlesContainer>
                {this.renderArticles(_id)}
              </KbArticlesContainer>
            </ContainerBox>
          );
        })}
      </KbArticlesContainer>
    );
  }

  render() {
    const { kbTopicsQueryResponse, queryParams, history } = this.props;
    if (kbTopicsQueryResponse.loading) {
      return <Spinner />;
    }

    const { knowledgeBaseTopics } = kbTopicsQueryResponse;
    const { topicsToShow } = this.state;

    const loadArticles = categoryIds => {
      client
        .query({
          query: gql(queries.knowledgeBaseArticles),
          fetchPolicy: 'network-only',
          variables: { categoryIds }
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

    const clearParams = () => {
      removeParams(history, 'articleIds', 'withKnowledge');
    };

    const handleWithKnowledge = type => {
      if (type === 'Assigned') {
        if (queryParams?.withKnowledge === 'true') {
          return removeParams(history, 'withKnowledge');
        }
        setParams(history, { withKnowledge: true });
      }
      if (type === 'Designated') {
        if (queryParams?.withKnowledge === 'false') {
          return removeParams(history, 'withKnowledge');
        }
        setParams(history, { withKnowledge: false });
      }
    };

    const getBtnStyle = type => {
      if (type === 'Assigned' && queryParams.withKnowledge === 'true') {
        return 'active';
      }
      if (type === 'Designated' && queryParams.withKnowledge === 'false') {
        return 'active';
      }
      return '';
    };

    const extraButtons = (queryParams?.articleIds ||
      ['true', 'false'].includes(queryParams?.withKnowledge)) && (
      <Button btnStyle="link" onClick={clearParams}>
        <Icon icon="cancel-1" />
      </Button>
    );

    return (
      <Box
        title="Filter by Knowledgebase"
        name="filterByKnowledge"
        isOpen
        extraButtons={extraButtons}
      >
        <ContainerBox vertical horizontal column>
          <ContainerBox row spaceAround vertical>
            {checkKnowledge.map(type => (
              <Tip key={type.title} text={type.label} placement="top">
                <KbTreeViewItem
                  className={getBtnStyle(type.title)}
                  onClick={handleWithKnowledge.bind(this, type.title)}
                >
                  <Icon icon={type.icon} />
                  <ControlLabel>{type.title}</ControlLabel>
                </KbTreeViewItem>
              </Tip>
            ))}
          </ContainerBox>
          {(knowledgeBaseTopics || []).map(({ _id, title, categories }) => {
            const handleTopic = () => {
              loadArticles((categories || []).map(category => category._id));

              if (topicsToShow.includes(_id)) {
                return this.setState({
                  topicsToShow: topicsToShow.filter(topicId => topicId !== _id)
                });
              }
              this.setState({ topicsToShow: [...topicsToShow, _id] });
            };

            return (
              <ContainerBox column key={_id}>
                <KbTreeViewItem onClick={handleTopic}>
                  <ContainerBox spaceBetween>
                    <ControlLabel>{title}</ControlLabel>
                    <Icon
                      icon={
                        topicsToShow.includes(_id) ? 'downarrow-2' : 'chevron'
                      }
                      size={10}
                    />
                  </ContainerBox>
                </KbTreeViewItem>
                {this.rendeCategories(_id, categories)}
              </ContainerBox>
            );
          })}
        </ContainerBox>
      </Box>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.knowledgeBaseTopics), {
      name: 'kbTopicsQueryResponse'
    })
  )(SelectKbArticles)
);
