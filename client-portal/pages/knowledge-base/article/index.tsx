import { useRouter } from "next/router";
import React from "react";
import ArticleDetail from "../../../modules/knowledgeBase/containers/ArticleDetail";
import ArticleListContainer from "../../../modules/knowledgeBase/containers/ArticleList";
import Search from "../../../modules/main/components/Search";
import Layout from "../../../modules/main/containers/Layout";
import { Store } from "../../../modules/types";

export default function Category() {
  const router = useRouter();
  const { searchValue } = router.query;

  const renderContent = (props) => {
    if (searchValue) {
      return <ArticleListContainer searchValue={searchValue} />;
    }

    return <ArticleDetail {...props} queryParams={router.query} />;
  };

  return (
    <Layout headerBottomComponent={<Search searchValue={searchValue} />}>
      {(props: Store) => renderContent(props)}
    </Layout>
  );
}
