import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations } from 'modules/companies/graphql';
import { BasicInfo } from 'modules/companies/components';
import { Alert } from 'modules/common/utils';
import { withRouter } from 'react-router-dom';

const BasicInfoContainer = props => {
  const { company, companiesRemove, companiesMerge, history } = props;

  const { _id } = company;

  const remove = () => {
    companiesRemove({
      variables: { companyIds: [_id] }
    })
      .then(() => {
        Alert.success('Success');
        history.push(`/companies?updated`);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const merge = ({ targetId, data }) => {
    companiesMerge({
      variables: {
        companyIds: [_id, targetId],
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

export default compose(
  // mutations
  graphql(gql(mutations.companiesRemove), {
    name: 'companiesRemove'
  }),
  graphql(gql(mutations.companiesMerge), {
    name: 'companiesMerge'
  })
)(withRouter(BasicInfoContainer));
