import { gql } from '@apollo/client';
import { FIELDS_GROUPS_CONTENT_TYPES } from '@erxes/ui-forms/src/settings/properties/constants';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import client from '@erxes/ui/src/apolloClient';
import {
  Button,
  DataWithLoader,
  EmptyState,
  HeaderDescription,
  Spinner,
} from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';
import { ContentBox } from '../../styles';
import { IConfigsMap } from '../../types';
import PerSettings from './PerSimilarityGroup';
import Sidebar from './Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
  loading: boolean;
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
      fieldGroups: [],
    };

    if (isEnabled('forms')) {
      client
        .query({
          query: gql(fieldQueries.fieldsGroups),
          variables: {
            contentType: FIELDS_GROUPS_CONTENT_TYPES.PRODUCT,
          },
        })
        .then(({ data }) => {
          this.setState({
            fieldGroups: data ? data.fieldsGroups : [] || [],
          });
        });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.configsMap !== this.props.configsMap) {
      this.setState({ configsMap: this.props.configsMap || {} });
    }
  }

  add = (e) => {
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
            rules: [],
          },
        },
      },
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
    return Object.keys(configs).map((key) => {
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
    const { loading } = this.props;
    const configs = configsMap.similarityGroup || {};

    if (loading) {
      return <Spinner objective={true} />;
    }

    if (!loading && Object.keys(configs).length === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Uoms config"
          size="small"
        />
      );
    }

    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        {this.renderConfigs(configs)}
      </ContentBox>
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Products similarity group config') },
    ];

    const actionButtons = (
      <Button
        btnStyle="success"
        onClick={this.add}
        icon="plus-circle"
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
