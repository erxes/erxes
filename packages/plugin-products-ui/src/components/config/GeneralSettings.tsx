import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { Title } from '@erxes/ui-settings/src/styles';
import { __ } from '@erxes/ui/src/utils';
import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import Select from 'react-select-plus';
import { ContentBox } from '../../styles';
import { IConfigsMap, IUom } from '../../types';
import Header from './Header';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
  uoms: IUom[];
};

type State = {
  currentMap: IConfigsMap;
  is_uom: boolean;
  defaultUOM: string;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMap: props.configsMap || {},
      is_uom: props.configsMap.isRequireUOM || false,
      defaultUOM: props.configsMap.defaultUOM ? props.configsMap.defaultUOM : ''
    };
  }

  save = e => {
    e.preventDefault();

    const { currentMap } = this.state;
    this.props.save(currentMap);
  };

  onChangeConfig = (code: string, value) => {
    const { currentMap } = this.state;

    currentMap[code] = value;

    this.setState({ currentMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangeCheckbox = (code: string, e) => {
    const checked = e.target.checked;
    this.setState({ is_uom: checked });
    this.onChangeConfig(code, checked);
  };

  onChangeCombobox = (code: string, option) => {
    const value = option.value;
    this.setState({ defaultUOM: value });
    this.onChangeConfig(code, value);
  };

  renderCheckbox = (key: string, title?: string, description?: string) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={currentMap[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
  };

  renderCombobox = (key: string, title?: string, description?: string) => {
    const { uoms } = this.props;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <Select
          value={this.state.defaultUOM}
          onChange={this.onChangeCombobox.bind(this, key)}
          options={uoms.map(e => ({ value: e._id, label: e.name }))}
        />
      </FormGroup>
    );
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Products config') }
    ];

    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    );

    const content = (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent title="General settings">
          {this.renderCheckbox('isRequireUOM', 'is Required UOM', '')}
          {this.state.is_uom &&
            this.renderCombobox('defaultUOM', 'default uom')}
        </CollapseContent>
      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Products config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Products configs')}</Title>}
            right={actionButtons}
            wideSpacing
          />
        }
        leftSidebar={<Sidebar />}
        content={content}
        transparent={true}
        hasBorder
      />
    );
  }
}

export default GeneralSettings;
