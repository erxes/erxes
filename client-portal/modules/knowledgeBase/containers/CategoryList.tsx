import React from "react";
import CategoryList from "../components/CategoryList";
import { Store } from "../../types";
import Layout from "../../main/containers/Layout";
import Search from "../../main/components/Search";
import { useRouter } from 'next/router';
import queryString from 'query-string';
import Articles from '../components/ArticleList';

type Props = {
  category: any;
};

function CategoriesContainer({ category }: Props) {
  const router = useRouter();
  const queryParams = queryString.parse(location.search);
  const { searchValue } = queryParams;

  if (searchValue) {
    return (
      <Articles
        articles={category.articles}
        searchValue={searchValue}
      />
    );
  }

  return (
    <Layout headerBottomComponent={<Search history={router.query}/>} headingSpacing={true}>
    {/* <Layout headingSpacing={true}> */}
      {(props: Store) => {
        return <CategoryList {...props} />;
      }}
    </Layout>
  );
}

export default CategoriesContainer;
