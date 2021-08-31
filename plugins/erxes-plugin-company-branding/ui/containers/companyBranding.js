import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Spinner, Alert, withProps } from 'erxes-ui';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import {
  queries as generalQueries,
  mutations as generalMutations
} from '../../../../../erxes-enterprise/ui/src/modules/settings/general/graphql';
import CompanyBranding from '../components/companybranding'
// import { Console } from 'console';

class CompanyBrandingContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  saveOrganization = doc => {
    const { companyBrandings } = this.props

    const data = companyBrandings.companyBrandings || {}

    if (!doc.textColor) {
      return Alert.error('Fill the Company Branding Forms');
    }

    if (Object.keys(data).length === 0) {

      return this.props.companyBrandingSave({ variables: { ...doc } })
        .then(e => {
          Alert.success('Saved successfully');
          companyBrandings.refetch()
        }).catch(error => {
          Alert.error(error.messege)
        })
    }

    if (doc !== data) {

      return this.props.companyBrandingEdit({ variables: { _id: data._id, ...doc } }).then(e => {
        Alert.success('Saved successfully');
        companyBrandings.refetch()
      }).catch(error => {
        Alert.error(error.messege)
      })
    }
  };

  render() {
    const { companyBrandings, configsQuery } = this.props;

    if (companyBrandings.loading && configsQuery.loading) {
      return null
    }

    const configs = configsQuery.configs || [];

    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }
    console.log("default tamplate", this.props)

    return (
      <CompanyBranding
        {...this.props}
        save={this.saveOrganization}
        data={companyBrandings.companyBrandings || {}}
        configsMap={configsMap}
      />
    );
  }
}

export default compose(
  graphql(gql(mutations.companyBrandingSave), {
    name: 'companyBrandingSave'
  }),
  graphql(gql(mutations.companyBrandingEdit), {
    name: 'companyBrandingEdit'
  }),
  graphql(gql(queries.companyBrandings), {
    name: 'companyBrandings'
  }),
  graphql(gql(generalQueries.configs), {
    name: 'configsQuery'
  }),
  graphql(gql(generalMutations.updateConfigs),{
    name: 'updateConfigs'
  }),
)(CompanyBrandingContainer);
