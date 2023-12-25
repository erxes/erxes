import React from 'react';
import {
  Box,
  Button,
  DataWithLoader,
  FieldStyle,
  Icon,
  ModalTrigger,
  SidebarList,
  Spinner,
  Tip,
  __,
  router
} from '@erxes/ui/src';
import { ContainerBox, KbTopics } from '../../../../style';
import {
  KbArticlesContainer,
  KbArticles,
  KbTreeViewItem
} from '../../../../style';

import { generateParamsIds } from '../../../../common/utils';

import { IAsset } from '../../../../common/types';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
// import CollapsibleList from '../../../common/CollapsibleList';
import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';
import KnowledgebaseAssignmentFilter from './AssignmentFilter';
import ArticleFilter from '../../../containers/filters/ArticleFilter';

type Props = {
  queryParams: any;
  history: any;
  knowledgeBaseTopics: any[];
  loadArticles: (categoryId: string[]) => void;
  loadedArticles: any[];

  //   selectedArticleIds?: string[];
  loading: boolean;
};

function KnowledgebaseFilter({
  queryParams,
  history,
  knowledgeBaseTopics,
  loadedArticles,
  loading
}: Props) {
  const [knowledgebase, setKnowledgebase] = React.useState<any[]>([]);
  const [queryParamName, setQueryParamName] = React.useState<string>(
    'knowledgebaseCategoryId'
  );

  React.useEffect(() => {
    const topics = knowledgeBaseTopics.flatMap(topic => {
      const { __typename, _id, title, categories } = topic;

      const topicInfo = {
        __typename,
        _id,
        name: title,
        parentId: null,
        numOfCategories: categories.length
      };

      const categoryInfo = topic.categories.map(category => ({
        __typename: category.__typename,
        _id: category._id,
        name: category.title,
        numOfArticles: category.numOfArticles,
        parentId: category.parentCategoryId || _id
      }));

      return [topicInfo, ...categoryInfo];
    });

    setKnowledgebase(topics);
  }, [knowledgeBaseTopics.length]);

  React.useEffect(() => {
    if (
      queryParams.knowledgebaseCategoryId === undefined ||
      queryParams.knowledgebaseCategoryId === null
    ) {
      router.removeParams(history, 'articleIds');
    }
  }, [queryParams.knowledgebaseCategoryId]);

  const categoryIds = (knowledgebase || [])
    .filter(topic => topic.__typename === 'KnowledgeBaseCategory')
    .map(category => category._id);

  const getArticlesCategory = categoryId => {
    return loadedArticles
      .filter(article => article.categoryId === categoryId)
      .map(article => article._id);
  };

  const handleClick = id => {
    const selectedCategory = knowledgebase.find(
      category => category._id === id
    );

    if (selectedCategory.__typename === 'KnowledgeBaseCategory') {
      setQueryParamName('knowledgebaseCategoryId');
      const articleIds = getArticlesCategory(id);
      router.setParams(history, { knowledgebaseCategoryId: id });
      router.setParams(history, { articleIds });
    }
  };

  const renderContent = () => {
    return (
      <SidebarList>
        <CollapsibleList
          items={knowledgebase}
          loading={loading}
          queryParams={queryParams}
          queryParamName={queryParamName}
          treeView={true}
          onClick={handleClick}
        />
      </SidebarList>
    );
  };

  return (
    <>
      <KnowledgebaseAssignmentFilter
        queryParams={queryParams}
        history={history}
      />
      <Box
        title={__('Filter by Knowledgebase')}
        name="assetKnowledgebase"
        isOpen={queryParams.articleIds || queryParams.knowledgebaseCategoryId}
        collapsible={knowledgeBaseTopics.length > 6}
      >
        {renderContent()}
      </Box>
      {queryParams.knowledgebaseCategoryId && (
        <ArticleFilter
          categoryIds={categoryIds}
          queryParams={queryParams}
          history={history}
        />
      )}
    </>
  );
}

export default KnowledgebaseFilter;
