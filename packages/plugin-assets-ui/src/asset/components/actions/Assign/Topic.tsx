import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { IAsset } from '../../../../common/types';
import { KbCategoriesContainer, KbTopics } from '../../../../style';
import { ControlLabel, EmptyState, FormControl } from '@erxes/ui/src';
import { ContainerBox } from '../../../../style';
import Category from './Category';

type Props = {
  objects?: IAsset[];
  kbTopics: any[];
  loadArticles: (categoryId: string) => void;
  loadedArticles: any[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
  selectedArticleIds?: string[];
  topic: any;
  selectedArticles: string[];
  setSelectedArticles: (selectedArticles: string[]) => void;
};

function Topic(props: Props) {
  const {
    topic,
    loadArticles,
    loadedArticles,
    selectedArticles,
    setSelectedArticles
  } = props;

  const categoryIds = (topic?.categories || []).map(category => category._id);
  const articleIds = (loadedArticles || [])
    .filter(article => article.topicId === topic._id)
    .map(article => article._id);

  const [topicsToShow, setTopicsToShow] = React.useState<string[]>([]);

  const checked =
    !!articleIds?.length &&
    articleIds.every(articleId => selectedArticles.includes(articleId));

  const handleTopicSelect = () => {
    if (topicsToShow.includes(topic._id)) {
      const updateTopicIds = topicsToShow.filter(id => id !== topic._id);
      return setTopicsToShow(updateTopicIds);
    }

    loadArticles(categoryIds);
    setTopicsToShow([...topicsToShow, topic._id]);
  };

  const renderCategories = () => {
    if (!topic.categories?.length) {
      return (
        <EmptyState
          text="There has no category in this knowledgebase topic"
          icon="list-ul"
        />
      );
    }

    return (
      <KbCategoriesContainer>
        {topic.categories.map(category => {
          const updatedProps = {
            ...props,
            category
          };

          return <Category key={category._id} {...updatedProps} />;
        })}
      </KbCategoriesContainer>
    );
  };

  const handleAllCategoriesSelect = () => {
    if (articleIds.every(articleId => selectedArticles.includes(articleId))) {
      const updatedSelectedArticleIds = selectedArticles.filter(
        articleId => !articleIds.includes(articleId)
      );
      return setSelectedArticles(updatedSelectedArticleIds);
    }
    setSelectedArticles([...selectedArticles, ...articleIds]);
  };

  return (
    <>
      <KbTopics key={topic._id} onClick={() => handleTopicSelect()}>
        <ContainerBox spaceBetween={true} align="center">
          <ContainerBox gap={5} align="center">
            <FormControl
              componentClass="checkbox"
              onChange={() => handleAllCategoriesSelect()}
              checked={checked}
            />
            <ControlLabel>
              <div>{topic.title}</div>
            </ControlLabel>
          </ContainerBox>
        </ContainerBox>
      </KbTopics>
      {topicsToShow.includes(topic._id) && renderCategories()}
    </>
  );
}

export default Topic;
