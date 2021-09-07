import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import CompanyBranding from '../components/companyBranding'
import {
  ConfigsQueryResponse,
  IConfigsMap
} from '../general/types';
import {
  Wrapper, Alert
} from 'erxes-ui';
type FinalProps = {
  configsQuery: ConfigsQueryResponse;
  updateConfigs: (configsMap: IConfigsMap) => Promise<void>;
}
class CompanyBrandingContainer extends React.Component {
  constructor(props: FinalProps) {
    super(props)

    this.state = {}
  }


  saveCompanyBranding = doc => {
    const { companyBrandings, updateConfigs } = this.props
    const data = companyBrandings.companyBrandings || {}
    const { loginPageLogo,
      mainIcon,
      favicon,
      textColor,
      backgroundColor,
      pageDesc,
      url,
      map } = doc

    updateConfigs({
      variables: { configsMap: map }
    })

    if (Object.keys(data).length === 0) {
      return this.props.companyBrandingSave({ variables: { loginPageLogo, mainIcon, favicon, textColor, backgroundColor, pageDesc, url } })
        .then(e => {
          Alert.success('Saved successfully');
          companyBrandings.refetch()
        }).catch(error => {
          Alert.error("cant save")
        })
    }



    return this.props.companyBrandingEdit({ variables: { _id: data._id, loginPageLogo, mainIcon, favicon, textColor, backgroundColor, pageDesc, url } }).then(e => {
      Alert.success('Saved successfully');
      companyBrandings.refetch()
    }).catch(error => {
      Alert.error("cant save")
    })


  }

  render() {

    const { configsQuery, companyBrandings } = this.props
    if (configsQuery.loading) {
      return null;
    }

    const configs = configsQuery.configs || [];

    const configsMap = {};

    for (const config of configs) {
      configsMap[config.code] = config.value;
    }
    const content = (
      <CompanyBranding
        {...this.props}
        save={this.saveCompanyBranding}
        data={companyBrandings.companyBrandings || {}}
        configsMap={configsMap}
      />
    )
    return (
      <Wrapper
        content={content}
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
  graphql(gql(mutations.updateConfigs), {
    name: 'updateConfigs'
  }),
  graphql(gql(queries.companyBrandings), {
    name: 'companyBrandings'
  }),
  graphql(gql(queries.configs), {
    name: 'configsQuery'
  })
)(CompanyBrandingContainer)
