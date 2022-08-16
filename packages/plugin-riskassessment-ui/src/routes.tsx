import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() => import(/* webpackChunkName: "List - Riskassessments" */ './containers/List'));

const AnswersList = asyncComponent(() => import(/* webpackChunkName: "List - RiskassessmentsCategories" */ './answers/container/List'));

const riskAssessments = ({ history }) => {
  return <List history={history} />;
};

const riskAnswers = ({ history }) => {
  return <AnswersList history={history} />;
};

const routes = () => {
  return (
    <>
      <Route path="/riskassessments" component={riskAssessments} />
      <Route path="/riskassessment/answers" component={riskAnswers} />
    </>
  );
};

export default routes;
