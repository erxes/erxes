import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { CategoryDetail as DumbCategoryDetail } from "../../components/faq";
import queries from "../../graphql";
import { IFaqCategory } from "../../types";
import { AppConsumer } from "../AppContext";

type Props = {
  goToCategories: () => void;
  categoryId: string | null;
};

type QueryResponse = {
  knowledgeBaseCategoriesDetail: IFaqCategory;
};

const CategoryDetail = (props: ChildProps<Props, QueryResponse>) => {
  const { data } = props;

  let category: IFaqCategory = {
    _id: "",
    title: "",
    description: "",
    articles: [],
    icon: "",
    numOfArticles: 0,
    createdDate: new Date()
  };
  let loading: boolean = true;

  if (data && data.knowledgeBaseCategoriesDetail) {
    category = data.knowledgeBaseCategoriesDetail;
    loading = data.loading;
  }

  const extendedProps = {
    ...props,
    category,
    loading
  };

  return <DumbCategoryDetail {...extendedProps} />;
};

const WithData = graphql<Props, QueryResponse>(
  gql(queries.getFaqCategoryQuery),
  {
    options: ({ categoryId }) => ({
      fetchPolicy: "network-only",
      variables: {
        categoryId
      }
    })
  }
)(CategoryDetail);

const WithContext = () => {
  return (
    <AppConsumer>
      {({ changeRoute, activeCategory }) => {
        const goToCategories = () => {
          changeRoute("conversationList");
        };

        return (
          <WithData
            goToCategories={goToCategories}
            categoryId={activeCategory}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithContext;
