import * as React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import queryString from 'query-string';

const Reports = props => {
  const queryParams = queryString.parse(props.location.search);
  const Component = props.component;

  const updatedProps = {
    ...props,
    queryParams
  };

  return <Component {...updatedProps} />;
};

Reports.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  component: PropTypes.func
};

export default withRouter(Reports);
