import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const Categories = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Categories" */ "./containers/categories/CategoriesList"
    )
);

const PageList = asyncComponent(
  () => import(/* webpackChunkName: "List - Page" */ "./containers/pages/List")
);

const PageDetails = asyncComponent(
  () =>
    import(/* webpackChunkName: "PageDetails" */ "./containers/pages/Detail")
);

const PostList = asyncComponent(
  () => import(/* webpackChunkName: "List - Post" */ "./containers/posts/List")
);

const PostDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PostDetails" */ "./containers/posts/PostDetail"
    )
);

const PermissionGroups = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Setting - Permission Groups" */ "./containers/permission/PermissionList"
    )
);

const SubscriptionProducts = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - Subscription Product" */ "./containers/subscriptionProducts/List"
    )
);

const QuizList = asyncComponent(
  () => import(/* webpackChunkName: "List - Quiz" */ "./containers/quiz/List")
);

const Layout = () => {
  return <Navigate to={`/forums/posts`} />;
};

const PageListComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PageList queryParams={queryParams}  />;
};

const PageDetail = () => {
  const { id } = useParams();

  return <PageDetails id={id} />;
};

const PostListComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PostList queryParams={queryParams} />;
};

const PostDetail = () => {
  const { id } = useParams();

  return <PostDetails _id={id} />;
};

const PermissionGroupsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PermissionGroups queryParams={queryParams}  />;
};

const CategoriesComponent = () => {
  return <Categories />;
};

const SubscriptionProductsComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <SubscriptionProducts queryParams={queryParams} />;
};

const Quiz = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <QuizList queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/forums" element={<Layout />} />

      <Route
        key="/forums/pages"
        path="/forums/pages"
        element={<PageListComponent />}
      />

      <Route
        key="/forum/pages/:id"
        path="/forum/pages/:id"
        element={<PageDetail />}
      />

      <Route
        key="/forums/posts"
        path="/forums/posts"
        element={<PostListComponent />}
      />

      <Route
        key="/forums/posts/:id"
        path="/forums/posts/:id"
        element={<PostDetail />}
      />

      <Route
        key="/forums/categories"
        path="/forums/categories"
        element={<CategoriesComponent />}
      />

      <Route
        key="/forums/permission-groups"
        path="/forums/permission-groups"
        element={<PermissionGroupsComponent />}
      />

      <Route
        key="/forums/subscription-products"
        path="/forums/subscription-products"
        element={<SubscriptionProductsComponent />}
      />

      <Route key="/forums/quizzes" path="/forums/quizzes" element={<Quiz />} />
    </Routes>
  );
};

export default routes;
