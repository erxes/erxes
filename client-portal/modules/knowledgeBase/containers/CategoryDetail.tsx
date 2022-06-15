import { gql, useQuery } from "@apollo/client";
import React from "react";
import { Config, Topic } from "../../types";
import CategoryDetail from "../components/CategoryDetail";
import { categoryDetailQuery } from "../graphql/queries";

type Props = {
  queryParams: any;
  topic: Topic;
  config: Config;
};

function CategoryDetailContainer({ queryParams: { id }, ...props }: Props) {
  const { loading, data = {} as any } = useQuery(gql(categoryDetailQuery), {
    variables: { _id: id },
    skip: !id,
  });

  const category = data.knowledgeBaseCategoryDetail || {};

  const updatedProps = {
    ...props,
    loading,
    category,
  };

  return <CategoryDetail {...updatedProps} />;
}

export default CategoryDetailContainer;
