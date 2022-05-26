import { useRouter } from "next/router";
import React from "react";
import ArticleDetail from "../../../modules/knowledgeBase/containers/ArticleDetail";
import Layout from "../../../modules/main/containers/Layout";

export default function Category() {
  const router = useRouter();

  return (
    <Layout>
      {(props) => {
        return <ArticleDetail {...props} queryParams={router.query} />;
      }}
    </Layout>
  );
}
