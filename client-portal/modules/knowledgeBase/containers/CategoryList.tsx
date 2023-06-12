import ArticleListContainer from "./ArticleList";
import CategoryList from "../components/CategoryList";
import Layout from "../../main/containers/Layout";
import React from "react";
import Search from "../../main/components/Search";
import { Store } from "../../types";
import { useRouter } from "next/router";

function CategoriesContainer() {
  const router = useRouter();
  const { searchValue } = router.query;

  const renderContent = (props) => {
    if (searchValue) {
      return (
        <ArticleListContainer
          searchValue={searchValue}
          topicId={props.topic._id}
          config={props.config}
        />
      );
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
