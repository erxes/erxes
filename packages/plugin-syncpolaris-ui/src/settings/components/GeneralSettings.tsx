import { gql } from '@apollo/client';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import { Title } from '@erxes/ui-settings/src/styles';
import client from '@erxes/ui/src/apolloClient';
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { KEY_LABELS } from '../../constants';
import { ContentBox } from '../../styles';
import { IConfigsMap } from '../types';
import Sidebar from './SideBar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  currentMap: IConfigsMap;
  fieldGroups?: IFieldGroup[];
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {

    super(props);

    this.state = {
      currentMap: props.configsMap.POLARIS || {},
    };

    client.query({
      query: gql(fieldQueries.fieldsGroups),
      variables: {
        contentType: 'core:customer',
      },
    }).then(({ data }) => {
      this.setState({ fieldGroups: data?.fieldsGroups })
    });
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.configsMap !== this.props.configsMap) {
      this.setState({ currentMap: this.props.configsMap.POLARIS || {} });
    }
  }

  save = (e) => {
    e.preventDefault();

    const { currentMap } = this.state;
    const { configsMap } = this.props;
    configsMap.POLARIS = currentMap;
    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, value) => {
    let { currentMap } = this.state;
    this.setState({ currentMap: { ...currentMap, [code]: value } });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangeCheck = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  }

  renderItem = (key: string, description?: string) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          value={currentMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  renderCheckbox = (key: string, description?: string) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          componentclass='checkbox'
          value={currentMap[key]}
          onChange={this.onChangeCheck.bind(this, key)}
        />
      </FormGroup>
    );
  };

  renderFields = (key: string, label: string) => {
    const { fieldGroups, currentMap } = this.state;
    const setFieldGroup = (value) => {
      this.setState({ currentMap: { ...currentMap, [key]: { ...currentMap[key] || {}, groupId: value } } });
    }

    const setFormField = (value) => {
      const currentFields = ((fieldGroups || []).find(
        (fg) => fg._id === currentMap[key]?.groupId
      ) || {}).fields;
      const field = currentFields?.find(cf => cf._id === value);
      let propType: string | undefined = undefined

      if (field?.isDefinedByErxes) {
        propType = field.type;
      }
      this.setState({ currentMap: { ...currentMap, [key]: { ...currentMap[key] || {}, fieldId: value, propType } } });
    }

    return (
      <FormGroup>
        <ControlLabel>{__(`${label}`)}</ControlLabel>
        <FormControl
          name="fieldGroup"
          componentclass="select"
          options={[
            { value: "", label: "Empty" },
            ...(fieldGroups || []).map((fg) => ({
              value: fg._id,
              label: `${fg.code} - ${fg.name}`,
            })),
          ]}
          value={currentMap[key]?.groupId}
          onChange={(e) => setFieldGroup((e.target as any).value)}
        />

        <FormControl
          name="formField"
          componentclass="select"
          options={[
            { value: "", label: "Empty" },
            ...(
              (
                (
                  (fieldGroups || []).find(
                    (fg) => fg._id === currentMap[key]?.groupId
                  ) || {}
                ).fields || []
              ) || []
            ).map((f) => ({
              value: f._id,
              label: `${f.code} - ${f.text}`,
            })),
          ]}
          value={currentMap[key]?.fieldId}
          onChange={(e) => setFormField((e.target as any).value)}
        />
      </FormGroup>
    );
  };

  renderContent = () => {
    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent
          title="General settings"
          beforeTitle={<Icon icon="settings" />}
          transparent={true}
          open={true}
        >
          {this.renderItem('apiUrl')}
          {this.renderItem('companyCode')}
          {this.renderItem('role')}
          {this.renderItem('token')}
          {this.renderCheckbox('isPush', 'Is Push')}

          {this.renderFields('registerField', 'Register NO field')}
          {this.renderFields('codeField', 'Code field')}
        </CollapseContent>
      </ContentBox>
    );
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Sync polaris config') },
    ];

    const actionButtons = (
      <Button
        btnStyle="success"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Sync polaris config')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Sync polaris configs')}</Title>}
            right={actionButtons}
            background="colorWhite"
          />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default GeneralSettings;
