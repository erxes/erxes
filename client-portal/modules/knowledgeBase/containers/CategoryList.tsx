import React from "react";
import CategoryList from "../components/CategoryList";
import { Store } from "../../types";
import Layout from "../../main/containers/Layout";
import Search from "../../main/components/Search";
import { useRouter } from "next/router";
import Articles from "../components/ArticleList";

type Props = {
  category: any;
};

function CategoriesContainer({ category }: Props) {
  const router = useRouter();
  const { searchValue } = router.query;

  const renderContent = (props) => {
    if (searchValue) {
      console.log(category);
      return <div>{searchValue}</div>;
      return (
        <Articles articles={category.articles} searchValue={searchValue} />
      );
    }

    return <CategoryList {...props} />;
  };

  return (
    <Layout headerBottomComponent={<Search />} headingSpacing={true}>
      {(props: Store) => renderContent(props)}
    </Layout>
  );
}

export default CategoriesContainer;
