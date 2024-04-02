import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import React from "react";
import { Route, Routes } from "react-router-dom";

const KnowledgeBase = asyncComponent(
  () =>
    import(/* webpackChunkName: "KnowledgeBase" */ "./containers/KnowledgeBase")
);

const routes = () => (
  <Routes>
    <Route path="/knowledgeBase/" element={<KnowledgeBase />} />
  </Routes>
);

export default routes;
