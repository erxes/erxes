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
  topicId: string;
};

type QueryResponse = {
  knowledgeBaseCategoryDetail: IFaqCategory;
};

const CategoryDetail = (props: ChildProps<Props, QueryResponse>) => {
  const { data } = props;

  let category: IFaqCategory = {
    _id: "",
    title: "",
    description: "",
    articles: [],
    icon: "",
    parentCategoryId: "",
    numOfArticles: 0,
    createdDate: new Date(),
  };
  let loading: boolean = true;

  if (data && data.knowledgeBaseCategoryDetail) {
    category = data.knowledgeBaseCategoryDetail;
    loading = data.loading;
  }

  const extendedProps = {
    ...props,
    category,
    loading,
  };

  return <DumbCategoryDetail {...extendedProps} />;
};

const WithData = graphql<Props, QueryResponse>(
  gql(queries.getFaqCategoryQuery),
  {
    options: ({ categoryId }) => ({
      fetchPolicy: "network-only",
      variables: {
        _id: categoryId,
      },
    }),
  }
)(CategoryDetail);

const WithContext = () => {
  return (
    <AppConsumer>
      {({ changeRoute, activeFaqCategory, getMessengerData }) => {
        const goToCategories = () => {
          changeRoute("conversationList");
        };

        const categoryId = activeFaqCategory && activeFaqCategory._id;

        const topicId = getMessengerData().knowledgeBaseTopicId;

        return (
          <WithData
            goToCategories={goToCategories}
            categoryId={categoryId}
            topicId={topicId}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithContext;
