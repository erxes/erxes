import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { mutations } from '../graphql';
import { Alert } from 'modules/common/utils';
import { CommonMerge } from '../components';

const CustomerMergeContainer = props => {
  const { datas } = props;

  if (datas.length !== 2) {
    // Alert.warning('You can only merge 2 customers at a time!');
    console.log('You can only merge 2 customers at a time!');
  }

  const updatedProps = {
    ...props
  };

  return <CommonMerge {...updatedProps} />;
};

CustomerMergeContainer.propTypes = {
  datas: PropTypes.array
};

CustomerMergeContainer.contextTypes = {
  closeModal: PropTypes.func
};

export default compose()(CustomerMergeContainer);
