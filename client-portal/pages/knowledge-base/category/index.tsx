import { useRouter } from "next/router";
import React from "react";
import CategoryDetail from "../../../modules/knowledgeBase/containers/CategoryDetail";
import Layout from "../../../modules/main/containers/Layout";
import { Store } from "../../../modules/types";

export default function Category() {
  const router = useRouter();

  return (
    <Layout>
      {(props: Store) => {
        return <CategoryDetail {...props} queryParams={router.query} />;
      }}
    </Layout>
  );
}
