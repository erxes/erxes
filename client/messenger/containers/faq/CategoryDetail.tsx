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

  if (!data || data.loading) {
    return null;
  }

  const extendedProps = {
    ...props,
    category: data.knowledgeBaseCategoriesDetail || null
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
