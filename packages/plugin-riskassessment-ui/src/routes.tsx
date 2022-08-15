import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Riskassessments" */ './containers/List')
);

const AssessmentCategoriesList = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - RiskassessmentsCategories" */ './assessmentCategories/container/List'
  )
);
const AnswersList = asyncComponent(() =>
  import(/* webpackChunkName: "List - RiskassessmentsCategories" */ './answers/container/List')
);
const AnswersCategoriesList = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - RiskassessmentsCategories" */ './answerCategories/container/List'
  )
);

const riskAssessments = ({ history }) => {
  return <List history={history} />;
};

const riskAssessmentsCategories = ({ history }) => {
  return <AssessmentCategoriesList history={history} />;
};
const riskAnswers = ({ history }) => {
  return <AnswersList history={history} />;
};
const riskAnswerCategories = ({ history }) => {
  return <AnswersCategoriesList history={history} />;
};

const routes = () => {
  return (
    <>
      <Route path="/riskassessments" component={riskAssessments} />
      <Route path="/riskassessment/categories" component={riskAssessmentsCategories} />
      <Route path="/riskassessment/answers" component={riskAnswers} />
      <Route path="/riskassessment/answer/categories" component={riskAnswerCategories} />
    </>
  );
};

export default routes;
