import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Layout = asyncComponent(() =>
  import(/* webpackChunkName: "List - Forums" */ './components/Layout')
);

const PageList = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/Pages/List')
);

const PageDetails = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/Pages/Detail')
);

const PostList = asyncComponent(() =>
  import(
    /* webpackChunkName: "CustomerDetails" */ './containers/PostsList/List'
  )
);

const PostDetails = asyncComponent(() =>
  import(/* webpackChunkName: "CustomerDetails" */ './containers/PostDetail')
);

const layout = ({ history }) => {
  return <Layout history={history} />;
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

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/forums" component={layout} />

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
    </React.Fragment>
  );
};

export default routes;
