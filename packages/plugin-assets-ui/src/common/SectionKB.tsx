import { Box, Button, ControlLabel, Icon, Tip } from "@erxes/ui/src";
import { KbArticlesContainer, KbTreeViewItem } from "../style";
import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { removeParams, setParams } from "@erxes/ui/src/utils/router";

import { ContainerBox } from "../style";
import { checkKnowledge } from "./constant";
import client from "@erxes/ui/src/apolloClient";
import { generateParamsIds } from "./utils";
import { queries } from "../asset/graphql";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const SelectKbArticles = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { queryParams } = props;

  const [topicsToShow, setTopicsToShow] = useState<string[]>([]);
  const [categoriesToShow, setCategoriesToShow] = useState<string[]>([]);
  const [articles, setArticles] = useState<any[]>([]);

  const { data: knowledgeBaseTopics } = useQuery(
    gql(queries.knowledgeBaseTopics)
  );

  const renderArticles = (catId) => {
    const articleIds = generateParamsIds(queryParams?.articleIds) || [];

    if (!categoriesToShow.includes(catId)) {
      return;
    }

    const handleSelect = (articleId) => {
      if (articleIds.includes(articleId)) {
        return setParams(navigate, location, {
          articleIds: (articleIds || []).filter((id) => id !== articleId),
        });
      }

      setParams(navigate, location, { articleIds: [...articleIds, articleId] });
    };

    return articles
      .filter(({ categoryId }) => categoryId === catId)
      .map((article) => (
        <KbTreeViewItem
          key={article._id}
          className={articleIds.includes(article._id) ? "active" : ""}
          onClick={handleSelect.bind(this, article._id)}
        >
          <ControlLabel>{article.title}</ControlLabel>
        </KbTreeViewItem>
      ));
  };

  const rendeCategories = (_id, categories) => {
    if (!topicsToShow.includes(_id)) {
      return;
    }

    const getArticlesCategory = (categoryId) => {
      return articles
        .filter((article) => article.categoryId === categoryId)
        .map((article) => article._id);
    };

    const handleOpen = (e, catId) => {
      e.stopPropagation();
      if (categoriesToShow.includes(catId)) {
        return setCategoriesToShow(
          categoriesToShow.filter((topicId) => topicId !== catId)
        );
      }

      setCategoriesToShow([...categoriesToShow, catId]);
    };

    const handleSelect = (catId) => {
      const articleIds = getArticlesCategory(catId);
      if (
        articleIds.every((articleId) =>
          (queryParams?.articleIds || []).includes(articleId)
        )
      ) {
        return removeParams(navigate, location, "articleIds");
      }
      setParams(navigate, location, { articleIds });
    };

    return (
      <KbArticlesContainer>
        {(categories || []).map(({ _id, title }) => {
          const articleIds = getArticlesCategory(_id);
          const isSelected =
            !!articleIds?.length &&
            articleIds.every((articleId) =>
              (queryParams?.articleIds || []).includes(articleId)
            );

          return (
            <ContainerBox $column={true} key={_id}>
              <KbTreeViewItem
                className={isSelected ? "active" : ""}
                onClick={handleSelect.bind(this, _id)}
              >
                <ContainerBox $spaceBetween={true}>
                  <ControlLabel>{title}</ControlLabel>
                  <Icon
                    size={10}
                    onClick={(e) => handleOpen(e, _id)}
                    icon={
                      categoriesToShow.includes(_id) ? "downarrow-2" : "chevron"
                    }
                  />
                </ContainerBox>
              </KbTreeViewItem>
              <KbArticlesContainer>{renderArticles(_id)}</KbArticlesContainer>
            </ContainerBox>
          );
        })}
      </KbArticlesContainer>
    );
  };

  const loadArticles = (categoryIds) => {
    client
      .query({
        query: gql(queries.knowledgeBaseArticles),
        fetchPolicy: "network-only",
        variables: { categoryIds },
      })
      .then(({ data }) => {
        const kbArticles = data.knowledgeBaseArticles || [];
        const articleIds = articles.map((article) => article._id);

        const uniqueArticles = kbArticles.filter(
          (kbArticle) => !articleIds.includes(kbArticle._id)
        );

        setArticles((prevArticles) => [...prevArticles, ...uniqueArticles]);
      });
  };

  const clearParams = () => {
    removeParams(navigate, location, "articleIds", "withKnowledge");
  };

  const handleWithKnowledge = (type) => {
    if (type === "Assigned") {
      if (queryParams?.withKnowledge === "true") {
        return removeParams(navigate, location, "withKnowledge");
      }
      setParams(navigate, location, { withKnowledge: true });
    }
    if (type === "Designated") {
      if (queryParams?.withKnowledge === "false") {
        return removeParams(navigate, location, "withKnowledge");
      }
      setParams(navigate, location, { withKnowledge: false });
    }
  };

  const getBtnStyle = (type) => {
    if (type === "Assigned" && queryParams.withKnowledge === "true") {
      return "active";
    }
    if (type === "Designated" && queryParams.withKnowledge === "false") {
      return "active";
    }
    return "";
  };

  const extraButtons = (queryParams?.articleIds ||
    ["true", "false"].includes(queryParams?.withKnowledge)) && (
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
      <ContainerBox $vertical $horizontal $column>
        <ContainerBox $row $spaceAround $vertical>
          {checkKnowledge.map((type) => (
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
        {(knowledgeBaseTopics.knowledgeBaseTopics || []).map(
          ({ _id, title, categories }) => {
            const handleTopic = () => {
              loadArticles((categories || []).map((category) => category._id));

              if (topicsToShow.includes(_id)) {
                return setTopicsToShow(
                  topicsToShow.filter((topicId) => topicId !== _id)
                );
              }
              setTopicsToShow([...topicsToShow, _id]);
            };

            return (
              <ContainerBox $column key={_id}>
                <KbTreeViewItem onClick={handleTopic}>
                  <ContainerBox $spaceBetween>
                    <ControlLabel>{title}</ControlLabel>
                    <Icon
                      icon={
                        topicsToShow.includes(_id) ? "downarrow-2" : "chevron"
                      }
                      size={10}
                    />
                  </ContainerBox>
                </KbTreeViewItem>
                {rendeCategories(_id, categories)}
              </ContainerBox>
            );
          }
        )}
      </ContainerBox>
    </Box>
  );
};

export default SelectKbArticles;
