import {
  ContentBox,
  Title,
} from '@erxes/ui-settings/src/styles';
import CURRENCIES from '@erxes/ui/src/constants/currencies';
import Header from '@erxes/ui-settings/src/general/components/Header';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import Icon from '@erxes/ui/src/components/Icon';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

type Props = {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
  constants;
};

type State = {
  configsMap: IConfigsMap;
  language: string;
  isSaved: boolean;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap,
      language: props.currentLanguage,
      isSaved: false,
    };
  }

  save = (e) => {
    e.preventDefault();

    const { configsMap, language } = this.state;

    this.setState({ isSaved: true });

    this.props.save(configsMap);

    this.props.changeLanguage(language);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeMultiCombo = (code: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map((el) => el.value);
    }

    this.onChangeConfig(code, value);
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  render() {
    const { configsMap } = this.state;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General system config') },
    ];

    const actionButtons = (
      <Button
        id="generalSettingsSave"
        btnStyle="success"
        onClick={this.save}
        icon="check-circle"
      >
        Save
      </Button>
    );

    const content = (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent
          transparent={true}
          title={__('General settings')}
          beforeTitle={<Icon icon="settings" />}
        >
          <FormGroup>
            <ControlLabel>Main Currency</ControlLabel>
            <FormControl
              componentclass='select'
              name="MainCurrency"
              value={configsMap.MainCurrency}
              options={CURRENCIES}
              onChange={this.onChangeInput.bind(this, 'MainCurrency')}
            />
          </FormGroup>
        </CollapseContent>

      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('System Configuration')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <Header
            title="System configuration"
            description={
              __(
                'Set up your initial account settings so that things run smoothly in unison',
              ) + '.'
            }
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('System Configuration')}</Title>}
            right={actionButtons}
          />
        }
        content={content}
        hasBorder={true}
      />
    );
  }
}

export default GeneralSettings;
