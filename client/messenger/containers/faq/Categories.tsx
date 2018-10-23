import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { Categories as DumbCategories } from "../../components/faq";
import queries from "../../graphql";
import { IFaqTopic } from "../../types";

const Categories = (props: ChildProps<{}, QueryResponse>) => {
  const { data } = props;

  if (!data) {
    return null;
  }

  const extendedProps = {
    ...props,
    loading: data.loading,
    faqTopics: data.knowledgeBaseTopicsDetail
  };

  return <DumbCategories {...extendedProps} />;
};

type QueryResponse = {
  knowledgeBaseTopicsDetail: IFaqTopic;
};

type Props = {
  topicId?: string;
};

const CategoriesWithData = graphql<Props, QueryResponse>(
  gql(queries.getFaqTopicQuery),
  {
    options: ({ topicId }) => ({
      fetchPolicy: "network-only",
      variables: {
        topicId: topicId
      }
    })
  }
)(Categories);

export default CategoriesWithData;
