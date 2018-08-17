import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { BasicInfo } from 'modules/companies/components';
import { mutations } from 'modules/companies/graphql';

const BasicInfoContainer = props => {
  const { company, companiesRemove, companiesMerge, history } = props;

  const { _id } = company;

  const remove = () => {
    companiesRemove({ variables: { companyIds: [_id] } })
      .then(() => {
        Alert.success('Success');
        history.push('/companies');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const merge = ({ ids, data }) => {
    companiesMerge({
      variables: {
        companyIds: ids,
        companyFields: data
      }
    })
      .then(data => {
        Alert.success('Success');
        history.push(`/companies/details/${data.data.companiesMerge._id}`);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
    merge
  };

  return <BasicInfo {...updatedProps} />;
};

BasicInfoContainer.propTypes = {
  company: PropTypes.object.isRequired,
  companiesRemove: PropTypes.func,
  companiesMerge: PropTypes.func,
  history: PropTypes.object.isRequired
};

BasicInfoContainer.contextTypes = {
  currentUser: PropTypes.object
};

const generateOptions = () => ({
  refetchQueries: ['companieMain', 'companyCounts']
});

export default compose(
  // mutations
  graphql(gql(mutations.companiesRemove), {
    name: 'companiesRemove',
    options: generateOptions
  }),
  graphql(gql(mutations.companiesMerge), {
    name: 'companiesMerge',
    options: generateOptions
  })
)(withRouter(BasicInfoContainer));
