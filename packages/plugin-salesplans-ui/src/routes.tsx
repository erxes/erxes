import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import Home from './containers/Home';
import SaleLogDetailsContainer from './containers/SaleLogDetails';

const HomeDefault = () => {
  return <Home />;
  // console.log("wtfffff");
  // return <a>adsafsdfsdf</a>;
};

const selaLogDetail = ({ match, location, history }) => {
  const { _id } = match.params;
  const queryParams = queryString.parse(location.search);

  return (
    <>
      <SaleLogDetailsContainer id={_id} />
      {/* <div>heeeeey</div> */}
    </>
  );
};

// const list = ({ location, history }) => {
//   return (
//     <CarList
//       queryParams={queryString.parse(location.search)}
//       history={history}
//     />
//   );
// };

const routes = () => {
  return (
    <>
      <Route path="/plugin-salesplans/" component={HomeDefault} />
      <Route path="/saleLogDetails/:_id" component={selaLogDetail} />
    </>
  );
};

export default routes;
