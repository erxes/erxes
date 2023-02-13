import { Redirect, Route } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const Categories = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Forums" */ './containers/categories/CategoriesList'
  )
);

const PageList = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/pages/List')
);

const PageDetails = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/pages/Detail')
);

const PostList = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/posts/List')
);

const PostDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "CustomerDetails" */ './containers/posts/PostDetail'
  )
);

const PermissionGroups = asyncComponent(() =>
  import(
    /* webpackChunkName: "CustomerDetails" */ './containers/permission/PermissionList'
  )
);

const SubscriptionProducts = asyncComponent(() =>
  import(
    /* webpackChunkName: "CustomerDetails" */ './containers/subscriptionProducts/List'
  )
);

const QuizList = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/quiz/List')
);

const QuizNew = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/quiz/New')
);

const QuizDetail = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/quiz/Detail')
);

const QuizEdit = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/quiz/Edit')
);

const layout = () => {
  return <Redirect to={`/forums/posts`} />;
};

const pageList = () => {
  return <PageList />;
};

const pageDetail = ({ match }) => {
  const id = match.params.id;

  return <PageDetails id={id} />;
};

const postList = () => {
  return <PostList />;
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

const quiz = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <QuizList />;
};

const quiznew = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <QuizNew />;
};

const quizDetail = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <QuizDetail />;
};

const quizEdit = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <QuizEdit />;
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

      <Route
        key="/forums/quizzes/new"
        exact={true}
        path="/forums/quizzes/new"
        component={quiznew}
      />

      <Route
        key="/forums/quizzes/:quizId"
        exact={true}
        path="/forums/quizzes/:quizId"
        component={quizDetail}
      />

      <Route
        key="/forums/quizzes/:quizId/edit"
        exact={true}
        path="/forums/quizzes/:quizId/edit"
        component={quizEdit}
      />
    </React.Fragment>
  );
};

export default routes;
