import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { CategoryDetail as DumbCategoryDetail } from "../components";
import { IKbCategory } from "../types";
import { AppConsumer } from "./AppContext";
import queries from "./graphql";

type Props = {
  goToCategories: () => void;
  category: IKbCategory | null;
};

type QueryResponse = {
  knowledgeBaseCategoriesDetail: IKbCategory;
};

const CategoryDetail = (props: ChildProps<Props, QueryResponse>) => {
  const { data } = props;

  if (!data) {
    return null;
  }
  if (data.loading) {
    return <div className="loader bigger top-space" />;
  }
  const extendedProps = {
    ...props,
    category: data.knowledgeBaseCategoriesDetail || null
  };

  return <DumbCategoryDetail {...extendedProps} />;
};

const WithData = graphql<Props, QueryResponse>(
  gql(queries.getKbCategoryQuery),
  {
    options: ({ category }) => ({
      fetchPolicy: "network-only",
      variables: {
        categoryId: category ? category._id : ""
      }
    })
  }
)(CategoryDetail);

const WithContext = () => {
  return (
    <AppConsumer>
      {({ goToCategories, activeCategory }) => (
        <WithData goToCategories={goToCategories} category={activeCategory} />
      )}
    </AppConsumer>
  );
};

export default WithContext;
