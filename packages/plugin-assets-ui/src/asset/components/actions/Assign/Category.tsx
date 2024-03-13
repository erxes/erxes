import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IAsset } from '../../../../common/types';
import {
  KbArticlesContainer,
  KbCategories,
  KbCategoriesContainer
} from '../../../../style';
import { ControlLabel, EmptyState, FormControl } from '@erxes/ui/src';
import { ContainerBox } from '../../../../style';
import Article from './Article';

type Props = {
  objects?: IAsset[];
  kbTopics: any[];
  loadArticles: (categoryId: string) => void;
  loadedArticles: any[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
  selectedArticleIds?: string[];
  category: any;
  selectedArticles: string[];
  setSelectedArticles: (selectedArticles: string[]) => void;
};

function Category(props: Props) {
  const {
    loadedArticles,
    selectedArticles,
    setSelectedArticles,
    category
  } = props;

  const [categoriesToShow, setCategoriesToShow] = React.useState<string[]>([]);

  const articleIds = loadedArticles
    .filter(article => article.categoryId === category._id)
    .map(article => article._id);

  const checked =
    !!articleIds?.length &&
    articleIds.every(articleId => selectedArticles.includes(articleId));

  const countArticles =
    articleIds.filter(articleId => selectedArticles.includes(articleId))
      ?.length || 0;

  const handleCategorySelect = () => {
    if (categoriesToShow.includes(category._id)) {
      const updateCategoryIds = categoriesToShow.filter(
        id => id !== category._id
      );
      return setCategoriesToShow(updateCategoryIds);
    }

    setCategoriesToShow([...categoriesToShow, category._id]);
  };

  const handleAllArticlesSelect = () => {
    if (articleIds.every(articleId => selectedArticles.includes(articleId))) {
      const updatedSelectedArticleIds = selectedArticles.filter(
        articleId => !articleIds.includes(articleId)
      );
      return setSelectedArticles(updatedSelectedArticleIds);
    }
    setSelectedArticles([...selectedArticles, ...articleIds]);
  };

  const renderArticles = () => {
    const articles = loadedArticles.filter(
      article => article.categoryId === category._id
    );

    if (!articles?.length) {
      return (
        <EmptyState
          text="There has no article in this knowledgebase category"
          icon="list-ul"
        />
      );
    }

    return (
      <KbArticlesContainer>
        {articles.map(article => {
          const updatedProps = {
            ...props,
            article
          };
          return <Article key={article._id} {...updatedProps} />;
        })}
      </KbArticlesContainer>
    );
  };

  return (
    <>
      <KbCategories onClick={() => handleCategorySelect()}>
        <ContainerBox spaceBetween={true} align="center">
          <ContainerBox gap={5} align="center">
            <FormControl
              componentClass="checkbox"
              onChange={() => handleAllArticlesSelect()}
              checked={checked}
            />
            <ControlLabel>
              <div>{category.title}</div>
            </ControlLabel>
          </ContainerBox>
          <p>{`${countArticles}/${category.numOfArticles}`}</p>
        </ContainerBox>
      </KbCategories>
      {categoriesToShow.includes(category._id) && renderArticles()}
    </>
  );
}

export default Category;
