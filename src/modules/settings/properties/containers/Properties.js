import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';
import gql from 'graphql-tag';
import { Properties } from '../components';

const PropertiesContainer = props => {
  const { fieldsQuery } = props;
  console.log(fieldsQuery);

  const updatedProps = {
    ...props
  };

  return <Properties {...updatedProps} />;
};

PropertiesContainer.propTypes = {
  fieldsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.fieldsgroups), {
    name: 'fieldsQuery',
    options: {
      variables: {
        contentType: 'Customer'
      }
    }
  })
)(PropertiesContainer);
