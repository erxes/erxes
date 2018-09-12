import queryString from 'query-string';
import * as React from 'react';
import { withRouter } from 'react-router';

interface IProps {
  history: any,
  location: any,
  component: any
};

const Reports = (props: IProps) => {
  const queryParams = queryString.parse(props.location.search);
  const Component = props.component;

  const updatedProps = {
    ...props,
    queryParams
  };

  return <Component {...updatedProps} />;
};

export default withRouter(Reports);