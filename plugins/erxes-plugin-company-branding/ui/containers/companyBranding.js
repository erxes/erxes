import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Spinner, Alert, withProps } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import CompanyBranding from '../components/companybranding'
// import { Console } from 'console';

class CompanyBrandingContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
  }



  saveOrganization = doc => {
    this.props.companyBrandingSave({ variables: { ...doc } })
      .then(e => {
        console.log(e)
      }).catch(error => {
        console.log(error.messege)
      })
  };

  render() {

    const { companyBrandingsQuery } = this.props;

    if (companyBrandingsQuery.loading) {
      return <h1>Its LOADING</h1>
    }


    return (
      <CompanyBranding
        {...this.props}
        save={this.saveOrganization}
        data={companyBrandingsQuery.companyBrandings || {}}
      />
    );
  }
}
export default compose(
  graphql(gql(mutations.companyBrandingSave), {
    name: 'companyBrandingSave'
  }),
  graphql(gql(queries.companyBrandings), {
    name: 'companyBrandingsQuery'
  }),

)(CompanyBrandingContainer);
