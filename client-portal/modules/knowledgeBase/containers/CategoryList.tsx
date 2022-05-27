import React from "react";
import CategoryList from "../components/CategoryList";
import { Store } from "../../types";
import Layout from "../../main/containers/Layout";
import Search from "../../main/components/Search";

function CategoriesContainer() {
  return (
    // <Layout headerBottomComponent={<Search />} headingSpacing={true}>
    <Layout headingSpacing={true}>
      {(props: Store) => {
        return <CategoryList {...props} />;
      }}
    </Layout>
  );
}

export default CategoriesContainer;
