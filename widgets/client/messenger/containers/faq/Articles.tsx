import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { Articles as DumbArticles } from "../../components/faq";
import queries from "../../graphql";
import { IFaqArticle } from "../../types";

type QueryResponse = {
  widgetsKnowledgeBaseArticles: IFaqArticle[];
};

const Articles = (props: ChildProps<{}, QueryResponse>) => {
  const { data } = props;

  if (!data) {
    return null;
  }

  return (
    <DumbArticles
      loading={data.loading}
      articles={data.widgetsKnowledgeBaseArticles || []}
    />
  );
};

type Props = {
  topicId?: string;
  searchString?: string;
  articles?: IFaqArticle[];
};

const WithData = graphql<Props, QueryResponse>(
  gql(queries.faqSearchArticlesQuery),
  {
    options: ownProps => ({
      fetchPolicy: "network-only",
      variables: {
        topicId: ownProps.topicId,
        searchString: ownProps.searchString
      }
    })
  }
)(Articles);

const WithContext = (props: Props) => {
  if (!props.searchString || !props.topicId) {
    return (
      <DumbArticles
        {...props}
        loading={false}
        articles={props.articles || []}
      />
    );
  }

  return <WithData {...props} />;
};

export default WithContext;
