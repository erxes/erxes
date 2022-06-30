import React from "react";
import CategoriesContainer from "../modules/knowledgeBase/containers/CategoryList";
import ArticleList from './knowledge-base/category/index';
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const { searchValue } = router.query;
  const { type } = router.query;

  if (type === "layout") {
    return <ArticleList type={type} />
  }
  
  return <CategoriesContainer />;
}
