import React from "react";
import CategoriesContainer from "../modules/knowledgeBase/containers/CategoryList";
import ArticleList from './knowledge-base/category/index'

export default function Home() {
  const type = "";

  if (type === "layout") {
    return <ArticleList type={type} />
  }
  
  return <CategoriesContainer />;
}
