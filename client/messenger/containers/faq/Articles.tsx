import * as React from "react";
import { ChildProps } from "react-apollo";
import { Articles as DumbArticles } from "../../components/faq";
import { IFaqArticle } from "../../types";

type QueryResponse = {
  knowledgeBaseArticles: IFaqArticle[];
};

const Articles = (props: ChildProps<{}, QueryResponse>) => {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  const extendedProps = {
    articles: data.knowledgeBaseArticles || []
  };

  return <DumbArticles {...extendedProps} />;
};

// const WithData = graphql<{ searchString: string }, QueryResponse>(
//   gql(queries.kbSearchArticlesQuery),
//   {
//     options: ownProps => ({
//       fetchPolicy: "network-only",
//       variables: {
//         topicId: connection.setting.topic_id,
//         searchString: ownProps.searchString
//       }
//     })
//   }
// )(Articles);

export default Articles;
