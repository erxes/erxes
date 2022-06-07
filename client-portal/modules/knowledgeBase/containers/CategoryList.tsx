import React from "react";
import CategoryList from "../components/CategoryList";
import { Store } from "../../types";
import Layout from "../../main/containers/Layout";
import Search from "../../main/components/Search";
import { useRouter } from "next/router";
import ArticleListContainer from "./ArticleList";

function CategoriesContainer() {
  const router = useRouter();
  const { searchValue } = router.query;

  const renderContent = (props) => {
    if (searchValue) {
      return <ArticleListContainer searchValue={searchValue} />;
    }

    return <CategoryList {...props} />;
  };

  return (
    <Layout
      headerBottomComponent={<Search searchValue={searchValue} />}
      headingSpacing={true}
    >
      {(props: Store) => renderContent(props)}
    </Layout>
  );
}

export default CategoriesContainer;
