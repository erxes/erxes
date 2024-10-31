import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import DumbCategories from "../../components/faq/Categories";
import queries from "../../graphql";
import { IFaqTopic } from "../../types";
import Articles from "./Articles";

const Categories = (props: ChildProps<{}, QueryResponse>) => {
  const { data } = props;

  if (!data) {
    return null;
  }

  const extendedProps = {
    ...props,
    loading: data.loading,
    faqTopics: data.knowledgeBaseTopicDetail
  };

  return <DumbCategories {...extendedProps} />;
};

type QueryResponse = {
  knowledgeBaseTopicDetail: IFaqTopic;
};

type Props = {
  topicId?: string;
  searchString: string;
};

const CategoriesWithData = graphql<Props, QueryResponse>(
  gql(queries.getFaqTopicQuery),
  {
    options: ({ topicId }) => ({
      fetchPolicy: "network-only",
      variables: {
        _id: topicId
      }
    })
  }
)(Categories);

const WithSearch = (props: Props) => {
  if (props.searchString) {
    return <Articles {...props} />;
  }

  return <CategoriesWithData {...props} />;
};

export default WithSearch;
