import {
  ArticlesTotalCountQueryResponse,
  CategoryDetailQueryResponse,
  ICategory,
  LastCategoryQueryResponse,
} from "@erxes/ui-knowledgebase/src/types";
import { router as routerUtils } from "@erxes/ui/src/utils";

import KnowledgeBaseComponent from "../components/KnowledgeBase";
import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { queries } from "@erxes/ui-knowledgebase/src/graphql";
import queryString from "query-string";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  currentCategoryId: string;
};

const KnowledgeBaseContainer = (props: Props) => {
  const { currentCategoryId } = props;

  const categoryDetailQuery = useQuery<CategoryDetailQueryResponse>(
    gql(queries.knowledgeBaseCategoryDetail),
    {
      variables: { _id: currentCategoryId },
      fetchPolicy: "network-only",
    }
  );

  const articlesCountQuery = useQuery<ArticlesTotalCountQueryResponse>(
    gql(queries.knowledgeBaseArticlesTotalCount),
    {
      variables: { categoryIds: [currentCategoryId] },
      skip: !currentCategoryId,
    }
  );

  const articlesCount =
    articlesCountQuery &&
    articlesCountQuery?.data?.knowledgeBaseArticlesTotalCount;

  const currentCategory =
    categoryDetailQuery &&
    categoryDetailQuery?.data?.knowledgeBaseCategoryDetail;

  const updatedProps = {
    ...props,
    articlesCount: articlesCount || 0,
    currentCategory: currentCategory || ({} as ICategory),
  };

  return <KnowledgeBaseComponent {...updatedProps} />;
};

type WithCurrentIdProps = {
  queryParams: any;
};

const WithLastCategory = (props: WithCurrentIdProps) => {
  const { queryParams } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const lastCategoryQuery = useQuery<LastCategoryQueryResponse>(
    gql(queries.categoriesGetLast),
    {
      skip: queryParams.id,
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    if (!lastCategoryQuery) {
      return;
    }

    if (
      !queryParams._id &&
      lastCategoryQuery?.data?.knowledgeBaseCategoriesGetLast &&
      !lastCategoryQuery.loading
    ) {
      routerUtils.setParams(
        navigate,
        location,
        {
          id: lastCategoryQuery?.data?.knowledgeBaseCategoriesGetLast._id,
        },
        true
      );
    }
  }, [lastCategoryQuery?.data]);

  const updatedProps = {
    ...props,
    currentCategoryId: queryParams.id || "",
  };

  return <KnowledgeBaseContainer {...updatedProps} />;
};

const WithQueryParams = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const extendedProps = { queryParams };

  return <WithLastCategory {...extendedProps} />;
};

export default WithQueryParams;

