import { gql } from '@apollo/client';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import client from '@erxes/ui/src/apolloClient';
import { Button, HeaderDescription } from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import { ContentBox } from '../../styles';
import { IConfigsMap } from '../../types';
import PerSettings from './PerSimilarityGroup';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
  fieldGroups: IFieldGroup[];
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
      fieldGroups: []
    };

    if (isEnabled('forms')) {
      client
        .query({
          query: gql(fieldQueries.fieldsGroups),
          variables: {
            contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT
          }
        })
        .then(({ data }) => {
          this.setState({
            fieldGroups: data ? data.fieldsGroups : [] || []
          });
        });
    }
  }

  add = e => {
    e.preventDefault();
    const { configsMap } = this.state;

    this.setState({
      configsMap: {
        ...configsMap,
        similarityGroup: {
          ...configsMap.similarityGroup,
          newSimilarityGroup: {
            title: 'New similiraty group',
            codeMask: '',
            rules: []
          }
        }
      }
    });
  };

  delete = (currentConfigKey: string) => {
    const { configsMap } = this.state;
    const similarityGroup = { ...configsMap.similarityGroup };
    delete similarityGroup[currentConfigKey];
    delete similarityGroup['newSimilarityGroup'];

    const newMap = { ...configsMap, similarityGroup };
    this.setState({ configsMap: newMap });

    this.props.save(newMap);
  };

  renderConfigs(configs) {
    return Object.keys(configs).map(key => {
      return (
        <PerSettings
          key={key}
          configsMap={this.state.configsMap}
          config={configs[key]}
          currentConfigKey={key}
          save={this.props.save}
          delete={this.delete}
          fieldGroups={this.state.fieldGroups}
        />
      );
    });
  }

  renderContent() {
    const { configsMap } = this.state;
    const configs = configsMap.similarityGroup || {};

    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        {this.renderConfigs(configs)}
      </ContentBox>
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Products similarity group config') }
    ];

    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.add}
        icon="plus"
        uppercase={false}
      >
        New config
      </Button>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Products similarity group config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/25.svg"
            title="Products similiraty config"
            description=""
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Products similarity configs')}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default GeneralSettings;
