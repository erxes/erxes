import { Redirect, Route } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const Categories = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Categories" */ './containers/categories/CategoriesList'
  )
);

const PageList = asyncComponent(() =>
  import(/* webpackChunkName: "List - Page" */ './containers/pages/List')
);

const PageDetails = asyncComponent(() =>
  import(/* webpackChunkName: "PageDetails" */ './containers/pages/Detail')
);

const PostList = asyncComponent(() =>
  import(/* webpackChunkName: "List - Post" */ './containers/posts/List')
);

const PostDetails = asyncComponent(() =>
  import(/* webpackChunkName: "PostDetails" */ './containers/posts/PostDetail')
);

const PermissionGroups = asyncComponent(() =>
  import(
    /* webpackChunkName: "Setting - Permission Groups" */ './containers/permission/PermissionList'
  )
);

const SubscriptionProducts = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - Subscription Product" */ './containers/subscriptionProducts/List'
  )
);

const QuizList = asyncComponent(() =>
  import(/* webpackChunkName: "List - Quiz" */ './containers/quiz/List')
);

const layout = () => {
  return <Redirect to={`/forums/posts`} />;
};

const pageList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <PageList queryParams={queryParams} history={history} />;
};

const pageDetail = ({ match }) => {
  const id = match.params.id;

  return <PageDetails id={id} />;
};

const postList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <PostList queryParams={queryParams} history={history} />;
};

const postDetail = ({ match }) => {
  const id = match.params.id;

  return <PostDetails _id={id} />;
};

const permissionGroups = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <PermissionGroups queryParams={queryParams} history={history} />;
};

const categories = () => {
  return <Categories />;
};

const subscriptionProducts = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <SubscriptionProducts queryParams={queryParams} history={history} />;
};

const quiz = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <QuizList queryParams={queryParams} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/forums" exact={true} component={layout} />

      <Route
        key="/forums/pages"
        exact={true}
        path="/forums/pages"
        component={pageList}
      />

      <Route
        key="/forum/pages/:id"
        exact={true}
        path="/forum/pages/:id"
        component={pageDetail}
      />

      <Route
        key="/forums/posts"
        exact={true}
        path="/forums/posts"
        component={postList}
      />

      <Route
        key="/forums/posts/:id"
        exact={true}
        path="/forums/posts/:id"
        component={postDetail}
      />

      <Route
        key="/forums/categories"
        exact={true}
        path="/forums/categories"
        component={categories}
      />

      <Route
        key="/forums/permission-groups"
        exact={true}
        path="/forums/permission-groups"
        component={permissionGroups}
      />

      <Route
        key="/forums/subscription-products"
        exact={true}
        path="/forums/subscription-products"
        component={subscriptionProducts}
      />

      <Route
        key="/forums/quizzes"
        exact={true}
        path="/forums/quizzes"
        component={quiz}
      />
    </React.Fragment>
  );
};

export default routes;
