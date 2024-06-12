import React, { useState, useEffect } from "react";
import { Box, SidebarList, __, router } from "@erxes/ui/src";

import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import KnowledgebaseAssignmentFilter from "./AssignmentFilter";
import ArticleFilter from "../../../containers/filters/ArticleFilter";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  knowledgeBaseTopics: any[];
  loadArticles: (categoryId: string[]) => void;
  loadedArticles: any[];

  //   selectedArticleIds?: string[];
  loading: boolean;
};

const KnowledgebaseFilter = (props: Props) => {
  const { queryParams, knowledgeBaseTopics, loadedArticles, loading } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const [knowledgebase, setKnowledgebase] = useState<any[]>([]);
  const [queryParamName, setQueryParamName] = useState<string>(
    "knowledgebaseCategoryId"
  );

  useEffect(() => {
    const topics = knowledgeBaseTopics.flatMap((topic) => {
      const { __typename, _id, title, categories } = topic;

      const topicInfo = {
        __typename,
        _id,
        name: title,
        parentId: null,
        numOfCategories: categories.length,
      };

      const categoryInfo = topic.categories.map((category) => ({
        __typename: category.__typename,
        _id: category._id,
        name: category.title,
        numOfArticles: category.numOfArticles,
        parentId: category.parentCategoryId || _id,
      }));

      return [topicInfo, ...categoryInfo];
    });

    setKnowledgebase(topics);
  }, [knowledgeBaseTopics.length]);

  useEffect(() => {
    if (
      queryParams.knowledgebaseCategoryId === undefined ||
      queryParams.knowledgebaseCategoryId === null
    ) {
      router.removeParams(navigate, location, "articleIds");
    }
  }, [queryParams.knowledgebaseCategoryId]);

  const categoryIds = (knowledgebase || [])
    .filter((topic) => topic.__typename === "KnowledgeBaseCategory")
    .map((category) => category._id);

  const getArticlesCategory = (categoryId) => {
    return loadedArticles
      .filter((article) => article.categoryId === categoryId)
      .map((article) => article._id);
  };

  const handleClick = (id) => {
    const selectedCategory = knowledgebase.find(
      (category) => category._id === id
    );

    if (selectedCategory.__typename === "KnowledgeBaseCategory") {
      setQueryParamName("knowledgebaseCategoryId");
      const articleIds = getArticlesCategory(id);
      router.setParams(navigate, location, {
        knowledgebaseCategoryId: id,
        articleIds,
      });
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
      <KnowledgebaseAssignmentFilter queryParams={queryParams} />
      <Box
        title={__("Filter by Knowledgebase")}
        name="assetKnowledgebase"
        isOpen={queryParams.articleIds || queryParams.knowledgebaseCategoryId}
        collapsible={knowledgeBaseTopics.length > 6}
      >
        {renderContent()}
      </Box>
      {queryParams.knowledgebaseCategoryId && (
        <ArticleFilter categoryIds={categoryIds} queryParams={queryParams} />
      )}
    </>
  );
};

export default KnowledgebaseFilter;
